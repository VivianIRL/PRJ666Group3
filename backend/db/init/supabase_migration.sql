-- ==========================================
-- SettleCAN Complete Schema & Seed Script
-- ==========================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Clean Slate (drop application tables in reverse-dependency order)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS faq_db CASCADE;
DROP TABLE IF EXISTS community_qa CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS resource_library CASCADE;
DROP TABLE IF EXISTS content_db CASCADE;
DROP TABLE IF EXISTS task_checklist CASCADE;
DROP TABLE IF EXISTS user_tasks CASCADE;
DROP TABLE IF EXISTS task_templates CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS api_inventory CASCADE;

-- 2. Core Tables Setup
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    immigration_status TEXT,
    province TEXT,
    country TEXT,
    arrival_date DATE,
    permit_expiry DATE,
    language_test TEXT
);

CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    role_level INT DEFAULT 1
);

CREATE TABLE task_templates (
    task_template_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    base_due_days INT
);

CREATE TABLE user_tasks (
    user_task_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    task_template_id INT REFERENCES task_templates(task_template_id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Pending',
    due_date DATE,
    custom_note TEXT
);

CREATE TABLE task_checklist (
    checklist_id SERIAL PRIMARY KEY,
    task_template_id INT REFERENCES task_templates(task_template_id) ON DELETE CASCADE,
    item_description TEXT,
    is_required BOOLEAN DEFAULT TRUE
);

CREATE TABLE content_db (
    content_id SERIAL PRIMARY KEY,
    page_name TEXT,
    title TEXT,
    body_content TEXT,
    category TEXT,
    status TEXT DEFAULT 'Draft',
    updated_by_admin INT,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resource_library (
    resource_id SERIAL PRIMARY KEY,
    title TEXT,
    url TEXT,
    category TEXT,
    description TEXT
);

CREATE TABLE bookmarks (
    bookmark_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    resource_id INT REFERENCES resource_library(resource_id) ON DELETE CASCADE,
    UNIQUE (user_id, resource_id)
);

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE community_qa (
    qa_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    question TEXT,
    answer TEXT,
    tags TEXT[],
    answered_by_admin INT REFERENCES admins(admin_id) ON DELETE SET NULL,
    is_moderated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE faq_db (
    faq_id SERIAL PRIMARY KEY,
    question TEXT,
    answer TEXT,
    category TEXT
);

CREATE TABLE audit_log (
    audit_id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES admins(admin_id) ON DELETE SET NULL,
    action_performed TEXT,
    action_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_inventory (
    api_id SERIAL PRIMARY KEY,
    api_name TEXT,
    endpoint_url TEXT,
    api_key_alias TEXT
);

ALTER TABLE content_db
  ADD CONSTRAINT content_db_admin_fk
  FOREIGN KEY (updated_by_admin) REFERENCES admins(admin_id) ON DELETE SET NULL;

-- 3. Create users and profiles immediately after Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  metadata JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
BEGIN
  INSERT INTO public.users (user_id, email, password_hash)
  VALUES (NEW.id, NEW.email, NEW.encrypted_password)
  ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash;

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_qa ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Users can view own user" ON users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tasks" ON user_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON user_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON user_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON user_tasks
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read community posts" ON community_qa
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert own community posts" ON community_qa
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public reference data
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_db ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_db ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read templates" ON task_templates FOR SELECT USING (TRUE);
CREATE POLICY "Public read checklist" ON task_checklist FOR SELECT USING (TRUE);
CREATE POLICY "Public read faq" ON faq_db FOR SELECT USING (TRUE);
CREATE POLICY "Public read resources" ON resource_library FOR SELECT USING (TRUE);
CREATE POLICY "Public read published content" ON content_db FOR SELECT USING (status = 'Published');

-- 6. Seed Data
INSERT INTO users (user_id, email, password_hash) VALUES
('11111111-1111-1111-1111-111111111111', 'amina@test.com', 'hash1'),
('22222222-2222-2222-2222-222222222222', 'john@test.com', 'hash2'),
('33333333-3333-3333-3333-333333333333', 'wei@test.com', 'hash3'),
('44444444-4444-4444-4444-444444444444', 'maria@test.com', 'hash4');

INSERT INTO profiles (user_id, first_name, last_name, immigration_status, province, country, arrival_date, permit_expiry, language_test) VALUES
('11111111-1111-1111-1111-111111111111', 'Amina', 'Khan', 'Permanent Resident', 'Ontario', 'India', '2022-06-15', '2027-06-15', 'IELTS'),
('22222222-2222-2222-2222-222222222222', 'John', 'Smith', 'Citizen', 'BC', 'UK', '2020-03-10', NULL, NULL),
('33333333-3333-3333-3333-333333333333', 'Wei', 'Chen', 'Student Visa', 'Ontario', 'China', '2024-01-20', '2026-01-15', 'CELPIP'),
('44444444-4444-4444-4444-444444444444', 'Maria', 'Gonzalez', 'Work Permit', 'Alberta', 'Mexico', '2023-09-05', '2025-09-05', 'IELTS');

INSERT INTO admins (user_id, role_level) VALUES
('11111111-1111-1111-1111-111111111111', 2),
('22222222-2222-2222-2222-222222222222', 1);

INSERT INTO task_templates (title, description, category, base_due_days) VALUES
('Apply for Health Card', 'Register provincial health insurance', 'Health', 30),
('Open Bank Account', 'Set up Canadian bank account', 'Finance', 7),
('Find Housing', 'Search for rental housing', 'Housing', 14),
('Get SIN Number', 'Apply for Social Insurance Number', 'Government', 5);

INSERT INTO task_checklist (task_template_id, item_description, is_required) VALUES
(1, 'Gather passport and identity documents', TRUE),
(1, 'Fill out provincial health registration form', TRUE),
(2, 'Book an appointment with the bank branch', FALSE),
(2, 'Bring your passport and SIN/work permit', TRUE),
(4, 'Locate the nearest Service Canada center', TRUE);

INSERT INTO user_tasks (user_id, task_template_id, status, due_date, custom_note) VALUES
('11111111-1111-1111-1111-111111111111', 1, 'Pending', '2026-06-01', 'Urgent'),
('11111111-1111-1111-1111-111111111111', 2, 'Completed', '2026-05-20', 'Done at RBC'),
('22222222-2222-2222-2222-222222222222', 3, 'Pending', '2026-06-10', 'Looking in Toronto'),
('33333333-3333-3333-3333-333333333333', 4, 'In Progress', '2026-05-25', 'Need documents');

INSERT INTO content_db (page_name, title, body_content, category, status) VALUES
('Landing Page', 'Welcome', 'Welcome to SettleCAN', 'General', 'Published'),
('Guide', 'Immigration Guide', 'Step-by-step immigration guide', 'Immigration', 'Published'),
('Housing Tips', 'Housing Tips', 'How to find affordable housing in Canada', 'Housing', 'Published');

INSERT INTO resource_library (title, url, category, description) VALUES
('IRCC Website', 'https://www.canada.ca', 'Government', 'Official immigration site'),
('Toronto Housing', 'https://kijiji.ca', 'Housing', 'Rental listings'),
('Banking Guide', 'https://rbc.com', 'Finance', 'Bank setup guide');

INSERT INTO bookmarks (user_id, resource_id) VALUES
('11111111-1111-1111-1111-111111111111', 1),
('11111111-1111-1111-1111-111111111111', 2),
('22222222-2222-2222-2222-222222222222', 3);

INSERT INTO notifications (user_id, message) VALUES
('11111111-1111-1111-1111-111111111111', 'Your Health Card application is due soon'),
('22222222-2222-2222-2222-222222222222', 'New housing resource available'),
('33333333-3333-3333-3333-333333333333', 'Task updated: Get SIN Number');

INSERT INTO community_qa (user_id, question, answer, answered_by_admin, is_moderated) VALUES
('11111111-1111-1111-1111-111111111111', 'How do I open a bank account?', 'Visit RBC or TD branch with ID', 1, TRUE),
('22222222-2222-2222-2222-222222222222', 'How long to get PR card?', 'Usually 2–3 months', 2, TRUE);

INSERT INTO faq_db (question, answer, category) VALUES
('What is SIN?', 'Social Insurance Number used for work in Canada', 'Government'),
('How to find housing?', 'Use Kijiji or Realtor.ca', 'Housing');

INSERT INTO audit_log (admin_id, action_performed) VALUES
(1, 'Created task templates'),
(2, 'Updated FAQ entries');

COMMIT;

-- Refresh Supabase schema cache
NOTIFY pgrst, 'reload schema';
