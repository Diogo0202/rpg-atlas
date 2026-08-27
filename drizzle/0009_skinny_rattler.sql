CREATE TABLE `campaignEventFactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`factionId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaignEventFactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaign_event_factions_unique` UNIQUE(`eventId`,`factionId`)
);
--> statement-breakpoint
ALTER TABLE `campaignEventFactions` ADD CONSTRAINT `campaignEventFactions_eventId_campaignEvents_id_fk` FOREIGN KEY (`eventId`) REFERENCES `campaignEvents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignEventFactions` ADD CONSTRAINT `campaignEventFactions_factionId_campaignFactions_id_fk` FOREIGN KEY (`factionId`) REFERENCES `campaignFactions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `campaign_event_factions_faction_idx` ON `campaignEventFactions` (`factionId`);