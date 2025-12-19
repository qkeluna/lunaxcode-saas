-- Migration: Add notification preferences table
-- This table stores user notification preferences for email notifications

CREATE TABLE IF NOT EXISTS notification_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_notifications INTEGER DEFAULT 1,  -- Master toggle for all email notifications
  project_updates INTEGER DEFAULT 1,      -- Project status change notifications
  payment_reminders INTEGER DEFAULT 1,    -- Payment due/overdue reminders
  task_updates INTEGER DEFAULT 1,         -- Task status change notifications
  message_notifications INTEGER DEFAULT 1, -- New message notifications
  marketing_emails INTEGER DEFAULT 0,     -- Marketing and promotional emails
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Create email_logs table to track sent emails (for debugging and preventing duplicates)
CREATE TABLE IF NOT EXISTS email_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL,           -- 'project_status', 'payment', 'message', 'task', 'admin_alert', 'contact'
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  resend_email_id TEXT,               -- ID returned from Resend API
  status TEXT DEFAULT 'sent',         -- 'sent', 'failed', 'bounced', 'delivered'
  error_message TEXT,
  metadata TEXT,                      -- JSON string with additional context
  created_at INTEGER DEFAULT (unixepoch())
);

-- Create index for email logs queries
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);
