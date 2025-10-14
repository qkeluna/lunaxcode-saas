CREATE TABLE `question_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_id` integer NOT NULL,
	`option_value` text NOT NULL,
	`sort_order` integer DEFAULT 0,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`service_id` integer NOT NULL,
	`question_key` text NOT NULL,
	`label` text NOT NULL,
	`type` text NOT NULL,
	`is_required` integer DEFAULT false NOT NULL,
	`placeholder` text,
	FOREIGN KEY (`service_id`) REFERENCES `service_types`(`id`) ON UPDATE no action ON DELETE no action
);
