-- SettleCAN — PostgreSQL migration for Supabase
-- Run this in the Supabase SQL Editor (supabase.com → your project → SQL Editor → New query → paste → Run)
--
-- NOTE: Supabase handles the "users" auth table automatically via auth.users.
--       We store extra profile info in a separate `profiles` table.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Profiles (linked to Supabase auth.users via UUID)
CREATE TABLE IF NOT EXISTS profiles (
    user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name    TEXT,
    last_name     TEXT,
    immigration_status TEXT,
    province      TEXT,
    country       TEXT,
    arrival_date  DATE,
    permit_expiry DATE,
    language_test TEXT
);

-- 2. Admins
CREATE TABLE IF NOT EXISTS admins (
    admin_id  SERIAL PRIMARY KEY,
    user_id   UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role_level INT DEFAULT 1
);

-- 3. Task Templates (master library)
CREATE TABLE IF NOT EXISTS task_templates (
    task_template_id SERIAL PRIMARY KEY,
    title            TEXT NOT NULL,
    description      TEXT,
    category         TEXT,
    base_due_days    INT
);

-- 4. User Tasks (instances assigned to users)
CREATE TABLE IF NOT EXISTS user_tasks (
    user_task_id     SERIAL PRIMARY KEY,
    user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_template_id INT  REFERENCES task_templates(task_template_id) ON DELETE SET NULL,
    status           TEXT DEFAULT 'Pending',
    due_date         DATE,
    custom_note      TEXT
);

-- 5. Task Checklist (sub-steps per template)
CREATE TABLE IF NOT EXISTS task_checklist (
    checklist_id     SERIAL PRIMARY KEY,
    task_template_id INT REFERENCES task_templates(task_template_id) ON DELETE CASCADE,
    item_description TEXT,
    is_required      BOOLEAN DEFAULT TRUE
);

-- 6. Content DB (guides & pages managed by admins)
CREATE TABLE IF NOT EXISTS content_db (
    content_id       SERIAL PRIMARY KEY,
    page_name        TEXT,
    title            TEXT,
    body_content     TEXT,
    category         TEXT,
    status           TEXT DEFAULT 'Draft',  -- Published | Draft | Archived
    updated_by_admin INT REFERENCES admins(admin_id),
    last_updated     TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Resource Library
CREATE TABLE IF NOT EXISTS resource_library (
    resource_id SERIAL PRIMARY KEY,
    title       TEXT,
    url         TEXT,
    category    TEXT,
    description TEXT
);

-- 8. Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
    bookmark_id SERIAL PRIMARY KEY,
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_id INT  REFERENCES resource_library(resource_id) ON DELETE CASCADE,
    UNIQUE (user_id, resource_id)
);

-- 9. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message         TEXT,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Community Q&A
CREATE TABLE IF NOT EXISTS community_qa (
    qa_id            SERIAL PRIMARY KEY,
    user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    question         TEXT,
    answer           TEXT,
    tags             TEXT[],
    answered_by_admin INT REFERENCES admins(admin_id),
    is_moderated     BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FAQ
CREATE TABLE IF NOT EXISTS faq_db (
    faq_id   SERIAL PRIMARY KEY,
    question TEXT,
    answer   TEXT,
    category TEXT
);

-- 12. Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
    audit_id         SERIAL PRIMARY KEY,
    admin_id         INT REFERENCES admins(admin_id),
    action_performed TEXT,
    action_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security (RLS) — users can only see their own rows
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_qa  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own profile" ON profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Own tasks" ON user_tasks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Own bookmarks" ON bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- Community posts: users can read all, only insert their own
CREATE POLICY "Read community" ON community_qa
    FOR SELECT USING (TRUE);

CREATE POLICY "Insert own community post" ON community_qa
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read for templates, checklist, faq, resources
ALTER TABLE task_templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_checklist  ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_db          ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_db      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read templates"  ON task_templates   FOR SELECT USING (TRUE);
CREATE POLICY "Public read checklist"  ON task_checklist   FOR SELECT USING (TRUE);
CREATE POLICY "Public read faq"        ON faq_db           FOR SELECT USING (TRUE);
CREATE POLICY "Public read resources"  ON resource_library FOR SELECT USING (TRUE);
CREATE POLICY "Public read content"    ON content_db       FOR SELECT USING (status = 'Published');

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Task Templates
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO task_templates (title, description, category, base_due_days) VALUES
  ('Apply for Social Insurance Number (SIN)',   'Visit Service Canada or apply online with your passport and immigration document.',        'Employment',  7),
  ('Open a Canadian Bank Account',              'Major banks offer newcomer packages. Bring passport, SIN, and proof of address.',         'Banking',     14),
  ('Register for Provincial Health Card',       'Apply through your province health ministry. 3-month wait period applies in most provinces.','Health',    30),
  ('Secure Permanent Housing',                  'Connect with settlement agencies or search rental listing platforms.',                    'Housing',     30),
  ('Renew Study / Work Permit',                 'Apply at least 90 days before expiry through the IRCC online portal.',                   'Immigration', 90),
  ('File Annual Income Tax Return',             'Even with no income, filing establishes Canadian tax residency.',                        'Tax',        120),
  ('Get a Canadian SIM / Phone Plan',           'Carriers offer newcomer plans. Compare Fido, Rogers, Koodo, and Telus.',                 'General',     7),
  ('Set Up Utilities (Hydro, Internet)',        'Contact your local hydro provider and internet service provider after moving in.',       'Housing',     14),
  ('Find a Family Doctor',                      'Register with a family health team. Many areas have walk-in clinics while you wait.',    'Health',      60),
  ('Research PR Pathways',                      'Express Entry, PNP, and Atlantic Immigration Program are common routes.',               'Immigration', 365)
ON CONFLICT DO NOTHING;

-- Seed: FAQ
INSERT INTO faq_db (question, answer, category) VALUES
  ('How do I apply for a SIN?',              'Visit a Service Canada office in person, or apply online at canada.ca. You need your passport and immigration document.',                'Employment'),
  ('When should I renew my study permit?',   'Apply at least 90 days before expiry. Processing can take 3–4 months via the IRCC portal.',                                            'Immigration'),
  ('What is the 3-month health card wait?',  'Most provinces require 3 months of residency before coverage begins. Register as soon as you arrive.',                                 'Health'),
  ('Do I need to file taxes with no income?','Yes. Filing establishes Canadian tax residency and qualifies you for GST/HST credit and carbon rebate.',                               'Tax'),
  ('How do I open a bank account?',          'Most major banks offer newcomer packages with no monthly fees. Bring your passport, SIN, and proof of address to any branch.',         'Banking')
ON CONFLICT DO NOTHING;
