-- ==========================================
-- Fixes the "Default Top Priorities" bug: 002_task_hierarchy_system.sql
-- only seeded templates for a coarse STUDENT/WORKER bucket, and
-- templateService.resolveCategory only ever mapped 2 of the app's 5
-- immigration statuses onto it — so Permanent Resident, Refugee/Protected
-- Person, and Visitor/Tourist users never had any template to generate
-- tasks from. This migration replaces that seed with one template per
-- actual status (matching profiles.immigration_status exactly), each with
-- its categories as root tasks and their checklist items as subtasks —
-- content ported from the old Checklist.jsx CATEGORIES_BY_STATUS, so the
-- "Recommended for <status>" priorities shown on the Dashboard become real,
-- persisted tasks instead of a static fallback list.
-- Run AFTER 002_task_hierarchy_system.sql.
-- ==========================================

BEGIN;

DELETE FROM task_hierarchy_templates WHERE user_category IN ('STUDENT', 'WORKER');

INSERT INTO task_hierarchy_templates (name, user_category, description, version, is_active) VALUES
  ('International Student Onboarding', 'International Student', 'Core settlement tasks for international students.', 1, TRUE),
  ('Work Permit Holder Onboarding', 'Work Permit Holder', 'Core settlement tasks for temporary foreign workers.', 1, TRUE),
  ('Permanent Resident Onboarding', 'Permanent Resident', 'Core settlement tasks for new permanent residents.', 1, TRUE),
  ('Refugee / Protected Person Onboarding', 'Refugee / Protected Person', 'Core settlement tasks for protected persons.', 1, TRUE),
  ('Visitor / Tourist Onboarding', 'Visitor / Tourist', 'Core tasks for visitors and tourists.', 1, TRUE)
ON CONFLICT (user_category, version) DO NOTHING;

-- ── Root tasks (one per settlement category) ────────────────────────────────
INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, default_due_offset_days, sort_order)
SELECT t.template_id, NULL, v.title, v.description, v.offset_days, v.sort_order
FROM (VALUES
  ('International Student','Arrival & Registration','Essential steps to take right after you arrive in Canada.',14,1),
  ('International Student','Housing','Find and set up your place to live.',30,2),
  ('International Student','School & Studies','Get set up with your school, ID, and coverage.',14,3),
  ('International Student','Study Permit','Keep your study permit valid and understand its conditions.',90,4),
  ('International Student','Finance & Tax','Stay on top of tuition, discounts, and tax filing.',NULL,5),

  ('Work Permit Holder','Arrival & Registration','Essential steps to take right after you arrive in Canada.',14,1),
  ('Work Permit Holder','Housing','Find and set up your place to live.',30,2),
  ('Work Permit Holder','Employment & Work Permit','Confirm your work permit conditions and renewal timeline.',90,3),
  ('Work Permit Holder','PR Pathway Planning','Research and prepare for your route to permanent residence.',NULL,4),
  ('Work Permit Holder','Finance & Tax','Set up payroll deposits, credit history, and tax filing.',NULL,5),

  ('Permanent Resident','PR Activation','Land, apply for your SIN, and get your PR card.',14,1),
  ('Permanent Resident','Health & Services','Register for health coverage and family services.',7,2),
  ('Permanent Resident','Housing','Find and set up your place to live.',30,3),
  ('Permanent Resident','Finance & Credit','Open accounts, build credit, and file taxes.',NULL,4),
  ('Permanent Resident','Citizenship Planning','Track your presence days and prepare for citizenship.',NULL,5),

  ('Refugee / Protected Person','Documentation & Status','Get your protection status documents and apply for PR.',7,1),
  ('Refugee / Protected Person','Health & Support','Register for interim health coverage and settlement support.',7,2),
  ('Refugee / Protected Person','Banking & Essential Services','Open a bank account and access language/settlement services.',14,3),

  ('Visitor / Tourist','Arrival & Stay Documents','Confirm your authorized stay and keep your documents valid.',1,1),
  ('Visitor / Tourist','Health & Insurance','Get visitor health insurance and know where to go if you need care.',1,2),
  ('Visitor / Tourist','Getting Around & Local Life','Set up a phone plan, transit app, and everyday banking.',3,3),
  ('Visitor / Tourist','Extending or Changing Your Status','Apply to extend your stay or explore longer-term permits.',150,4)
) AS v(user_category, title, description, offset_days, sort_order)
JOIN task_hierarchy_templates t ON t.user_category = v.user_category AND t.version = 1
WHERE NOT EXISTS (
  SELECT 1 FROM task_hierarchy_template_items i
  WHERE i.template_id = t.template_id AND i.parent_item_id IS NULL AND i.title = v.title
);

