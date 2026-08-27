CREATE TABLE `campaignEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`sessionId` int,
	`createdBy` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text,
	`status` enum('planned','active','resolved','failed','consequence') NOT NULL DEFAULT 'active',
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaignEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `campaignEvents` ADD CONSTRAINT `campaignEvents_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignEvents` ADD CONSTRAINT `campaignEvents_sessionId_campaignSessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `campaignSessions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignEvents` ADD CONSTRAINT `campaignEvents_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `campaign_events_campaign_idx` ON `campaignEvents` (`campaignId`);--> statement-breakpoint
CREATE INDEX `campaign_events_session_idx` ON `campaignEvents` (`sessionId`);--> statement-breakpoint
CREATE INDEX `campaign_events_occurred_idx` ON `campaignEvents` (`occurredAt`);