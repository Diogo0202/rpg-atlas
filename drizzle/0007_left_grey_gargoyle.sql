CREATE TABLE `campaignFactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`createdBy` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`objective` varchar(255),
	`tension` int NOT NULL DEFAULT 0,
	`maxTension` int NOT NULL DEFAULT 6,
	`ruptureConsequence` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaignFactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `campaignFactions` ADD CONSTRAINT `campaignFactions_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignFactions` ADD CONSTRAINT `campaignFactions_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `campaign_factions_campaign_idx` ON `campaignFactions` (`campaignId`);--> statement-breakpoint
CREATE INDEX `campaign_factions_creator_idx` ON `campaignFactions` (`createdBy`);