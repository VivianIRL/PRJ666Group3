-- ==========================================
-- Canonical task keys — enables safe re-generation on immigration-status
-- change without destroying user progress (additive migration, run after
-- 003_task_hierarchy_all_statuses.sql and 004_task_hierarchy_compliance.sql).
--
-- THE PROBLEM: templateService.generateTasksForUser()'s idempotency guard
-- currently bails out entirely — "already_generated", zero rows touched —
-- the moment a user has ANY non-compliance TEMPLATE-sourced task_node. That
-- guard was written for "generate once, ever," not "generate once per
-- status." The practical effect: a user who registers as a Student, then
-- later changes their profile's immigration status to Work Permit Holder,
-- gets NONE of the Work Permit Holder tasks — the guard silently no-ops.
--
-- THE FIX: stop gating on "does this user have ANY template task" and
-- instead gate PER ITEM, keyed on a stable identity so the same real-world
-- action is never inserted twice for one user — even though each status's
-- template stores it as a *separate* task_hierarchy_template_items row
-- (see templates in 003/004: "Get your SIN (Social Insurance Number)" for
-- International Student vs. "Apply for SIN at Service Canada" for Work
-- Permit Holder are different rows, different wording, same real action).
--
-- canonical_key is hand-curated, not derived from title text — title
-- wording deliberately differs by status (context-appropriate phrasing),
-- and sometimes what LOOKS like the same task genuinely isn't: a Visitor's
-- "Purchase visitor health insurance" (private coverage) is not the same
-- action as a Student's "Register for provincial health insurance"
-- (public coverage) — those are correctly left with different keys (in
-- this case, no key at all on the visitor-specific one) so a status change
-- from Visitor to Work Permit Holder still adds the provincial-coverage
-- task as new, rather than treating it as already satisfied.
-- ==========================================

BEGIN;

ALTER TABLE task_hierarchy_template_items ADD COLUMN IF NOT EXISTS canonical_key TEXT;
ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS canonical_key TEXT;

-- ── Onboarding overlaps ──────────────────────────────────────────────────
-- Only the items that are genuinely the same action get a shared key.
-- SIN: every status except Visitor (visitors don't have a SIN task at all).
UPDATE task_hierarchy_template_items ti
SET canonical_key = 'sin_application'
FROM task_hierarchy_templates t
WHERE ti.template_id = t.template_id
  AND t.template_kind IS DISTINCT FROM 'COMPLIANCE'
  AND (
    (t.user_category = 'International Student' AND ti.title = 'Get your SIN (Social Insurance Number)') OR
    (t.user_category = 'Work Permit Holder'     AND ti.title = 'Apply for SIN at Service Canada') OR
    (t.user_category = 'Permanent Resident'     AND ti.title = 'Apply for SIN — your new SIN will NOT start with 9') OR
    (t.user_category = 'Refugee / Protected Person' AND ti.title = 'Apply for SIN')
  );

-- Bank account: the one action every single status's template includes.
UPDATE task_hierarchy_template_items ti
SET canonical_key = 'bank_account'
FROM task_hierarchy_templates t
WHERE ti.template_id = t.template_id
  AND t.template_kind IS DISTINCT FROM 'COMPLIANCE'
  AND (
    (t.user_category = 'International Student' AND ti.title = 'Open a Canadian bank account') OR
    (t.user_category = 'Work Permit Holder'     AND ti.title = 'Open a Canadian bank account') OR
    (t.user_category = 'Permanent Resident'     AND ti.title = 'Open a Canadian bank account') OR
    (t.user_category = 'Refugee / Protected Person' AND ti.title = 'Open a bank account (some banks have refugee-specific packages)') OR
    (t.user_category = 'Visitor / Tourist'      AND ti.title = 'Open a Canadian bank account if staying longer than 3 months')
  );

-- Provincial health coverage: Student/Work Permit/PR only — deliberately
-- NOT the Visitor item, which is private insurance (a different action).
UPDATE task_hierarchy_template_items ti
SET canonical_key = 'provincial_health_coverage'
FROM task_hierarchy_templates t
WHERE ti.template_id = t.template_id
  AND t.template_kind IS DISTINCT FROM 'COMPLIANCE'
  AND (
    (t.user_category = 'International Student' AND ti.title = 'Register for provincial health insurance') OR
    (t.user_category = 'Work Permit Holder'     AND ti.title = 'Register for provincial health card') OR
    (t.user_category = 'Permanent Resident'     AND ti.title = 'Apply for provincial health card on arrival')
  );

-- SIM/phone plan: only Student and Work Permit Holder use identical
-- wording for a genuinely identical action; Visitor's version (temporary
-- roaming) is left un-keyed on purpose.
UPDATE task_hierarchy_template_items ti
SET canonical_key = 'sim_phone_plan'
FROM task_hierarchy_templates t
WHERE ti.template_id = t.template_id
  AND t.template_kind IS DISTINCT FROM 'COMPLIANCE'
  AND ti.title = 'Get a Canadian SIM card / phone plan'
  AND t.user_category IN ('International Student', 'Work Permit Holder');

-- ── Compliance overlaps ──────────────────────────────────────────────────
-- These three are seeded verbatim-identical across all 5 compliance
-- templates already (see the "General Legal Obligations" block at the end
-- of 004_task_hierarchy_compliance.sql) — the safest possible case to key.
UPDATE task_hierarchy_template_items ti
SET canonical_key = CASE ti.title
  WHEN 'Maintain valid status at all times' THEN 'compliance_maintain_status'
  WHEN 'Report address changes to IRCC' THEN 'compliance_report_address_change'
  WHEN 'Do not criminally offend — it affects future applications' THEN 'compliance_no_criminal_offence'
END
FROM task_hierarchy_templates t
WHERE ti.template_id = t.template_id
  AND t.template_kind = 'COMPLIANCE'
  AND ti.title IN (
    'Maintain valid status at all times',
    'Report address changes to IRCC',
    'Do not criminally offend — it affects future applications'
  );

-- ── Backfill existing task_nodes ─────────────────────────────────────────
-- Everything above only keyed the TEMPLATE items. Without this step, a user
-- who already has a pre-migration task_node (e.g. an "Open a Canadian bank
-- account" task created before today) would still get duplicated on their
-- next status change: their existing node's canonical_key would still be
-- NULL, and its template_item_id belongs to the OLD status's template so it
-- can't match the NEW status's (different) item id either. Copying the now-
-- keyed value across via each node's own template_item_id closes that gap
-- for every task generated before this migration ran.
UPDATE task_nodes tn
SET canonical_key = ti.canonical_key
FROM task_hierarchy_template_items ti
WHERE tn.template_item_id = ti.item_id
  AND ti.canonical_key IS NOT NULL
  AND tn.canonical_key IS NULL;

-- A user can only ever have one task_node per canonical_key, and only one
-- task_node per template_item_id — both enforced at the database level as
-- a safety net (the application-level pre-filter in templateService.js is
-- the primary mechanism; this is what stops a *second* code path, a race,
-- or a future bug from ever creating a duplicate regardless). Created last,
-- after the backfill above, so it validates the final data rather than
-- rejecting a backfill that would otherwise collide with itself.
CREATE UNIQUE INDEX IF NOT EXISTS task_nodes_user_canonical_key
  ON task_nodes (user_id, canonical_key) WHERE canonical_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS task_nodes_user_template_item
  ON task_nodes (user_id, template_item_id) WHERE template_item_id IS NOT NULL;

COMMIT;

NOTIFY pgrst, 'reload schema';
