-- ==========================================
-- Content admin write policies (additive migration) — run AFTER
-- supabase_migration.sql.
--
-- content_db had RLS enabled with only a public SELECT (Published rows)
-- policy — no INSERT/UPDATE/DELETE policy existed at all, so with RLS
-- enabled and no matching policy, every write was silently denied
-- regardless of caller. The Content Management admin page could show
-- articles but never actually create, edit, or delete one. This adds the
-- missing write policies, scoped to admins (same pattern as
-- task_hierarchy_templates in 002_task_hierarchy_system.sql).
-- ==========================================

BEGIN;

DROP POLICY IF EXISTS "Admins manage content" ON content_db;
CREATE POLICY "Admins manage content" ON content_db
  FOR ALL USING (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()));

COMMIT;

NOTIFY pgrst, 'reload schema';
