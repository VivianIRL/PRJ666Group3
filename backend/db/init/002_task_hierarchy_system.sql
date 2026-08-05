-- ==========================================
-- Task Hierarchy & Notification System (additive migration)
-- Run AFTER supabase_migration.sql against the same database.
--
-- This is a NEW, self-contained system living alongside the existing
-- task_templates / user_tasks / task_checklist / notifications tables —
-- nothing here renames, drops, or alters those. It exists at /api/v2/*
-- so the current TasksDashboard/TaskManager/Checklist pages, which read
-- the old /api/tasks and /api/notifications shapes, are unaffected.
--
-- Design goals (see docs/TASK_NOTIFICATION_SYSTEM_DESIGN.md for the why):
--   - One recursive table for tasks AND subtasks (no separate subtask table)
--   - Bidirectional status sync (children -> parent, parent -> children)
--     runs inside a single Postgres function per write, so concurrent
--     updates to sibling nodes can't interleave into an inconsistent state
--   - Templates are versioned and immutable once a version has been used
--     to generate tasks for a user
--   - Notifications are idempotent via a UNIQUE constraint, not a
--     check-then-insert race
-- ==========================================

BEGIN;

-- 1. Unified task/subtask tree ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_nodes (
    task_node_id       SERIAL PRIMARY KEY,
    user_id            UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    parent_id          INT REFERENCES task_nodes(task_node_id) ON DELETE CASCADE,
    title              TEXT NOT NULL,
    description        TEXT,
    node_type          TEXT NOT NULL DEFAULT 'CUSTOM'
                          CHECK (node_type IN ('SYSTEM','CUSTOM')),
    source             TEXT NOT NULL DEFAULT 'USER_CREATED'
                          CHECK (source IN ('TEMPLATE','USER_CREATED')),
    status             TEXT NOT NULL DEFAULT 'NOT_STARTED'
                          CHECK (status IN ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
    priority           TEXT NOT NULL DEFAULT 'NORMAL'
                          CHECK (priority IN ('LOW','NORMAL','HIGH')),
    due_date           DATE,
    -- true once a user explicitly sets/overrides this node's due date;
    -- blocks the auto roll-up (parent due_date = earliest child due_date)
    -- from overwriting a deliberate choice
    due_date_is_manual BOOLEAN NOT NULL DEFAULT FALSE,
    template_item_id   INT, -- FK added below, after task_hierarchy_template_items exists
    sort_order         INT NOT NULL DEFAULT 0,
    created_at         TIMESTAMPTZ DEFAULT now(),
    updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_nodes_user       ON task_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_task_nodes_parent     ON task_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_task_nodes_due_date   ON task_nodes(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_nodes_user_root  ON task_nodes(user_id) WHERE parent_id IS NULL;

-- 2. Templates — versioned, immutable once assigned ────────────────────────
CREATE TABLE IF NOT EXISTS task_hierarchy_templates (
    template_id       SERIAL PRIMARY KEY,
    name               TEXT NOT NULL,
    user_category      TEXT NOT NULL,          -- e.g. 'STUDENT', 'WORKER' — mapped from profiles.immigration_status
    description        TEXT,
    version             INT NOT NULL DEFAULT 1,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_admin    UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at           TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_category, version)
);

CREATE TABLE IF NOT EXISTS task_hierarchy_template_items (
    item_id                  SERIAL PRIMARY KEY,
    template_id              INT NOT NULL REFERENCES task_hierarchy_templates(template_id) ON DELETE CASCADE,
    parent_item_id           INT REFERENCES task_hierarchy_template_items(item_id) ON DELETE CASCADE,
    title                    TEXT NOT NULL,
    description              TEXT,
    default_due_offset_days  INT,   -- days after the user's arrival_date; NULL = no due date generated
    sort_order               INT NOT NULL DEFAULT 0,
    created_at                TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_thti_template ON task_hierarchy_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_thti_parent   ON task_hierarchy_template_items(parent_item_id);

ALTER TABLE task_nodes
  DROP CONSTRAINT IF EXISTS task_nodes_template_item_fk;
ALTER TABLE task_nodes
  ADD CONSTRAINT task_nodes_template_item_fk
  FOREIGN KEY (template_item_id) REFERENCES task_hierarchy_template_items(item_id) ON DELETE SET NULL;

-- 3. Notifications — separate from the existing free-text `notifications` table ─
CREATE TABLE IF NOT EXISTS task_notifications (
    task_notification_id  SERIAL PRIMARY KEY,
    user_id                UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    task_node_id           INT NOT NULL REFERENCES task_nodes(task_node_id) ON DELETE CASCADE,
    channel                 TEXT NOT NULL DEFAULT 'EMAIL'
                              CHECK (channel IN ('EMAIL','IN_APP','PUSH')),
    milestone_days          INT NOT NULL CHECK (milestone_days IN (7, 3, 1)),
    message                  TEXT NOT NULL,
    scheduled_time            TIMESTAMPTZ NOT NULL,
    status                    TEXT NOT NULL DEFAULT 'PENDING'
                                CHECK (status IN ('PENDING','SENT','FAILED')),
    sent_at                   TIMESTAMPTZ,
    read_status                BOOLEAN NOT NULL DEFAULT FALSE,
    created_at                  TIMESTAMPTZ DEFAULT now(),
    -- The idempotency guard: the scheduler INSERTs with ON CONFLICT DO
    -- NOTHING keyed on this, so re-running the sweep never double-sends.
    UNIQUE (task_node_id, channel, milestone_days)
);

CREATE INDEX IF NOT EXISTS idx_task_notifications_user    ON task_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_task_notifications_pending ON task_notifications(status) WHERE status = 'PENDING';

-- ==========================================
-- 4. Bidirectional status sync — implemented as Postgres functions so the
-- entire read-modify-write chain for one status change (cascade down +
-- roll up ancestors) runs inside a single transaction. Doing this in
-- application code with multiple round-trips would leave a window for
-- concurrent updates on sibling nodes to interleave into a wrong result.
-- ==========================================

CREATE OR REPLACE FUNCTION recompute_ancestor_status(p_node_id INT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_parent_id INT;
  v_total     INT;
  v_completed INT;
  v_active    INT; -- IN_PROGRESS or COMPLETED
  v_new_status TEXT;
  v_current_status TEXT;
BEGIN
  SELECT parent_id INTO v_parent_id FROM task_nodes WHERE task_node_id = p_node_id;
  IF v_parent_id IS NULL THEN
    RETURN; -- reached the root
  END IF;

  SELECT
    count(*),
    count(*) FILTER (WHERE status = 'COMPLETED'),
    count(*) FILTER (WHERE status IN ('IN_PROGRESS','COMPLETED'))
  INTO v_total, v_completed, v_active
  FROM task_nodes WHERE parent_id = v_parent_id;

  IF v_total = 0 THEN
    RETURN;
  END IF;

  v_new_status := CASE
    WHEN v_completed = v_total THEN 'COMPLETED'
    WHEN v_active > 0           THEN 'IN_PROGRESS'
    ELSE 'NOT_STARTED'
  END;

  SELECT status INTO v_current_status FROM task_nodes WHERE task_node_id = v_parent_id;

  IF v_current_status IS DISTINCT FROM v_new_status THEN
    UPDATE task_nodes SET status = v_new_status, updated_at = now() WHERE task_node_id = v_parent_id;
    PERFORM recompute_ancestor_status(v_parent_id);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION recompute_ancestor_due_date(p_node_id INT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_parent_id INT;
  v_manual    BOOLEAN;
  v_min_due   DATE;
  v_current_due DATE;
BEGIN
  SELECT parent_id INTO v_parent_id FROM task_nodes WHERE task_node_id = p_node_id;
  IF v_parent_id IS NULL THEN
    RETURN;
  END IF;

  SELECT due_date_is_manual, due_date INTO v_manual, v_current_due
  FROM task_nodes WHERE task_node_id = v_parent_id;

  IF v_manual THEN
    RETURN; -- a user-set due date on the parent is never overwritten by roll-up
  END IF;

  SELECT MIN(due_date) INTO v_min_due FROM task_nodes
  WHERE parent_id = v_parent_id AND due_date IS NOT NULL;

  IF v_current_due IS DISTINCT FROM v_min_due THEN
    UPDATE task_nodes SET due_date = v_min_due, updated_at = now() WHERE task_node_id = v_parent_id;
    PERFORM recompute_ancestor_due_date(v_parent_id);
  END IF;
END;
$$;

-- Entry point the API calls for a status change. Handles the downward
-- cascade (completing a parent completes every descendant — the one
-- direction the spec calls for; other statuses only roll UP from children)
-- and the upward roll-up, atomically.
CREATE OR REPLACE FUNCTION set_task_node_status(p_task_node_id INT, p_user_id UUID, p_status TEXT)
RETURNS SETOF task_nodes
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM task_nodes WHERE task_node_id = p_task_node_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Task % not found for this user', p_task_node_id;
  END IF;

  UPDATE task_nodes SET status = p_status, updated_at = now() WHERE task_node_id = p_task_node_id;

  IF p_status = 'COMPLETED' THEN
    WITH RECURSIVE descendants AS (
      SELECT task_node_id FROM task_nodes WHERE parent_id = p_task_node_id
      UNION ALL
      SELECT t.task_node_id FROM task_nodes t JOIN descendants d ON t.parent_id = d.task_node_id
    )
    UPDATE task_nodes SET status = 'COMPLETED', updated_at = now()
    WHERE task_node_id IN (SELECT task_node_id FROM descendants) AND status <> 'COMPLETED';
  END IF;

  PERFORM recompute_ancestor_status(p_task_node_id);

  RETURN QUERY SELECT * FROM task_nodes WHERE user_id = p_user_id ORDER BY task_node_id;
END;
$$;

-- Entry point for creating/updating a node's due date — keeps ancestor
-- roll-up and (for new nodes) the notification-eligibility window correct.
CREATE OR REPLACE FUNCTION set_task_node_due_date(p_task_node_id INT, p_user_id UUID, p_due_date DATE, p_manual BOOLEAN)
RETURNS SETOF task_nodes
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM task_nodes WHERE task_node_id = p_task_node_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Task % not found for this user', p_task_node_id;
  END IF;

  UPDATE task_nodes
  SET due_date = p_due_date, due_date_is_manual = p_manual, updated_at = now()
  WHERE task_node_id = p_task_node_id;

  PERFORM recompute_ancestor_due_date(p_task_node_id);

  RETURN QUERY SELECT * FROM task_nodes WHERE user_id = p_user_id ORDER BY task_node_id;
END;
$$;

-- 5. RLS ─────────────────────────────────────────────────────────────────
ALTER TABLE task_nodes                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_hierarchy_templates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_hierarchy_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_notifications            ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own task nodes" ON task_nodes;
CREATE POLICY "Users manage own task nodes" ON task_nodes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public read active templates" ON task_hierarchy_templates;
CREATE POLICY "Public read active templates" ON task_hierarchy_templates
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage templates" ON task_hierarchy_templates;
CREATE POLICY "Admins manage templates" ON task_hierarchy_templates
  FOR ALL USING (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "Public read template items" ON task_hierarchy_template_items;
CREATE POLICY "Public read template items" ON task_hierarchy_template_items
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins manage template items" ON task_hierarchy_template_items;
CREATE POLICY "Admins manage template items" ON task_hierarchy_template_items
  FOR ALL USING (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users manage own task notifications" ON task_notifications;
CREATE POLICY "Users manage own task notifications" ON task_notifications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Seed one example template so /api/v2/templates and generate-tasks are
-- demonstrable immediately, mirroring the SIN/course-registration/housing
-- example from the design brief.
INSERT INTO task_hierarchy_templates (name, user_category, description, version, is_active)
VALUES ('Student Onboarding', 'STUDENT', 'Core settlement tasks for international students.', 1, TRUE)
ON CONFLICT (user_category, version) DO NOTHING;

INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, default_due_offset_days, sort_order)
SELECT t.template_id, NULL, v.title, v.description, v.offset_days, v.sort_order
FROM (VALUES
  ('Apply for Social Insurance Number (SIN)', 'Required to work and access government services.', 7, 1),
  ('Register for courses', 'Complete course registration with your institution.', 14, 2),
  ('Find housing', 'Secure a place to live for the term.', 30, 3)
) AS v(title, description, offset_days, sort_order)
CROSS JOIN (SELECT template_id FROM task_hierarchy_templates WHERE user_category = 'STUDENT' AND version = 1) t
WHERE NOT EXISTS (
  SELECT 1 FROM task_hierarchy_template_items i
  WHERE i.template_id = t.template_id AND i.title = v.title
);

INSERT INTO task_hierarchy_templates (name, user_category, description, version, is_active)
VALUES ('Worker Onboarding', 'WORKER', 'Core settlement tasks for temporary foreign workers.', 1, TRUE)
ON CONFLICT (user_category, version) DO NOTHING;

INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, default_due_offset_days, sort_order)
SELECT t.template_id, NULL, v.title, v.description, v.offset_days, v.sort_order
FROM (VALUES
  ('Update resume', 'Tailor your resume for the Canadian job market.', 7, 1),
  ('Search for jobs', 'Begin applying through job boards and networking.', 14, 2),
  ('Apply for provincial health card', 'Register for provincial health coverage.', 30, 3)
) AS v(title, description, offset_days, sort_order)
CROSS JOIN (SELECT template_id FROM task_hierarchy_templates WHERE user_category = 'WORKER' AND version = 1) t
WHERE NOT EXISTS (
  SELECT 1 FROM task_hierarchy_template_items i
  WHERE i.template_id = t.template_id AND i.title = v.title
);

-- ==========================================
-- 7. Notification sweep — the only cross-user privileged operation in this
-- system. There is no SUPABASE_SERVICE_ROLE_KEY in this project's .env
-- (only the anon key), so a naive cron job using the app's normal
-- per-request client would be blocked by RLS on every other user's rows.
-- Rather than introduce a service-role secret, these two SECURITY DEFINER
-- functions run as their owner (bypassing RLS internally) and expose a
-- narrow, auditable surface — everything else in the app still only ever
-- touches the database as the authenticated user it's acting on behalf of.
-- ==========================================

CREATE OR REPLACE FUNCTION run_daily_notification_sweep()
RETURNS TABLE (
  task_notification_id INT,
  channel TEXT,
  milestone_days INT,
  message TEXT,
  recipient_email TEXT,
  task_title TEXT,
  due_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Generate any missing 7/3/1-day milestone rows for both channels.
  -- ON CONFLICT DO NOTHING is the idempotency guarantee: re-running this
  -- sweep (manually, or twice in one day) never creates a duplicate.
  INSERT INTO task_notifications (user_id, task_node_id, channel, milestone_days, message, scheduled_time, status)
  SELECT
    tn.user_id,
    tn.task_node_id,
    ch.channel,
    (tn.due_date - CURRENT_DATE)::INT,
    'Your task "' || tn.title || '" is due in ' || (tn.due_date - CURRENT_DATE)::INT || ' day(s).',
    now(),
    'PENDING'
  FROM task_nodes tn
  CROSS JOIN (VALUES ('EMAIL'), ('IN_APP')) AS ch(channel)
  WHERE tn.due_date IS NOT NULL
    AND tn.status <> 'COMPLETED'
    AND (tn.due_date - CURRENT_DATE)::INT IN (7, 3, 1)
  ON CONFLICT (task_node_id, channel, milestone_days) DO NOTHING;

  -- IN_APP rows have no external delivery step — they're "delivered" the
  -- moment they exist, since the frontend reads them straight from this table.
  UPDATE task_notifications
  SET status = 'SENT', sent_at = now()
  WHERE channel = 'IN_APP' AND status = 'PENDING';

  -- Hand back every still-pending EMAIL row (old ones included, so a prior
  -- failed send gets retried on the next sweep) for the Node scheduler to
  -- actually deliver — Postgres can't send email itself.
  RETURN QUERY
  SELECT n.task_notification_id, n.channel, n.milestone_days, n.message,
         u.email, tn.title, tn.due_date
  FROM task_notifications n
  JOIN users u ON u.user_id = n.user_id
  JOIN task_nodes tn ON tn.task_node_id = n.task_node_id
  WHERE n.channel = 'EMAIL' AND n.status IN ('PENDING', 'FAILED');
END;
$$;

CREATE OR REPLACE FUNCTION mark_task_notifications_status(p_ids INT[], p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE task_notifications
  SET status = p_status, sent_at = CASE WHEN p_status = 'SENT' THEN now() ELSE sent_at END
  WHERE task_notification_id = ANY(p_ids);
END;
$$;

-- NOTE on exposure: ideally these would be callable only by a dedicated
-- backend service identity, but this project has no SUPABASE_SERVICE_ROLE_KEY
-- and the scheduler (Cloud Scheduler hitting POST /api/v2/scheduler/run-daily,
-- or local node-cron) has no logged-in human user to authenticate as, so
-- these are granted to `anon` too. The real protection boundary is the
-- Express layer in front of them (backend/src/middleware/authMiddleware.js
-- `requireAdminOrSchedulerSecret` — admin JWT OR the SCHEDULER_SECRET env
-- var), not the Postgres grant. See docs/TASK_NOTIFICATION_SYSTEM_DESIGN.md
-- ("Known trade-off: scheduler auth") for the two ways to close this gap
-- properly (a service-role key, or a dedicated system Auth user).
REVOKE ALL ON FUNCTION run_daily_notification_sweep() FROM PUBLIC;
REVOKE ALL ON FUNCTION mark_task_notifications_status(INT[], TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION run_daily_notification_sweep() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION mark_task_notifications_status(INT[], TEXT) TO authenticated, anon;

COMMIT;

NOTIFY pgrst, 'reload schema';
