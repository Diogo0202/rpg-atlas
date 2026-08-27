ALTER TABLE `campaignMaps` ADD `imageProvider` enum('openai','gemini');--> statement-breakpoint
ALTER TABLE `campaignMaps` ADD `imageGenerationPrompt` text;