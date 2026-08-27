CREATE TABLE `hunterCellAntagonists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cellId` int NOT NULL,
	`antagonistId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hunterCellAntagonists_id` PRIMARY KEY(`id`),
	CONSTRAINT `hunter_cell_antagonists_unique` UNIQUE(`cellId`,`antagonistId`)
);
--> statement-breakpoint
CREATE TABLE `hunterCellMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cellId` int NOT NULL,
	`characterId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hunterCellMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `hunter_cell_members_unique` UNIQUE(`cellId`,`characterId`)
);
--> statement-breakpoint
CREATE TABLE `hunterCells` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`campaignId` int,
	`name` varchar(120) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hunterCells_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `hunterCellAntagonists` ADD CONSTRAINT `hunterCellAntagonists_cellId_hunterCells_id_fk` FOREIGN KEY (`cellId`) REFERENCES `hunterCells`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hunterCellAntagonists` ADD CONSTRAINT `hunterCellAntagonists_antagonistId_antagonists_id_fk` FOREIGN KEY (`antagonistId`) REFERENCES `antagonists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hunterCellMembers` ADD CONSTRAINT `hunterCellMembers_cellId_hunterCells_id_fk` FOREIGN KEY (`cellId`) REFERENCES `hunterCells`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hunterCellMembers` ADD CONSTRAINT `hunterCellMembers_characterId_characters_id_fk` FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hunterCells` ADD CONSTRAINT `hunterCells_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hunterCells` ADD CONSTRAINT `hunterCells_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `hunter_cell_antagonists_antagonist_idx` ON `hunterCellAntagonists` (`antagonistId`);--> statement-breakpoint
CREATE INDEX `hunter_cell_members_character_idx` ON `hunterCellMembers` (`characterId`);--> statement-breakpoint
CREATE INDEX `hunter_cells_owner_idx` ON `hunterCells` (`ownerId`);--> statement-breakpoint
CREATE INDEX `hunter_cells_campaign_idx` ON `hunterCells` (`campaignId`);