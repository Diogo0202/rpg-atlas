CREATE TABLE `antagonistCharacters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`antagonistId` int NOT NULL,
	`characterId` int NOT NULL,
	`relation` enum('enemy','rival','target','ally','patron','debt') NOT NULL DEFAULT 'enemy',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `antagonistCharacters_id` PRIMARY KEY(`id`),
	CONSTRAINT `antagonist_characters_unique` UNIQUE(`antagonistId`,`characterId`)
);
--> statement-breakpoint
CREATE TABLE `antagonistSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`antagonistId` int NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('rumor','presence','confrontation','aftermath') NOT NULL DEFAULT 'presence',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `antagonistSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `antagonist_sessions_unique` UNIQUE(`antagonistId`,`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `campaignSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`sequence` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`summary` text,
	`status` enum('planned','played','archived') NOT NULL DEFAULT 'planned',
	`playedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaignSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaign_sessions_sequence_unique` UNIQUE(`campaignId`,`sequence`)
);
--> statement-breakpoint
ALTER TABLE `antagonistCharacters` ADD CONSTRAINT `antagonistCharacters_antagonistId_antagonists_id_fk` FOREIGN KEY (`antagonistId`) REFERENCES `antagonists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `antagonistCharacters` ADD CONSTRAINT `antagonistCharacters_characterId_characters_id_fk` FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `antagonistSessions` ADD CONSTRAINT `antagonistSessions_antagonistId_antagonists_id_fk` FOREIGN KEY (`antagonistId`) REFERENCES `antagonists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `antagonistSessions` ADD CONSTRAINT `antagonistSessions_sessionId_campaignSessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `campaignSessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignSessions` ADD CONSTRAINT `campaignSessions_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `antagonist_characters_character_idx` ON `antagonistCharacters` (`characterId`);--> statement-breakpoint
CREATE INDEX `antagonist_sessions_session_idx` ON `antagonistSessions` (`sessionId`);--> statement-breakpoint
CREATE INDEX `campaign_sessions_campaign_idx` ON `campaignSessions` (`campaignId`);