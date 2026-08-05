-- ==========================================
-- Compliance merge (additive migration) — run AFTER 002 and 003.
--
-- Folds the standalone Compliance Tracking page into the task hierarchy:
-- compliance rules become real task_nodes (root task per rule group,
-- individual rules as subtasks) so they get dates, notifications, and
-- status roll-up for free, exactly like onboarding tasks. The Compliance
-- page becomes a filtered view over task_category = 'COMPLIANCE' instead
-- of its own hardcoded, non-persisted in-memory list.
--
-- Two new columns, both additive with a safe default so existing rows
-- (all onboarding tasks generated so far) are unaffected:
--   - task_nodes.task_category / task_hierarchy_template_items.task_category
--     ('GENERAL' | 'COMPLIANCE') — lets the API and frontend filter one
--     slice of a user's tree without a second table.
--   - task_hierarchy_templates.template_kind ('ONBOARDING' | 'COMPLIANCE')
--     — a user now has up to two active templates per status (one of each
--     kind), so the old UNIQUE (user_category, version) is widened to
--     include it.
--   - task_hierarchy_template_items.priority — carried through to
--     task_nodes.priority on generation; compliance rules need HIGH/NORMAL
--     severity and onboarding items never had a way to express that before.
-- ==========================================

BEGIN;

-- 1. New columns ─────────────────────────────────────────────────────────
ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS task_category TEXT NOT NULL DEFAULT 'GENERAL';
ALTER TABLE task_nodes DROP CONSTRAINT IF EXISTS task_nodes_task_category_check;
ALTER TABLE task_nodes ADD CONSTRAINT task_nodes_task_category_check CHECK (task_category IN ('GENERAL','COMPLIANCE'));

ALTER TABLE task_hierarchy_template_items ADD COLUMN IF NOT EXISTS task_category TEXT NOT NULL DEFAULT 'GENERAL';
ALTER TABLE task_hierarchy_template_items DROP CONSTRAINT IF EXISTS thti_task_category_check;
ALTER TABLE task_hierarchy_template_items ADD CONSTRAINT thti_task_category_check CHECK (task_category IN ('GENERAL','COMPLIANCE'));

ALTER TABLE task_hierarchy_template_items ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'NORMAL';
ALTER TABLE task_hierarchy_template_items DROP CONSTRAINT IF EXISTS thti_priority_check;
ALTER TABLE task_hierarchy_template_items ADD CONSTRAINT thti_priority_check CHECK (priority IN ('LOW','NORMAL','HIGH'));

ALTER TABLE task_hierarchy_templates ADD COLUMN IF NOT EXISTS template_kind TEXT NOT NULL DEFAULT 'ONBOARDING';
ALTER TABLE task_hierarchy_templates DROP CONSTRAINT IF EXISTS tht_template_kind_check;
ALTER TABLE task_hierarchy_templates ADD CONSTRAINT tht_template_kind_check CHECK (template_kind IN ('ONBOARDING','COMPLIANCE'));

ALTER TABLE task_hierarchy_templates DROP CONSTRAINT IF EXISTS task_hierarchy_templates_user_category_version_key;
ALTER TABLE task_hierarchy_templates DROP CONSTRAINT IF EXISTS task_hierarchy_templates_user_category_kind_version_key;
ALTER TABLE task_hierarchy_templates ADD CONSTRAINT task_hierarchy_templates_user_category_kind_version_key
  UNIQUE (user_category, template_kind, version);

-- 2. Compliance templates — one per canonical status, mirroring
-- 003_task_hierarchy_all_statuses.sql's per-status approach. Content is
-- ported from the old ComplianceTracking.jsx's COMPLIANCE_ITEMS, grouped
-- back into the same categories (Study Permit, Work Permit, General, etc.)
-- as root tasks, with each rule as a subtask underneath.
-- ==========================================

