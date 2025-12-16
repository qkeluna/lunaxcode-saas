-- Migration: Add site_settings table
-- This table stores key-value pairs for site configuration (WhatsApp widget, etc.)

CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Insert default settings
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('whatsapp_enabled', 'true');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('whatsapp_number', '639190852974');
