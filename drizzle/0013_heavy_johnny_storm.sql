CREATE TABLE `campaignShoppingListItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listId` int NOT NULL,
	`itemId` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaignShoppingListItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `shopping_list_items_unique` UNIQUE(`listId`,`itemId`)
);
--> statement-breakpoint
CREATE TABLE `campaignShoppingLists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`campaignId` int NOT NULL,
	`title` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaignShoppingLists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `campaignShoppingListItems` ADD CONSTRAINT `campaignShoppingListItems_listId_campaignShoppingLists_id_fk` FOREIGN KEY (`listId`) REFERENCES `campaignShoppingLists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignShoppingLists` ADD CONSTRAINT `campaignShoppingLists_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignShoppingLists` ADD CONSTRAINT `campaignShoppingLists_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `shopping_list_items_list_idx` ON `campaignShoppingListItems` (`listId`);--> statement-breakpoint
CREATE INDEX `shopping_lists_owner_idx` ON `campaignShoppingLists` (`ownerId`);--> statement-breakpoint
CREATE INDEX `shopping_lists_campaign_idx` ON `campaignShoppingLists` (`campaignId`);