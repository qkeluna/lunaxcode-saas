-- Migration: Make projects.prd nullable
-- Date: 2025-10-14
-- Reason: PRD is generated asynchronously after project creation, so it must be nullable

-- SQLite doesn't support ALTER COLUMN directly, so we need to:
-- 1. Create a new table with the correct schema
-- 2. Copy data from old table
-- 3. Drop old table
-- 4. Rename new table

-- Create new table with nullable prd
CREATE TABLE projects_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  user_id TEXT NOT NULL,
  service_type_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  service TEXT NOT NULL,
  description TEXT NOT NULL,
  prd TEXT, -- Made nullable
  status TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  price INTEGER NOT NULL,
  deposit_amount INTEGER DEFAULT 0,
  timeline INTEGER,
  budget INTEGER,
  start_date INTEGER,
  end_date INTEGER,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (service_type_id) REFERENCES service_types(id)
);

-- Copy data from old table (explicitly list columns to ensure correct mapping)
INSERT INTO projects_new (
  id, user_id, service_type_id, name, service, description, prd, status,
  payment_status, price, deposit_amount, timeline, budget, start_date,
  end_date, client_name, client_email, client_phone, created_at, updated_at
)
SELECT
  id, user_id, service_type_id, name, service, description, prd, status,
  payment_status, price, deposit_amount, timeline, budget, start_date,
  end_date, client_name, client_email, client_phone, created_at, updated_at
FROM projects;

-- Drop old table
DROP TABLE projects;

-- Rename new table to original name
ALTER TABLE projects_new RENAME TO projects;

-- Recreate indexes if any existed
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_service_type_id ON projects(service_type_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
