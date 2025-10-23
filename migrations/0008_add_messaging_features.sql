-- Migration: Add messaging notification features
-- Description: Enhance messages table and add unread tracking
-- Date: 2025-01-24

-- Add new columns to messages table (safe for existing data)
ALTER TABLE messages ADD COLUMN sender_role TEXT DEFAULT 'client';
ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'sent';
ALTER TABLE messages ADD COLUMN read_at INTEGER;

-- Create unread_counts table for badge performance
CREATE TABLE IF NOT EXISTS unread_counts (
  user_id TEXT PRIMARY KEY,
  total_count INTEGER DEFAULT 0,
  last_updated INTEGER NOT NULL
);

-- Create message_settings table for future features
CREATE TABLE IF NOT EXISTS message_settings (
  project_id INTEGER PRIMARY KEY,
  is_enabled INTEGER DEFAULT 1,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_messages_project_created ON messages(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_status ON messages(sender_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(status) WHERE status = 'sent';
