CREATE TABLE `deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`signature` text NOT NULL,
	`recipient` text NOT NULL,
	`status` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `signatures` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`city` text NOT NULL,
	`zip` text NOT NULL,
	`resident` integer NOT NULL,
	`created` text NOT NULL,
	`version` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `signatures_user_id_unique` ON `signatures` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `signatures_email_unique` ON `signatures` (`email`);