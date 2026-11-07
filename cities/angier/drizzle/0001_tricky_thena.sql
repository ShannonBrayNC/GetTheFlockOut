ALTER TABLE `deliveries` ADD `first_attempt` text;--> statement-breakpoint
ALTER TABLE `deliveries` ADD `payload` text;--> statement-breakpoint
ALTER TABLE `deliveries` ADD `provider_id` text;--> statement-breakpoint
ALTER TABLE `deliveries` ADD `reason` text;--> statement-breakpoint
ALTER TABLE `signatures` ADD `consent_version` text;--> statement-breakpoint
ALTER TABLE `signatures` ADD `prior_paper` integer;