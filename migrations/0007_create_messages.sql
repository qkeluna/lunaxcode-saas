-- Migration: Create messages system tables
-- Description: Add messaging functionality between clients and admins
-- Date: 2025-01-24

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projectId INTEGER NOT NULL,
  senderId TEXT NOT NULL,
  senderRole TEXT NOT NULL CHECK(senderRole IN ('client', 'admin')),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK(status IN ('sent', 'read')),
  createdAt TEXT DEFAULT (datetime('now')),
  readAt TEXT,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_project_created ON messages(projectId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_status ON messages(senderId, status);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(status) WHERE status = 'sent';

-- Cached unread counts (denormalized for performance)
CREATE TABLE IF NOT EXISTS unread_counts (
  userId TEXT PRIMARY KEY,
  totalCount INTEGER DEFAULT 0,
  lastUpdated TEXT DEFAULT (datetime('now'))
);

-- Message settings per project (for future feature toggles)
CREATE TABLE IF NOT EXISTS message_settings (
  projectId INTEGER PRIMARY KEY,
  isEnabled INTEGER DEFAULT 1,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);
