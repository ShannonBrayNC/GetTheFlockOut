CREATE TABLE `audit_actions` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`target` text NOT NULL,
	`note` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ops_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `provider_events` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`event` text NOT NULL,
	`recipients` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `deliveries` ADD `next_attempt` text;--> statement-breakpoint
ALTER TABLE `signatures` ADD `verification` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `signatures` ADD `verification_note` text;--> statement-breakpoint
ALTER TABLE `signatures` ADD `reviewed_at` text;--> statement-breakpoint
ALTER TABLE `signatures` ADD `withdrawn_at` text;