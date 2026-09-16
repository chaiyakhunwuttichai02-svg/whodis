-- =======================================================
-- Cloudflare D1 Database Schema สำหรับระบบ Whodis
-- =======================================================

-- 1. ตารางผู้ใช้งาน (users)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางรายงานเบาะแสมิจฉาชีพ (reports)
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    scammer_name TEXT NOT NULL,
    bank_account TEXT NOT NULL,
    bank_name TEXT,
    incident_date TEXT,
    claim_amount REAL DEFAULT 0,
    incident_details TEXT,
    evidence_file TEXT,
    status TEXT DEFAULT 'UNDER INVESTIGATION',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตารางประวัติการค้นหา (search_logs)
CREATE TABLE IF NOT EXISTS search_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    search_term TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. ตารางรหัส OTP สำหรับรีเซ็ตรหัสผ่าน (password_resets)
CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. สร้างข้อมูลเริ่มต้นสำหรับบัญชี Admin
-- อีเมล: adminwhodis@gmail.com | รหัสผ่านเริ่มต้น: adminwhodis159753
INSERT OR IGNORE INTO users (username, email, password, role) 
VALUES (
    'Admin', 
    'adminwhodis@gmail.com', 
    'adminwhodis159753', 
    'admin'
);
