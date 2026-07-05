CREATE DATABASE IF NOT EXISTS settlecan_app;
USE settlecan_app;

-- 1. Users & Authentication
CREATE TABLE users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles (Linked to Users)
CREATE TABLE profiles (
    user_id            INT PRIMARY KEY,
    first_name         VARCHAR(100),
    last_name          VARCHAR(100),
    immigration_status VARCHAR(50),
    province           VARCHAR(50),
    arrival_date       DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Admins
CREATE TABLE admins (
    admin_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNIQUE,
    role_level INT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 4. Task Templates (Master Library)
--    Each template defines a reusable task that can be assigned to any user.
--    base_due_days: how many days after arrival the task should be done.
--    target_immigration_status: optional — only show this template to users
--    with a matching immigration status (NULL = show to everyone).
CREATE TABLE task_templates (
    task_template_id         INT AUTO_INCREMENT PRIMARY KEY,
    title                    VARCHAR(255) NOT NULL,
    description              TEXT,
    category                 VARCHAR(100),
    base_due_days            INT,
    target_immigration_status VARCHAR(100) DEFAULT NULL,
    guide_url                VARCHAR(255) DEFAULT NULL,
    is_active                BOOLEAN DEFAULT TRUE,
    created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. User Tasks (Instances of templates assigned to a user)
--    status: Pending | In Progress | Completed | Skipped
--    completed_at: set automatically when status changes to Completed.
CREATE TABLE user_tasks (
    user_task_id     INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    task_template_id INT,
    status           VARCHAR(20) DEFAULT 'Pending',
    due_date         DATE,
    custom_note      TEXT,
    completed_at     TIMESTAMP NULL DEFAULT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)          REFERENCES users(user_id)          ON DELETE CASCADE,
    FOREIGN KEY (task_template_id) REFERENCES task_templates(task_template_id) ON DELETE SET NULL
);

-- 6. Task Checklist (Sub-steps for a task template)
--    Each row is one checklist item under a template.
--    is_required: marks items that must be done (shown with "Required" badge).
--    sort_order: controls display order within a template.
CREATE TABLE task_checklist (
    checklist_id     INT AUTO_INCREMENT PRIMARY KEY,
    task_template_id INT NOT NULL,
    item_description VARCHAR(255) NOT NULL,
    is_required      BOOLEAN DEFAULT TRUE,
    sort_order       INT DEFAULT 0,
    FOREIGN KEY (task_template_id) REFERENCES task_templates(task_template_id) ON DELETE CASCADE
);

-- 7. User Checklist Progress (tracks which checklist items a user has done)
--    Separate from user_tasks so sub-step completion is stored per user.
CREATE TABLE user_checklist_progress (
    progress_id  INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    checklist_id INT NOT NULL,
    is_done      BOOLEAN DEFAULT FALSE,
    done_at      TIMESTAMP NULL DEFAULT NULL,
    UNIQUE KEY uq_user_checklist (user_id, checklist_id),
    FOREIGN KEY (user_id)      REFERENCES users(user_id)          ON DELETE CASCADE,
    FOREIGN KEY (checklist_id) REFERENCES task_checklist(checklist_id) ON DELETE CASCADE
);

-- 8. Content DB (Guides & Pages)
CREATE TABLE content_db (
    content_id       INT AUTO_INCREMENT PRIMARY KEY,
    page_name        VARCHAR(100),
    body_content     TEXT,
    updated_by_admin INT,
    last_updated     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by_admin) REFERENCES admins(admin_id)
);

-- 9. Resource Library
CREATE TABLE resource_library (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255),
    url         TEXT,
    category    VARCHAR(100),
    description TEXT
);

-- 10. Bookmarks
CREATE TABLE bookmarks (
    bookmark_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT,
    resource_id INT,
    FOREIGN KEY (user_id)     REFERENCES users(user_id)            ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resource_library(resource_id) ON DELETE CASCADE
);

-- 11. Notifications
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT,
    message         TEXT,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 12. Community QA
CREATE TABLE community_qa (
    qa_id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT,
    question         TEXT,
    answer           TEXT,
    answered_by_admin INT,
    is_moderated     BOOLEAN DEFAULT FALSE,
    created_by_admin BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id)             REFERENCES users(user_id)  ON DELETE SET NULL,
    FOREIGN KEY (answered_by_admin)   REFERENCES admins(admin_id)
);

-- 13. Audit Log
CREATE TABLE audit_log (
    audit_id         INT AUTO_INCREMENT PRIMARY KEY,
    admin_id         INT,
    action_performed VARCHAR(255),
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
);

