-- ==========================================
-- Drops the legacy public.users table.
--
-- THE PROBLEM: supabase_migration.sql predates this project's adoption of
-- Supabase Auth as the actual authentication system. It left behind a
-- public.users table that a trigger (handle_new_user) mirrors on every
-- signup — email plus a RAW COPY of encrypted_password — duplicating what
-- Supabase's own auth.users already stores, with none of auth.users' own
-- hardening around it. Nothing in the application reads from public.users
-- (grepped the whole backend; the only reference anywhere is a stray,
-- unused db/test-db.js script) — auth.users + public.profiles are what
-- the app actually runs on. It's dead weight that happens to also be a
-- second copy of every password hash.
--
-- THE CATCH: ten tables have a user_id/created_by_admin/etc. column FK'd
-- to public.users(user_id) — profiles, admins, user_tasks, bookmarks,
-- notifications, community_qa, task_nodes, task_hierarchy_templates,
-- task_notifications, community_replies. Dropping the table outright would
-- either cascade-drop those FK constraints (silently losing the "this
-- user_id must be real" check) or fail outright. Instead, every such FK is
-- re-pointed at auth.users(id) — the actual source of truth — before the
-- table is dropped, preserving each constraint's original ON DELETE
-- behavior under its original name. This is done generically (via
-- pg_constraint), not as ten hand-written ALTER TABLEs, so it can't miss
-- one or typo a constraint name.
-- ==========================================

BEGIN;

-- 1. Re-point every FK currently aimed at public.users onto auth.users.
DO $$
DECLARE
  rec RECORD;
  del_action TEXT;
BEGIN
  FOR rec IN
    SELECT
      con.conname,
      con.conrelid::regclass::text AS table_name,
      att.attname AS column_name,
      con.confdeltype
    FROM pg_constraint con
    JOIN pg_attribute att
      ON att.attrelid = con.conrelid
     AND att.attnum = con.conkey[1]
    WHERE con.contype = 'f'
      AND con.confrelid = 'public.users'::regclass
  LOOP
    del_action := CASE rec.confdeltype
      WHEN 'c' THEN 'CASCADE'
      WHEN 'n' THEN 'SET NULL'
      WHEN 'd' THEN 'SET DEFAULT'
      WHEN 'r' THEN 'RESTRICT'
      ELSE 'NO ACTION'
    END;

    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', rec.table_name, rec.conname);
    -- NOT VALID: some rows (seed/demo data inserted with placeholder UUIDs
    -- like 11111111-1111-1111-1111-111111111111, never a real auth.users
    -- signup) would fail a retroactive check. NOT VALID skips validating
    -- EXISTING rows but still enforces the constraint on every future
    -- insert/update — deleting that seed data isn't this migration's call
    -- to make unprompted.
    EXECUTE format(
      'ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES auth.users(id) ON DELETE %s NOT VALID',
      rec.table_name, rec.conname, rec.column_name, del_action
    );
  END LOOP;
END $$;

-- 2. Stop mirroring signups into public.users — profiles is the only
-- mirror the app needs.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  metadata JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
BEGIN
  INSERT INTO public.profiles (
    user_id, first_name, last_name, immigration_status, province,
    country, arrival_date, permit_expiry, language_test
  )
  VALUES (
    NEW.id,
    NULLIF(metadata ->> 'first_name', ''),
    NULLIF(metadata ->> 'last_name', ''),
    NULLIF(metadata ->> 'immigration_status', ''),
    NULLIF(metadata ->> 'province', ''),
    NULLIF(metadata ->> 'country', ''),
    NULLIF(metadata ->> 'arrival_date', '')::DATE,
    NULLIF(metadata ->> 'permit_expiry', '')::DATE,
    NULLIF(metadata ->> 'language_test', '')
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 3. Drop the now-unreferenced table (CASCADE is a safety net only — step
-- 1 should have already left nothing pointing at it).
DROP TABLE IF EXISTS public.users CASCADE;

COMMIT;

NOTIFY pgrst, 'reload schema';
