-- Migration: Add AI Usage Tracking and Settings Tables
-- Purpose: Enable secure server-side AI generation with per-user limits

-- AI Usage Log table (tracks all AI generations per user with limits)
CREATE TABLE IF NOT EXISTS `ai_usage_log` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text NOT NULL,
  `project_id` integer,
  `generation_type` text NOT NULL,
  `provider` text NOT NULL,
  `model` text NOT NULL,
  `prompt_tokens` integer,
  `completion_tokens` integer,
  `total_tokens` integer,
  `status` text DEFAULT 'success' NOT NULL,
  `error_message` text,
  `created_at` integer,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL
);

-- AI Settings table (admin-configured API keys stored server-side)
CREATE TABLE IF NOT EXISTS `ai_settings` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `provider` text NOT NULL UNIQUE,
  `api_key` text NOT NULL,
  `model` text NOT NULL,
  `is_active` integer DEFAULT true,
  `max_generations_per_user` integer DEFAULT 3,
  `created_by` text,
  `created_at` integer,
  `updated_at` integer,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
);

-- Index for faster lookups on user usage
CREATE INDEX IF NOT EXISTS `idx_ai_usage_user_id` ON `ai_usage_log` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_ai_usage_created_at` ON `ai_usage_log` (`created_at`);
CREATE INDEX IF NOT EXISTS `idx_ai_usage_generation_type` ON `ai_usage_log` (`generation_type`);

-- Index for active provider lookups
CREATE INDEX IF NOT EXISTS `idx_ai_settings_active` ON `ai_settings` (`is_active`);
