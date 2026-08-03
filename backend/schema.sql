-- Database Schema for Expense Voucher Management System

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('EMPLOYEE', 'DIRECTOR', 'ACCOUNTS')),
    department TEXT NOT NULL,
    employee_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_number TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    employee_name TEXT NOT NULL,
    employee_code TEXT,
    department TEXT NOT NULL,
    expense_title TEXT NOT NULL,
    expense_category TEXT NOT NULL,
    expense_description TEXT,
    expense_date TEXT NOT NULL,
    voucher_date TEXT NOT NULL,
    amount REAL NOT NULL CHECK(amount > 0),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED')),
    employee_signature TEXT,
    director_signature TEXT,
    rejection_reason TEXT,
    approval_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vouchers_user ON vouchers(user_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_number ON vouchers(voucher_number);
