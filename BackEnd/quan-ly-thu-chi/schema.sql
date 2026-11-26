-- Cơ sở dữ liệu SQLite cho ứng dụng Quản lý thu chi
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT    NOT NULL,
    type           TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
    monthly_budget INTEGER NOT NULL DEFAULT 0 CHECK (monthly_budget >= 0),
    UNIQUE (name, type)
);

CREATE TABLE IF NOT EXISTS transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    amount      INTEGER NOT NULL CHECK (amount > 0),          -- đơn vị: VND
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    date        TEXT    NOT NULL,                             -- YYYY-MM-DD
    status      TEXT    NOT NULL DEFAULT 'completed'
                CHECK (status IN ('pending', 'completed', 'cancelled')),
    note        TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_transactions_date     ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
