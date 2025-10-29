-- Migration: Add add-ons system for Landing Page service
-- Date: 2025-10-29
-- Description: Creates add_ons and project_add_ons tables for service add-ons functionality

-- Create add_ons table
CREATE TABLE IF NOT EXISTS `add_ons` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `service_type_id` integer REFERENCES service_types(id) ON DELETE CASCADE,
  `name` text NOT NULL,
  `description` text NOT NULL,
  `category` text NOT NULL,
  `price` integer NOT NULL,
  `is_free` integer DEFAULT 0,
  `is_active` integer DEFAULT 1,
  `sort_order` integer DEFAULT 0,
  `created_at` integer NOT NULL
);

-- Create project_add_ons junction table
CREATE TABLE IF NOT EXISTS `project_add_ons` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `project_id` integer NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  `add_on_id` integer NOT NULL REFERENCES add_ons(id) ON DELETE CASCADE,
  `price` integer NOT NULL,
  `created_at` integer NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS `idx_add_ons_service_type` ON `add_ons`(`service_type_id`);
CREATE INDEX IF NOT EXISTS `idx_add_ons_category` ON `add_ons`(`category`);
CREATE INDEX IF NOT EXISTS `idx_add_ons_is_active` ON `add_ons`(`is_active`);
CREATE INDEX IF NOT EXISTS `idx_project_add_ons_project` ON `project_add_ons`(`project_id`);
CREATE INDEX IF NOT EXISTS `idx_project_add_ons_addon` ON `project_add_ons`(`add_on_id`);
