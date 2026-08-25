CREATE TABLE `campaignMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('narrator','player','observer') NOT NULL DEFAULT 'player',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaignMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaign_members_unique` UNIQUE(`campaignId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`systemId` varchar(64) NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text,
	`coverUrl` text,
	`visibility` enum('private','campaign','public') NOT NULL DEFAULT 'private',
	`status` enum('active','paused','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`campaignId` int,
	`systemId` varchar(64) NOT NULL,
	`name` varchar(160) NOT NULL,
	`concept` varchar(255),
	`portraitUrl` text,
	`visibility` enum('private','campaign','public') NOT NULL DEFAULT 'private',
	`sheetData` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `characters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diceRolls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rollerId` int NOT NULL,
	`characterId` int,
	`campaignId` int,
	`systemId` varchar(64) NOT NULL,
	`context` varchar(255),
	`resultData` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diceRolls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rpgSystems` (
	`id` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`edition` varchar(64) NOT NULL,
	`status` enum('active','planned','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rpgSystems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `campaignMembers` ADD CONSTRAINT `campaignMembers_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignMembers` ADD CONSTRAINT `campaignMembers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_systemId_rpgSystems_id_fk` FOREIGN KEY (`systemId`) REFERENCES `rpgSystems`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `characters` ADD CONSTRAINT `characters_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `characters` ADD CONSTRAINT `characters_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `characters` ADD CONSTRAINT `characters_systemId_rpgSystems_id_fk` FOREIGN KEY (`systemId`) REFERENCES `rpgSystems`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `diceRolls` ADD CONSTRAINT `diceRolls_rollerId_users_id_fk` FOREIGN KEY (`rollerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `diceRolls` ADD CONSTRAINT `diceRolls_characterId_characters_id_fk` FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `diceRolls` ADD CONSTRAINT `diceRolls_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `diceRolls` ADD CONSTRAINT `diceRolls_systemId_rpgSystems_id_fk` FOREIGN KEY (`systemId`) REFERENCES `rpgSystems`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `campaign_members_user_idx` ON `campaignMembers` (`userId`);--> statement-breakpoint
CREATE INDEX `campaigns_owner_idx` ON `campaigns` (`ownerId`);--> statement-breakpoint
CREATE INDEX `campaigns_system_idx` ON `campaigns` (`systemId`);--> statement-breakpoint
CREATE INDEX `characters_owner_idx` ON `characters` (`ownerId`);--> statement-breakpoint
CREATE INDEX `characters_campaign_idx` ON `characters` (`campaignId`);--> statement-breakpoint
CREATE INDEX `characters_system_idx` ON `characters` (`systemId`);--> statement-breakpoint
CREATE INDEX `dice_rolls_character_idx` ON `diceRolls` (`characterId`);--> statement-breakpoint
CREATE INDEX `dice_rolls_campaign_idx` ON `diceRolls` (`campaignId`);--> statement-breakpoint
CREATE INDEX `dice_rolls_roller_idx` ON `diceRolls` (`rollerId`);