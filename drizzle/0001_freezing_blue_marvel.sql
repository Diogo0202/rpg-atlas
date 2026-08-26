CREATE TABLE `antagonistCharacters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`antagonistId` int NOT NULL,
	`characterId` int NOT NULL,
	`relation` enum('enemy','rival','target','ally','patron','debt') NOT NULL,
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
	`role` enum('rumor','presence','confrontation','aftermath') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `antagonistSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `antagonist_sessions_unique` UNIQUE(`antagonistId`,`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `antagonists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int,
	`campaignId` int,
	`systemId` varchar(64) NOT NULL,
	`name` varchar(160) NOT NULL,
	`creatureType` enum('vampire','werewolf','mage','mortal','faction','entity','other') NOT NULL,
	`threatLevel` enum('minor','moderate','major','critical','cataclysmic') NOT NULL,
	`summary` text NOT NULL,
	`hooks` json NOT NULL,
	`sourceTitle` varchar(255),
	`sourceUrl` text,
	`visibility` enum('private','campaign','public') NOT NULL DEFAULT 'private',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `antagonists_id` PRIMARY KEY(`id`)
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
CREATE TABLE `sourceDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` enum('guide','setting','antagonist','rules','supplement','folder','asset') NOT NULL,
	`driveFileId` varchar(128),
	`sourceUrl` text,
	`mimeType` varchar(128),
	`notes` text,
	`integrationStatus` enum('referenced','cataloged','integrated') NOT NULL DEFAULT 'referenced',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sourceDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `antagonistCharacters` ADD CONSTRAINT `antagonistCharacters_antagonistId_antagonists_id_fk` FOREIGN KEY (`antagonistId`) REFERENCES `antagonists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `antagonistCharacters` ADD CONSTRAINT `antagonistCharacters_characterId_characters_id_fk` FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `antagonistSessions` ADD CONSTRAINT `antagonistSessions_antagonistId_antagonists_id_fk` FOREIGN KEY (`antagonistId`) REFERENCES `antagonists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `antagonistSessions` ADD CONSTRAINT `antagonistSessions_sessionId_campaignSessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `campaignSessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `antagonists` ADD CONSTRAINT `antagonists_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `antagonists` ADD CONSTRAINT `antagonists_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `antagonists` ADD CONSTRAINT `antagonists_systemId_rpgSystems_id_fk` FOREIGN KEY (`systemId`) REFERENCES `rpgSystems`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignSessions` ADD CONSTRAINT `campaignSessions_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sourceDocuments` ADD CONSTRAINT `sourceDocuments_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `antagonist_characters_character_idx` ON `antagonistCharacters` (`characterId`);--> statement-breakpoint
CREATE INDEX `antagonist_sessions_session_idx` ON `antagonistSessions` (`sessionId`);--> statement-breakpoint
CREATE INDEX `antagonists_owner_idx` ON `antagonists` (`ownerId`);--> statement-breakpoint
CREATE INDEX `antagonists_campaign_idx` ON `antagonists` (`campaignId`);--> statement-breakpoint
CREATE INDEX `antagonists_system_idx` ON `antagonists` (`systemId`);--> statement-breakpoint
CREATE INDEX `antagonists_visibility_idx` ON `antagonists` (`visibility`);--> statement-breakpoint
CREATE INDEX `campaign_sessions_campaign_idx` ON `campaignSessions` (`campaignId`);--> statement-breakpoint
CREATE INDEX `source_documents_owner_idx` ON `sourceDocuments` (`ownerId`);--> statement-breakpoint
CREATE INDEX `source_documents_category_idx` ON `sourceDocuments` (`category`);