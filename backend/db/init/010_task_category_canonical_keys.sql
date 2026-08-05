-- ==========================================
-- Fixes a duplication bug 009_task_canonical_keys.sql missed: it only
-- curated canonical_key on LEAF items (SIN, bank account, health, SIM,
-- the 3 compliance rules). It never looked at the ROOT category tasks
-- themselves — several of those are ALSO seeded with identical title AND
-- description across multiple statuses (see 003_task_hierarchy_all_statuses.sql):
--
--   "Arrival & Registration" — International Student + Work Permit Holder
--     (same title, same description verbatim)
--   "Housing"                — International Student + Work Permit Holder
--                               + Permanent Resident (same title, same
--                               description verbatim)
--
-- Neither had a canonical_key and their template_item_id obviously differs
-- across templates, so materialize() correctly found "no match" and
-- inserted a second copy every time a user switched between these
-- statuses — the exact "tasks double when I change immigration status"
-- report this migration fixes.
--
-- While auditing for this, a few LEAF items turned out to have the same
-- gap for status pairs 009 didn't check (Student/Work Permit's Housing
-- subtasks; Work Permit/PR's Finance subtasks) — those are keyed below
-- too. Everything else already covered by 009 is untouched.
-- ==========================================

BEGIN;

-- ── Root category overlaps ───────────────────────────────────────────────
UPDATE task_hierarchy_template_items ti
SET canonical_key = 'category_arrival_registration'
FROM task_hierarchy_templates t
WHERE ti.template_id = t.template_id
  AND ti.parent_item_id IS NULL
  AND ti.title = 'Arrival & Registration'
  AND t.user_category IN ('International Student', 'Work Permit Holder');

UPDATE task_hierarchy_template_items ti
SET canonical_key = 'category_housing'
FROM task_hierarchy_templates t
WHERE ti.template_id = t.template_id
  AND ti.parent_item_id IS NULL
  AND ti.title = 'Housing'
  AND t.user_category IN ('International Student', 'Work Permit Holder', 'Permanent Resident');

-- ── Leaf overlaps missed by 009 ──────────────────────────────────────────
-- Student + Work Permit's Housing subtasks use identical wording for these
-- two (their third subtask — "Sign your lease..." vs "Secure permanent
-- housing" — is genuinely different, left unkeyed). PR's housing subtasks
-- use different, merged wording ("Set up utilities and get tenant
-- insurance") so PR is deliberately NOT included here.
UPDATE task_hierarchy_template_items ti
SET canonical_key = 'housing_utilities'
FROM task_hierarchy_templates t
WHERE ti.template_id = t.template_id
  AND ti.title = 'Set up utilities (hydro, internet)'
  AND t.user_category IN ('International Student', 'Work Permit Holder');

UPDATE task_hierarchy_template_items ti
SET canonical_key = 'housing_tenant_insurance'
FROM task_hierarchy_templates t
WHERE ti.template_id = t.template_id
  AND ti.title = 'Get tenant insurance'
  AND t.user_category IN ('International Student', 'Work Permit Holder');

-- Work Permit + PR both use "Secure permanent housing" verbatim.
UPDATE task_hierarchy_template_items ti
SET canonical_key = 'housing_secure_permanent'
FROM task_hierarchy_templates t
WHERE ti.template_id = t.template_id
  AND ti.title = 'Secure permanent housing'
  AND t.user_category IN ('Work Permit Holder', 'Permanent Resident');

-- Work Permit's Finance & Tax and PR's Finance & Credit share these two
-- subtasks verbatim, even though the root category itself is intentionally
-- NOT keyed (the rest of their finance content differs — tuition/payroll
-- focus vs. credit/citizenship focus).
UPDATE task_hierarchy_template_items ti
SET canonical_key = 'finance_credit_history'
FROM task_hierarchy_templates t
WHERE ti.template_id = t.template_id
  AND ti.title = 'Start building Canadian credit history'
  AND t.user_category IN ('Work Permit Holder', 'Permanent Resident');

UPDATE task_hierarchy_template_items ti
SET canonical_key = 'finance_file_taxes'
FROM task_hierarchy_templates t
WHERE ti.template_id = t.template_id
  AND ti.title = 'File Canadian taxes each April'
  AND t.user_category IN ('Work Permit Holder', 'Permanent Resident');

-- ── Backfill task_nodes, duplicate-safe AND re-run-safe ──────────────────
-- Same idea as 009's backfill, but rank-aware: if a user already has TWO
-- task_nodes that are about to map onto the same canonical_key (exactly
-- the "tasks double" bug — e.g. two separate "Housing" roots from
-- switching status pre-fix), a plain UPDATE would try to give both rows
-- the same canonical_key and get rejected by task_nodes_user_canonical_key
-- (009). Instead, only the single best row per (user_id, canonical_key)
-- is keyed here — preferring whichever has the most progress (COMPLETED >
-- IN_PROGRESS > NOT_STARTED), then the oldest row — so real progress is
-- never the one left behind. The other row(s) are left with canonical_key
-- still NULL for the cleanup step below to resolve.
--
-- The extra NOT EXISTS guard is what makes this safe to run more than
-- once: on a second pass, ROW_NUMBER() only sees whatever's still NULL,
-- so a group that's down to its last unresolved duplicate gets rn = 1
-- again — but the value it would get was already claimed by that group's
-- survivor on the first pass. Without this guard that's a unique-index
-- violation (task_nodes_user_canonical_key); with it, the row is simply
-- left NULL for the cleanup step to reparent/remove instead.
WITH ranked AS (
  SELECT
    tn.task_node_id,
    tn.user_id,
    ti.canonical_key AS new_key,
    ROW_NUMBER() OVER (
      PARTITION BY tn.user_id, ti.canonical_key
      ORDER BY
        CASE tn.status WHEN 'COMPLETED' THEN 0 WHEN 'IN_PROGRESS' THEN 1 ELSE 2 END,
        tn.task_node_id
    ) AS rn
  FROM task_nodes tn
  JOIN task_hierarchy_template_items ti ON tn.template_item_id = ti.item_id
  WHERE ti.canonical_key IS NOT NULL
    AND tn.canonical_key IS NULL
)
UPDATE task_nodes tn
SET canonical_key = ranked.new_key
FROM ranked
WHERE tn.task_node_id = ranked.task_node_id
  AND ranked.rn = 1
  AND NOT EXISTS (
    SELECT 1 FROM task_nodes claimed
    WHERE claimed.user_id = ranked.user_id
      AND claimed.canonical_key = ranked.new_key
  );

COMMIT;

NOTIFY pgrst, 'reload schema';
