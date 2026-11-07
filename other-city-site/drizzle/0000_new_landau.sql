CREATE TABLE `interests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_email` text NOT NULL,
	`name` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`county` text NOT NULL,
	`zip` text NOT NULL,
	`contact_email` text NOT NULL,
	`telephone` text,
	`message` text,
	`get_involved` integer NOT NULL,
	`consent_version` text NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `interests_user_id_unique` ON `interests` (`user_id`);