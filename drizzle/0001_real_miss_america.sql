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
	`visibility` enum('private','campaign','public') NOT NULL DEFAULT 'public',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `antagonists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sourceDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int,
	`title` varchar(255) NOT NULL,
	`category` enum('guide','setting','antagonist','rules','supplement','folder','asset') NOT NULL,
	`driveFileId` varchar(128) NOT NULL,
	`sourceUrl` text NOT NULL,
	`mimeType` varchar(128),
	`integrationStatus` enum('referenced','cataloged','integrated') NOT NULL DEFAULT 'referenced',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sourceDocuments_id` PRIMARY KEY(`id`),
	CONSTRAINT `sourceDocuments_driveFileId_unique` UNIQUE(`driveFileId`)
);
--> statement-breakpoint
ALTER TABLE `antagonists` ADD CONSTRAINT `antagonists_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `antagonists` ADD CONSTRAINT `antagonists_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `antagonists` ADD CONSTRAINT `antagonists_systemId_rpgSystems_id_fk` FOREIGN KEY (`systemId`) REFERENCES `rpgSystems`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sourceDocuments` ADD CONSTRAINT `sourceDocuments_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `antagonists_system_idx` ON `antagonists` (`systemId`);--> statement-breakpoint
CREATE INDEX `antagonists_type_idx` ON `antagonists` (`creatureType`);--> statement-breakpoint
CREATE INDEX `antagonists_threat_idx` ON `antagonists` (`threatLevel`);--> statement-breakpoint
CREATE INDEX `source_documents_category_idx` ON `sourceDocuments` (`category`);