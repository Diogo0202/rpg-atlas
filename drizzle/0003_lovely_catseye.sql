CREATE TABLE `characterShareLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`characterId` int NOT NULL,
	`ownerId` int NOT NULL,
	`token` varchar(96) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `characterShareLinks_id` PRIMARY KEY(`id`),
	CONSTRAINT `character_share_links_token_unique` UNIQUE(`token`),
	CONSTRAINT `character_share_links_character_unique` UNIQUE(`characterId`)
);
--> statement-breakpoint
ALTER TABLE `characterShareLinks` ADD CONSTRAINT `characterShareLinks_characterId_characters_id_fk` FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `characterShareLinks` ADD CONSTRAINT `characterShareLinks_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `character_share_links_owner_idx` ON `characterShareLinks` (`ownerId`);