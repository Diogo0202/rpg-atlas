CREATE TABLE `characterArchetypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`systemId` varchar(64) NOT NULL,
	`title` varchar(120) NOT NULL,
	`summary` text,
	`payload` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `characterArchetypes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `characterArchetypes` ADD CONSTRAINT `characterArchetypes_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `characterArchetypes` ADD CONSTRAINT `characterArchetypes_systemId_rpgSystems_id_fk` FOREIGN KEY (`systemId`) REFERENCES `rpgSystems`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX `character_archetypes_owner_idx` ON `characterArchetypes` (`ownerId`);
--> statement-breakpoint
CREATE INDEX `character_archetypes_system_idx` ON `characterArchetypes` (`systemId`);
