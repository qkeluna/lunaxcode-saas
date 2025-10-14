-- Migration: Add project_answers table and update schema
-- Date: 2025-10-14

-- Step 1: Rename columns in questions table
ALTER TABLE `questions` RENAME COLUMN `label` TO `question_text`;
ALTER TABLE `questions` RENAME COLUMN `type` TO `question_type`;
ALTER TABLE `questions` RENAME COLUMN `is_required` TO `required`;
ALTER TABLE `questions` ADD `sort_order` integer DEFAULT 0;
ALTER TABLE `questions` ADD `created_at` integer;

-- Step 2: Add created_at to question_options
ALTER TABLE `question_options` ADD `created_at` integer;

-- Step 3: Create project_answers table
CREATE TABLE `project_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`question_id` integer NOT NULL,
	`question_key` text NOT NULL,
	`answer_value` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);

-- Step 4: Create indexes for performance
CREATE INDEX `idx_project_answers_project_id` ON `project_answers` (`project_id`);
CREATE INDEX `idx_project_answers_question_id` ON `project_answers` (`question_id`);

-- Step 5: Update existing questions to populate sort_order and created_at
UPDATE `questions` SET `sort_order` = `id`, `created_at` = strftime('%s', 'now');

-- Step 6: Update existing question_options to populate created_at
UPDATE `question_options` SET `created_at` = strftime('%s', 'now');
