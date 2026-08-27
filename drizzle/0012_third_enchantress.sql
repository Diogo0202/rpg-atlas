CREATE TABLE `storeFavorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`itemId` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `storeFavorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `store_favorites_owner_item_unique` UNIQUE(`ownerId`,`itemId`)
);
--> statement-breakpoint
ALTER TABLE `storeFavorites` ADD CONSTRAINT `storeFavorites_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `store_favorites_owner_idx` ON `storeFavorites` (`ownerId`);