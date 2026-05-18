CREATE DATABASE IF NOT EXISTS settlecan_app;
USE settlecan_app;

-- 1. Users & Authentication
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles (Linked to Users)
CREATE TABLE profiles (
    user_id INT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    immigration_status VARCHAR(50),
    province VARCHAR(50),
    arrival_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Admins
CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    role_level INT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 4. Task Templates (The Master Library)
CREATE TABLE task_templates (
    task_template_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    base_due_days INT
);

-- 5. User Tasks (The Instances)
CREATE TABLE user_tasks (
    user_task_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    task_template_id INT,
    status VARCHAR(20) DEFAULT 'Pending',
    due_date DATE,
    custom_note TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (task_template_id) REFERENCES task_templates(task_template_id)
);

-- 6. Task Checklist (Sub-steps)
CREATE TABLE task_checklist (
    checklist_id INT AUTO_INCREMENT PRIMARY KEY,
    task_template_id INT,
    item_description VARCHAR(255),
    is_required BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (task_template_id) REFERENCES task_templates(task_template_id)
);

-- 7. Content DB (Guides & Pages)
CREATE TABLE content_db (
    content_id INT AUTO_INCREMENT PRIMARY KEY,
    page_name VARCHAR(100),
    body_content TEXT,
    updated_by_admin INT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by_admin) REFERENCES admins(admin_id)
);

-- 8. Resource Library
CREATE TABLE resource_library (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    url TEXT,
    category VARCHAR(100),
    description TEXT
);

-- 9. Bookmarks
CREATE TABLE bookmarks (
    bookmark_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    resource_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (resource_id) REFERENCES resource_library(resource_id)
);

-- 10. Notifications
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 11. Community QA
CREATE TABLE community_qa (
    qa_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    question TEXT,
    answer TEXT,
    answered_by_admin INT,
    is_moderated BOOLEAN DEFAULT FALSE,
    created_by_admin BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (answered_by_admin) REFERENCES admins(admin_id)
);

-- 12. Audit Log
CREATE TABLE audit_log (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    action_performed VARCHAR(255),
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
);

-- 13. FAQ DB
CREATE TABLE faq_db (
    faq_id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT,
    answer TEXT,
    category VARCHAR(100)
);

-- 14. API Inventory
CREATE TABLE api_inventory (
    api_id INT AUTO_INCREMENT PRIMARY KEY,
    api_name VARCHAR(100),
    endpoint_url TEXT,
    api_key_alias VARCHAR(100)
);