CREATE TABLE `campaignMusicCues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`sessionId` int,
	`createdBy` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`sceneType` enum('arrival','exploration','intrigue','tension','combat','aftermath','rest') NOT NULL DEFAULT 'exploration',
	`durationSeconds` int NOT NULL DEFAULT 120,
	`musicPrompt` text NOT NULL,
	`notes` text,
	`audioUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaignMusicCues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `campaignMusicCues` ADD CONSTRAINT `campaignMusicCues_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignMusicCues` ADD CONSTRAINT `campaignMusicCues_sessionId_campaignSessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `campaignSessions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignMusicCues` ADD CONSTRAINT `campaignMusicCues_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `campaign_music_cues_campaign_idx` ON `campaignMusicCues` (`campaignId`);--> statement-breakpoint
CREATE INDEX `campaign_music_cues_session_idx` ON `campaignMusicCues` (`sessionId`);