-- 13b. User Documents (metadata only — no file upload)
--     Tracks document name, type, and expiry date for a user.
--     user_task_id is optional — links a document to a specific task
--     (e.g. "SIN confirmation letter" attached to the SIN task).
CREATE TABLE user_documents (
    document_id  INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    user_task_id INT DEFAULT NULL,
    title        VARCHAR(255) NOT NULL,
    doc_type     VARCHAR(100) DEFAULT NULL,
    expiry_date  DATE DEFAULT NULL,
    notes        TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)      REFERENCES users(user_id)           ON DELETE CASCADE,
    FOREIGN KEY (user_task_id) REFERENCES user_tasks(user_task_id) ON DELETE SET NULL
);

-- 14. FAQ DB
CREATE TABLE faq_db (
    faq_id   INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT,
    answer   TEXT,
    category VARCHAR(100)
);

-- 15. API Inventory
CREATE TABLE api_inventory (
    api_id        INT AUTO_INCREMENT PRIMARY KEY,
    api_name      VARCHAR(100),
    endpoint_url  TEXT,
    api_key_alias VARCHAR(100)
);

-- ── Seed: Task Templates ──────────────────────────────────────────────────────
-- These match the MOCK_TEMPLATES in TasksDashboard.jsx so real DB data
-- produces the same tasks the frontend already shows.
INSERT INTO task_templates
    (title, description, category, base_due_days, target_immigration_status, guide_url)
VALUES
    ('Apply for Social Insurance Number (SIN)',
     'Visit Service Canada or apply online. You need your passport and study/work permit.',
     'Employment', 7, NULL, '/guides/sin'),

    ('Open a Canadian Bank Account',
     'TD and RBC have newcomer packages with no monthly fees for the first year.',
     'Banking', 14, NULL, '/guides/bank-account'),

    ('Register for Provincial Health Card',
     '3-month waiting period applies in most provinces. Apply as soon as you arrive.',
     'Health', 30, NULL, '/guides/health-card'),

    ('Secure Permanent Housing',
     'Connect with settlement agencies or search Kijiji, Zillow, and Facebook Marketplace.',
     'Housing', 30, NULL, '/housing'),

    ('Renew Study / Work Permit',
     'Apply at least 90 days before expiry through the IRCC online portal.',
     'Immigration', 90, NULL, '/guides/permit-renewal'),

    ('File Annual Income Tax Return',
     'Even with no income, filing taxes establishes Canadian tax residency.',
     'Finance', 365, NULL, '/guides/tax-return');

-- ── Seed: Task Checklist Sub-steps ───────────────────────────────────────────
-- Sub-steps for SIN application (template 1)
INSERT INTO task_checklist (task_template_id, item_description, is_required, sort_order) VALUES
    (1, 'Gather required documents: passport, study/work permit', TRUE,  1),
    (1, 'Visit Service Canada office or go to canada.ca/sin',     TRUE,  2),
    (1, 'Receive SIN confirmation letter',                         TRUE,  3),
    (1, 'Store SIN securely — never share it unnecessarily',       FALSE, 4);

-- Sub-steps for Bank Account (template 2)
INSERT INTO task_checklist (task_template_id, item_description, is_required, sort_order) VALUES
    (2, 'Compare newcomer accounts (TD, RBC, Scotiabank)',         FALSE, 1),
    (2, 'Book an appointment or visit a branch',                   TRUE,  2),
    (2, 'Bring passport, study/work permit, and proof of address', TRUE,  3),
    (2, 'Set up online banking and e-Transfer',                    FALSE, 4);

-- Sub-steps for Health Card (template 3)
INSERT INTO task_checklist (task_template_id, item_description, is_required, sort_order) VALUES
    (3, 'Check your province registration website',                TRUE,  1),
    (3, 'Gather documents: passport, permit, proof of address',    TRUE,  2),
    (3, 'Submit application online or in person',                  TRUE,  3),
    (3, 'Note 3-month waiting period — get private insurance',     FALSE, 4),
    (3, 'Receive health card in the mail',                         TRUE,  5);

-- Sub-steps for Permit Renewal (template 5)
INSERT INTO task_checklist (task_template_id, item_description, is_required, sort_order) VALUES
    (5, 'Check permit expiry date',                                TRUE,  1),
    (5, 'Gather supporting documents (enrollment letter, etc.)',   TRUE,  2),
    (5, 'Apply online via IRCC portal at least 90 days early',     TRUE,  3),
    (5, 'Pay application fee',                                     TRUE,  4),
    (5, 'Note implied status — you can continue while waiting',    FALSE, 5);