-- ── International Student ───────────────────────────────────────────────
INSERT INTO task_hierarchy_templates (name, user_category, template_kind, description, version, is_active)
VALUES ('International Student Compliance', 'International Student', 'COMPLIANCE', 'Permit conditions and legal obligations to stay in status.', 1, TRUE)
ON CONFLICT (user_category, template_kind, version) DO NOTHING;

INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, task_category, priority, sort_order)
SELECT t.template_id, NULL, v.title, v.description, 'COMPLIANCE', 'NORMAL', v.sort_order
FROM (VALUES
  ('Study Permit Conditions', 'Requirements you must maintain to keep your study permit valid.', 1),
  ('Co-op / Internship Requirements', 'Extra authorization needed if your program includes work terms.', 2),
  ('General Legal Obligations', 'Rules that apply no matter your status.', 3)
) AS v(title, description, sort_order)
CROSS JOIN (SELECT template_id FROM task_hierarchy_templates WHERE user_category = 'International Student' AND template_kind = 'COMPLIANCE' AND version = 1) t
WHERE NOT EXISTS (SELECT 1 FROM task_hierarchy_template_items i WHERE i.template_id = t.template_id AND i.parent_item_id IS NULL AND i.title = v.title);

INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, task_category, priority, sort_order)
SELECT p.template_id, p.item_id, v.title, v.description, 'COMPLIANCE', v.priority, v.sort_order
FROM (VALUES
  ('Enroll full-time at your DLI', 'You must be enrolled full-time at a Designated Learning Institution (DLI) throughout your studies, except in your final semester if fewer courses are needed.', 'HIGH', 1),
  ('Maintain active enrolment — no unauthorized breaks', 'Taking a semester off without an authorized leave violates your permit conditions. Contact your school''s international office before withdrawing.', 'HIGH', 2),
  ('Off-campus work: max 24 hrs/week during academic sessions', 'The limit is 24 hrs/week during academic sessions. You may work unlimited hours during scheduled breaks (summer, winter, spring).', 'HIGH', 3),
  ('Remain at the institution named on your permit', 'If you transfer schools, your study permit must be updated unless both institutions are DLIs and the transfer is within the same level of study.', 'HIGH', 4)
) AS v(title, description, priority, sort_order)
CROSS JOIN (
  SELECT ti.item_id, ti.template_id FROM task_hierarchy_template_items ti
  JOIN task_hierarchy_templates tt ON tt.template_id = ti.template_id
  WHERE tt.user_category = 'International Student' AND tt.template_kind = 'COMPLIANCE' AND tt.version = 1
    AND ti.parent_item_id IS NULL AND ti.title = 'Study Permit Conditions'
) p
WHERE NOT EXISTS (SELECT 1 FROM task_hierarchy_template_items i WHERE i.template_id = p.template_id AND i.parent_item_id = p.item_id AND i.title = v.title);

INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, task_category, priority, sort_order)
SELECT p.template_id, p.item_id, v.title, v.description, 'COMPLIANCE', v.priority, v.sort_order
FROM (VALUES
  ('Co-op requires a co-op work permit', 'If your program includes mandatory co-op or internship, ensure you have authorization on your study permit (or a separate co-op permit). The off-campus limit does NOT apply to authorized co-op.', 'HIGH', 1)
) AS v(title, description, priority, sort_order)
CROSS JOIN (
  SELECT ti.item_id, ti.template_id FROM task_hierarchy_template_items ti
  JOIN task_hierarchy_templates tt ON tt.template_id = ti.template_id
  WHERE tt.user_category = 'International Student' AND tt.template_kind = 'COMPLIANCE' AND tt.version = 1
    AND ti.parent_item_id IS NULL AND ti.title = 'Co-op / Internship Requirements'
) p
WHERE NOT EXISTS (SELECT 1 FROM task_hierarchy_template_items i WHERE i.template_id = p.template_id AND i.parent_item_id = p.item_id AND i.title = v.title);

