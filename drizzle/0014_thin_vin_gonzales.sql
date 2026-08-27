ALTER TABLE `campaignShoppingListItems` ADD `isAcquired` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaignShoppingListItems` ADD `acquiredAt` timestamp;--> statement-breakpoint
ALTER TABLE `campaignShoppingLists` ADD `shareToken` varchar(72);--> statement-breakpoint
ALTER TABLE `campaignShoppingLists` ADD CONSTRAINT `shopping_lists_share_token_unique` UNIQUE(`shareToken`);