-- ── Subtasks (the old flat checklist items, now nested under their task) ────
INSERT INTO task_hierarchy_template_items (template_id, parent_item_id, title, description, default_due_offset_days, sort_order)
SELECT parent.template_id, parent.item_id, v.title, NULL, NULL, v.sort_order
FROM (VALUES
  ('International Student','Arrival & Registration','Get your SIN (Social Insurance Number)',1),
  ('International Student','Arrival & Registration','Register for provincial health insurance',2),
  ('International Student','Arrival & Registration','Open a Canadian bank account',3),
  ('International Student','Arrival & Registration','Get a Canadian SIM card / phone plan',4),
  ('International Student','Housing','Sign your lease or confirm housing arrangement',1),
  ('International Student','Housing','Set up utilities (hydro, internet)',2),
  ('International Student','Housing','Get tenant insurance',3),
  ('International Student','School & Studies','Complete enrollment / course registration',1),
  ('International Student','School & Studies','Get your student ID card',2),
  ('International Student','School & Studies','Set up school email and online accounts',3),
  ('International Student','School & Studies','Get student health insurance through your institution',4),
  ('International Student','School & Studies','Attend orientation week',5),
  ('International Student','Study Permit','Confirm study permit is valid and up to date',1),
  ('International Student','Study Permit','Note study permit expiry — set a 90-day renewal reminder',2),
  ('International Student','Study Permit','Understand the 24-hr off-campus work rule',3),
  ('International Student','Study Permit','Apply for co-op work permit if your program requires it',4),
  ('International Student','Study Permit','Research PGWP eligibility for after graduation',5),
  ('International Student','Finance & Tax','Pay tuition and fees on time',1),
  ('International Student','Finance & Tax','Apply for TTC / transit card and student discount',2),
  ('International Student','Finance & Tax','Apply for any scholarships or bursaries',3),
  ('International Student','Finance & Tax','File a tax return (required after your first year)',4),

  ('Work Permit Holder','Arrival & Registration','Apply for SIN at Service Canada',1),
  ('Work Permit Holder','Arrival & Registration','Register for provincial health card',2),
  ('Work Permit Holder','Arrival & Registration','Open a Canadian bank account',3),
  ('Work Permit Holder','Arrival & Registration','Get a Canadian SIM card / phone plan',4),
  ('Work Permit Holder','Housing','Secure permanent housing',1),
  ('Work Permit Holder','Housing','Set up utilities (hydro, internet)',2),
  ('Work Permit Holder','Housing','Get tenant insurance',3),
  ('Work Permit Holder','Employment & Work Permit','Confirm your work permit conditions (employer, location, NOC)',1),
  ('Work Permit Holder','Employment & Work Permit','Set renewal reminder 90 days before permit expires',2),
  ('Work Permit Holder','Employment & Work Permit','Never work for a different employer without a new permit',3),
  ('Work Permit Holder','Employment & Work Permit','Get a copy of your employment contract',4),
  ('Work Permit Holder','PR Pathway Planning','Research Express Entry (CEC, FSW)',1),
  ('Work Permit Holder','PR Pathway Planning','Accumulate 1 year TEER 0–3 experience for CEC',2),
  ('Work Permit Holder','PR Pathway Planning','Improve language score (IELTS/CELPIP) for Express Entry CRS',3),
  ('Work Permit Holder','PR Pathway Planning','Check Provincial Nominee Program (PNP) for your province',4),
  ('Work Permit Holder','Finance & Tax','Set up direct deposit with your employer',1),
  ('Work Permit Holder','Finance & Tax','Start building Canadian credit history',2),
  ('Work Permit Holder','Finance & Tax','File Canadian taxes each April',3),

  ('Permanent Resident','PR Activation','Land before your COPR (Confirmation of PR) expiry date',1),
  ('Permanent Resident','PR Activation','Apply for SIN — your new SIN will NOT start with 9',2),
  ('Permanent Resident','PR Activation','Apply for PR card immediately after landing',3),
  ('Permanent Resident','PR Activation','Keep your PR card — you need it to re-enter Canada',4),
  ('Permanent Resident','Health & Services','Apply for provincial health card on arrival',1),
  ('Permanent Resident','Health & Services','Register children in school via local school board',2),
  ('Permanent Resident','Health & Services','Find a family doctor or register with a health team',3),
  ('Permanent Resident','Housing','Secure permanent housing',1),
  ('Permanent Resident','Housing','Understand tenant rights in your province',2),
  ('Permanent Resident','Housing','Set up utilities and get tenant insurance',3),
  ('Permanent Resident','Finance & Credit','Open a Canadian bank account',1),
  ('Permanent Resident','Finance & Credit','Start building Canadian credit history',2),
  ('Permanent Resident','Finance & Credit','File Canadian taxes each April',3),
  ('Permanent Resident','Finance & Credit','Enrol in LINC / ESL language classes if needed (free)',4),
  ('Permanent Resident','Citizenship Planning','Track physical presence days (need 1,095 days in 5 years)',1),
  ('Permanent Resident','Citizenship Planning','Renew PR card 9 months before expiry',2),
  ('Permanent Resident','Citizenship Planning','Prepare for citizenship test (language, history, rights)',3),

  ('Refugee / Protected Person','Documentation & Status','Receive your Protected Person determination document',1),
  ('Refugee / Protected Person','Documentation & Status','Apply for SIN',2),
  ('Refugee / Protected Person','Documentation & Status','Apply for Convention Refugee Travel Document (CRTD)',3),
  ('Refugee / Protected Person','Documentation & Status','Apply for PR — protected persons are eligible immediately',4),
  ('Refugee / Protected Person','Health & Support','Register for IFHP (Interim Federal Health Program)',1),
  ('Refugee / Protected Person','Health & Support','Connect with a settlement agency near you',2),
  ('Refugee / Protected Person','Health & Support','Access legal aid if your claim is still pending',3),
  ('Refugee / Protected Person','Health & Support','Apply for RAP (Resettlement Assistance Program) if eligible',4),
  ('Refugee / Protected Person','Banking & Essential Services','Open a bank account (some banks have refugee-specific packages)',1),
  ('Refugee / Protected Person','Banking & Essential Services','Enroll in LINC / ESL language classes (free)',2),
  ('Refugee / Protected Person','Banking & Essential Services','Secure stable housing',3),

  ('Visitor / Tourist','Arrival & Stay Documents','Confirm your authorized stay duration on entry stamp or eTA',1),
  ('Visitor / Tourist','Arrival & Stay Documents','Keep your passport valid for the full duration of your stay',2),
  ('Visitor / Tourist','Arrival & Stay Documents','Note: working or studying requires a separate permit — do not do either without one',3),
  ('Visitor / Tourist','Arrival & Stay Documents','Register with your country''s embassy or consulate in Canada',4),
  ('Visitor / Tourist','Health & Insurance','Purchase visitor health insurance — provincial health does not cover temporary residents',1),
  ('Visitor / Tourist','Health & Insurance','Locate the nearest hospital, walk-in clinic, and pharmacy',2),
  ('Visitor / Tourist','Health & Insurance','Save the emergency number 911 and provincial health line 811',3),
  ('Visitor / Tourist','Getting Around & Local Life','Get a local SIM card or activate international roaming',1),
  ('Visitor / Tourist','Getting Around & Local Life','Download a transit app for your city (TTC, STM, Moovit, Transit)',2),
  ('Visitor / Tourist','Getting Around & Local Life','Set up a travel-friendly debit or credit card to avoid foreign fees',3),
  ('Visitor / Tourist','Getting Around & Local Life','Open a Canadian bank account if staying longer than 3 months',4),
  ('Visitor / Tourist','Extending or Changing Your Status','Apply to extend your stay via IRCC at least 30 days before expiry',1),
  ('Visitor / Tourist','Extending or Changing Your Status','Do not overstay — being out-of-status can affect all future Canadian applications',2),
  ('Visitor / Tourist','Extending or Changing Your Status','Explore Super Visa if visiting parents / grandparents of a Canadian PR or citizen',3),
  ('Visitor / Tourist','Extending or Changing Your Status','Research pathways to a work or study permit if you plan to stay longer',4)
) AS v(user_category, parent_title, title, sort_order)
JOIN task_hierarchy_templates t ON t.user_category = v.user_category AND t.version = 1
JOIN task_hierarchy_template_items parent
  ON parent.template_id = t.template_id AND parent.parent_item_id IS NULL AND parent.title = v.parent_title
WHERE NOT EXISTS (
  SELECT 1 FROM task_hierarchy_template_items i
  WHERE i.template_id = t.template_id AND i.parent_item_id = parent.item_id AND i.title = v.title
);

COMMIT;

NOTIFY pgrst, 'reload schema';