-- ── Work Permit Holder ──────────────────────────────────────────────────
INSERT INTO task_hierarchy_templates (name, user_category, template_kind, description, version, is_active)
VALUES ('Work Permit Holder Compliance', 'Work Permit Holder', 'COMPLIANCE', 'Permit conditions and legal obligations to stay in status.', 1, TRUE)
ON CONFLICT (user_category, template_kind, version) DO NOTHING;

INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, task_category, priority, sort_order)
SELECT t.template_id, NULL, v.title, v.description, 'COMPLIANCE', 'NORMAL', v.sort_order
FROM (VALUES
  ('Work Permit Conditions', 'Requirements you must maintain to keep your work permit valid.', 1),
  ('General Legal Obligations', 'Rules that apply no matter your status.', 2)
) AS v(title, description, sort_order)
CROSS JOIN (SELECT template_id FROM task_hierarchy_templates WHERE user_category = 'Work Permit Holder' AND template_kind = 'COMPLIANCE' AND version = 1) t
WHERE NOT EXISTS (SELECT 1 FROM task_hierarchy_template_items i WHERE i.template_id = t.template_id AND i.parent_item_id IS NULL AND i.title = v.title);

INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, task_category, priority, sort_order)
SELECT p.template_id, p.item_id, v.title, v.description, 'COMPLIANCE', v.priority, v.sort_order
FROM (VALUES
  ('Work only for the employer named on your permit', 'Employer-specific work permits restrict you to one employer. Working for another employer — even unpaid — is a violation. Apply for a change of employer before switching.', 'HIGH', 1),
  ('Stay in the occupation listed on your permit', 'Some work permits restrict the type of occupation (NOC code). Performing duties outside your authorized occupation may violate your conditions.', 'HIGH', 2),
  ('Work only in the province/location listed', 'Some permits are location-restricted. Check your permit for geographic restrictions before accepting a remote or out-of-province opportunity.', 'NORMAL', 3)
) AS v(title, description, priority, sort_order)
CROSS JOIN (
  SELECT ti.item_id, ti.template_id FROM task_hierarchy_template_items ti
  JOIN task_hierarchy_templates tt ON tt.template_id = ti.template_id
  WHERE tt.user_category = 'Work Permit Holder' AND tt.template_kind = 'COMPLIANCE' AND tt.version = 1
    AND ti.parent_item_id IS NULL AND ti.title = 'Work Permit Conditions'
) p
WHERE NOT EXISTS (SELECT 1 FROM task_hierarchy_template_items i WHERE i.template_id = p.template_id AND i.parent_item_id = p.item_id AND i.title = v.title);

-- ── Permanent Resident ───────────────────────────────────────────────────
INSERT INTO task_hierarchy_templates (name, user_category, template_kind, description, version, is_active)
VALUES ('Permanent Resident Compliance', 'Permanent Resident', 'COMPLIANCE', 'Residency obligations and legal requirements to keep your PR status.', 1, TRUE)
ON CONFLICT (user_category, template_kind, version) DO NOTHING;

INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, task_category, priority, sort_order)
SELECT t.template_id, NULL, v.title, v.description, 'COMPLIANCE', 'NORMAL', v.sort_order
FROM (VALUES
  ('Permanent Residency Requirements', 'Obligations that keep your PR status in good standing.', 1),
  ('General Legal Obligations', 'Rules that apply no matter your status.', 2)
) AS v(title, description, sort_order)
CROSS JOIN (SELECT template_id FROM task_hierarchy_templates WHERE user_category = 'Permanent Resident' AND template_kind = 'COMPLIANCE' AND version = 1) t
WHERE NOT EXISTS (SELECT 1 FROM task_hierarchy_template_items i WHERE i.template_id = t.template_id AND i.parent_item_id IS NULL AND i.title = v.title);

INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, task_category, priority, sort_order)
SELECT p.template_id, p.item_id, v.title, v.description, 'COMPLIANCE', v.priority, v.sort_order
FROM (VALUES
  ('Meet the PR residency obligation', 'You must be physically present in Canada for at least 730 days within every rolling 5-year period to keep your PR status.', 'HIGH', 1),
  ('Renew your PR card before it expires', 'Your PR card is proof of status, not the status itself, but travelling without a valid card can strand you outside Canada. Apply for renewal before it expires.', 'HIGH', 2)
) AS v(title, description, priority, sort_order)
CROSS JOIN (
  SELECT ti.item_id, ti.template_id FROM task_hierarchy_template_items ti
  JOIN task_hierarchy_templates tt ON tt.template_id = ti.template_id
  WHERE tt.user_category = 'Permanent Resident' AND tt.template_kind = 'COMPLIANCE' AND tt.version = 1
    AND ti.parent_item_id IS NULL AND ti.title = 'Permanent Residency Requirements'
) p
WHERE NOT EXISTS (SELECT 1 FROM task_hierarchy_template_items i WHERE i.template_id = p.template_id AND i.parent_item_id = p.item_id AND i.title = v.title);

-- ── Refugee / Protected Person ───────────────────────────────────────────
INSERT INTO task_hierarchy_templates (name, user_category, template_kind, description, version, is_active)
VALUES ('Refugee / Protected Person Compliance', 'Refugee / Protected Person', 'COMPLIANCE', 'Requirements to protect your claim and settle your status.', 1, TRUE)
ON CONFLICT (user_category, template_kind, version) DO NOTHING;

INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, task_category, priority, sort_order)
SELECT t.template_id, NULL, v.title, v.description, 'COMPLIANCE', 'NORMAL', v.sort_order
FROM (VALUES
  ('Protected Person Requirements', 'Obligations tied to your claim and path to permanent residence.', 1),
  ('General Legal Obligations', 'Rules that apply no matter your status.', 2)
) AS v(title, description, sort_order)
CROSS JOIN (SELECT template_id FROM task_hierarchy_templates WHERE user_category = 'Refugee / Protected Person' AND template_kind = 'COMPLIANCE' AND version = 1) t
WHERE NOT EXISTS (SELECT 1 FROM task_hierarchy_template_items i WHERE i.template_id = t.template_id AND i.parent_item_id IS NULL AND i.title = v.title);

INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, task_category, priority, sort_order)
SELECT p.template_id, p.item_id, v.title, v.description, 'COMPLIANCE', v.priority, v.sort_order
FROM (VALUES
  ('Attend all IRB/IRCC required appointments and hearings', 'Missing a scheduled hearing or interview can jeopardize your claim or status. Confirm appointment details as soon as you receive them.', 'HIGH', 1),
  ('Apply for permanent residence within your eligible window', 'Once your protected person status is confirmed, you become eligible to apply for PR — do this promptly to keep your settlement timeline on track.', 'NORMAL', 2)
) AS v(title, description, priority, sort_order)
CROSS JOIN (
  SELECT ti.item_id, ti.template_id FROM task_hierarchy_template_items ti
  JOIN task_hierarchy_templates tt ON tt.template_id = ti.template_id
  WHERE tt.user_category = 'Refugee / Protected Person' AND tt.template_kind = 'COMPLIANCE' AND tt.version = 1
    AND ti.parent_item_id IS NULL AND ti.title = 'Protected Person Requirements'
) p
WHERE NOT EXISTS (SELECT 1 FROM task_hierarchy_template_items i WHERE i.template_id = p.template_id AND i.parent_item_id = p.item_id AND i.title = v.title);

-- ── Visitor / Tourist ────────────────────────────────────────────────────
INSERT INTO task_hierarchy_templates (name, user_category, template_kind, description, version, is_active)
VALUES ('Visitor / Tourist Compliance', 'Visitor / Tourist', 'COMPLIANCE', 'Conditions to stay in status as a visitor.', 1, TRUE)
ON CONFLICT (user_category, template_kind, version) DO NOTHING;

INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, task_category, priority, sort_order)
SELECT t.template_id, NULL, v.title, v.description, 'COMPLIANCE', 'NORMAL', v.sort_order
FROM (VALUES
  ('Visitor Status Conditions', 'Requirements you must maintain while visiting on a temporary resident status.', 1),
  ('General Legal Obligations', 'Rules that apply no matter your status.', 2)
) AS v(title, description, sort_order)
CROSS JOIN (SELECT template_id FROM task_hierarchy_templates WHERE user_category = 'Visitor / Tourist' AND template_kind = 'COMPLIANCE' AND version = 1) t
WHERE NOT EXISTS (SELECT 1 FROM task_hierarchy_template_items i WHERE i.template_id = t.template_id AND i.parent_item_id IS NULL AND i.title = v.title);

INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, task_category, priority, sort_order)
SELECT p.template_id, p.item_id, v.title, v.description, 'COMPLIANCE', v.priority, v.sort_order
FROM (VALUES
  ('Do NOT work if you have no work authorization', 'Working without authorization is a serious violation that can result in removal and a future inadmissibility finding. This includes online or remote work for Canadian employers.', 'HIGH', 1),
  ('Do not study without a valid study permit', 'Enrolling in a program longer than 6 months without a study permit violates your visitor conditions.', 'NORMAL', 2),
  ('Leave Canada (or apply to extend) before your visitor status expires', 'Overstaying, even briefly, can affect future visa/entry applications. Apply to extend your stay at least 30 days before it expires if you need more time.', 'HIGH', 3)
) AS v(title, description, priority, sort_order)
CROSS JOIN (
  SELECT ti.item_id, ti.template_id FROM task_hierarchy_template_items ti
  JOIN task_hierarchy_templates tt ON tt.template_id = ti.template_id
  WHERE tt.user_category = 'Visitor / Tourist' AND tt.template_kind = 'COMPLIANCE' AND tt.version = 1
    AND ti.parent_item_id IS NULL AND ti.title = 'Visitor Status Conditions'
) p
WHERE NOT EXISTS (SELECT 1 FROM task_hierarchy_template_items i WHERE i.template_id = p.template_id AND i.parent_item_id = p.item_id AND i.title = v.title);

-- ── "General Legal Obligations" children — shared across all 5 statuses ──
INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, task_category, priority, sort_order)
SELECT p.template_id, p.item_id, v.title, v.description, 'COMPLIANCE', v.priority, v.sort_order
FROM (VALUES
  ('Maintain valid status at all times', 'Ensure your permit does not expire. If you applied for renewal before your permit expired, you have ''implied status'' and can continue under your previous conditions while waiting.', 'HIGH', 1),
  ('Report address changes to IRCC', 'You are required to notify IRCC within 180 days of changing your address. Failure to do so can cause missed correspondence and compliance issues.', 'NORMAL', 2),
  ('Do not criminally offend — it affects future applications', 'Any criminal record in Canada or abroad may render you inadmissible for future immigration applications including PR and citizenship.', 'NORMAL', 3)
) AS v(title, description, priority, sort_order)
CROSS JOIN (
  SELECT ti.item_id, ti.template_id FROM task_hierarchy_template_items ti
  JOIN task_hierarchy_templates tt ON tt.template_id = ti.template_id
  WHERE tt.template_kind = 'COMPLIANCE' AND tt.version = 1
    AND ti.parent_item_id IS NULL AND ti.title = 'General Legal Obligations'
) p
WHERE NOT EXISTS (SELECT 1 FROM task_hierarchy_template_items i WHERE i.template_id = p.template_id AND i.parent_item_id = p.item_id AND i.title = v.title);

COMMIT;

NOTIFY pgrst, 'reload schema';
