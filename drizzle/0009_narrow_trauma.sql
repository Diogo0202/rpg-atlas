CREATE TABLE `campaignMapMarkers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mapId` int NOT NULL,
	`createdBy` int NOT NULL,
	`label` varchar(120) NOT NULL,
	`description` text,
	`markerType` enum('location','character','threat','objective','secret') NOT NULL DEFAULT 'location',
	`color` varchar(16) NOT NULL DEFAULT '#b55b32',
	`positionX` int NOT NULL,
	`positionY` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaignMapMarkers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaignMaps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`createdBy` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`imageKey` varchar(512),
	`imageUrl` text,
	`gridEnabled` int NOT NULL DEFAULT 1,
	`gridSize` int NOT NULL DEFAULT 50,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaignMaps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `campaignMapMarkers` ADD CONSTRAINT `campaignMapMarkers_mapId_campaignMaps_id_fk` FOREIGN KEY (`mapId`) REFERENCES `campaignMaps`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignMapMarkers` ADD CONSTRAINT `campaignMapMarkers_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignMaps` ADD CONSTRAINT `campaignMaps_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignMaps` ADD CONSTRAINT `campaignMaps_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `campaign_map_markers_map_idx` ON `campaignMapMarkers` (`mapId`);--> statement-breakpoint
CREATE INDEX `campaign_maps_campaign_idx` ON `campaignMaps` (`campaignId`);--> statement-breakpoint
CREATE INDEX `campaign_maps_creator_idx` ON `campaignMaps` (`createdBy`);