import { index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Catálogo de sistemas de RPG. A definição detalhada de regras vive no código compartilhado. */
export const rpgSystems = mysqlTable("rpgSystems", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  edition: varchar("edition", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["active", "planned", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Campanhas pertencem a uma pessoa e mantêm um sistema de regras único por registro. */
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  systemId: varchar("systemId", { length: 64 }).notNull().references(() => rpgSystems.id),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  coverUrl: text("coverUrl"),
  visibility: mysqlEnum("visibility", ["private", "campaign", "public"]).default("private").notNull(),
  status: mysqlEnum("status", ["active", "paused", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("campaigns_owner_idx").on(table.ownerId),
  index("campaigns_system_idx").on(table.systemId),
]);

/** Papel contextual de uma pessoa dentro de uma campanha. */
export const campaignMembers = mysqlTable("campaignMembers", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["narrator", "player", "observer"]).default("player").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("campaign_members_unique").on(table.campaignId, table.userId),
  index("campaign_members_user_idx").on(table.userId),
]);

/** Ficha de personagem independente, com vínculo opcional à campanha e dados específicos em JSON. */
export const characters = mysqlTable("characters", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  campaignId: int("campaignId").references(() => campaigns.id, { onDelete: "set null" }),
  systemId: varchar("systemId", { length: 64 }).notNull().references(() => rpgSystems.id),
  name: varchar("name", { length: 160 }).notNull(),
  concept: varchar("concept", { length: 255 }),
  portraitUrl: text("portraitUrl"),
  visibility: mysqlEnum("visibility", ["private", "campaign", "public"]).default("private").notNull(),
  sheetData: json("sheetData").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("characters_owner_idx").on(table.ownerId),
  index("characters_campaign_idx").on(table.campaignId),
  index("characters_system_idx").on(table.systemId),
]);

/** Registro auditável de rolagens para personagens e sessões futuras. */
export const diceRolls = mysqlTable("diceRolls", {
  id: int("id").autoincrement().primaryKey(),
  rollerId: int("rollerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  characterId: int("characterId").references(() => characters.id, { onDelete: "set null" }),
  campaignId: int("campaignId").references(() => campaigns.id, { onDelete: "set null" }),
  systemId: varchar("systemId", { length: 64 }).notNull().references(() => rpgSystems.id),
  context: varchar("context", { length: 255 }),
  resultData: json("resultData").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("dice_rolls_character_idx").on(table.characterId),
  index("dice_rolls_campaign_idx").on(table.campaignId),
  index("dice_rolls_roller_idx").on(table.rollerId),
]);

/** Biblioteca pesquisável de ameaças, NPCs, facções e entidades. */
export const antagonists = mysqlTable("antagonists", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").references(() => users.id, { onDelete: "set null" }),
  campaignId: int("campaignId").references(() => campaigns.id, { onDelete: "set null" }),
  systemId: varchar("systemId", { length: 64 }).notNull().references(() => rpgSystems.id),
  name: varchar("name", { length: 160 }).notNull(),
  creatureType: mysqlEnum("creatureType", ["vampire", "werewolf", "mage", "mortal", "faction", "entity", "other"]).notNull(),
  threatLevel: mysqlEnum("threatLevel", ["minor", "moderate", "major", "critical", "cataclysmic"]).notNull(),
  summary: text("summary").notNull(),
  hooks: json("hooks").$type<string[]>().notNull(),
  sourceTitle: varchar("sourceTitle", { length: 255 }),
  sourceUrl: text("sourceUrl"),
  visibility: mysqlEnum("visibility", ["private", "campaign", "public"]).default("public").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("antagonists_system_idx").on(table.systemId),
  index("antagonists_type_idx").on(table.creatureType),
  index("antagonists_threat_idx").on(table.threatLevel),
]);

/** Metadados dos materiais fornecidos pela pasta do Drive; os arquivos permanecem na origem. */
export const sourceDocuments = mysqlTable("sourceDocuments", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").references(() => users.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["guide", "setting", "antagonist", "rules", "supplement", "folder", "asset"]).notNull(),
  driveFileId: varchar("driveFileId", { length: 128 }).notNull().unique(),
  sourceUrl: text("sourceUrl").notNull(),
  mimeType: varchar("mimeType", { length: 128 }),
  integrationStatus: mysqlEnum("integrationStatus", ["referenced", "cataloged", "integrated"]).default("referenced").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("source_documents_category_idx").on(table.category),
]);

export type RpgSystem = typeof rpgSystems.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type CampaignMember = typeof campaignMembers.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type InsertCharacter = typeof characters.$inferInsert;
export type DiceRoll = typeof diceRolls.$inferSelect;
export type Antagonist = typeof antagonists.$inferSelect;
export type SourceDocument = typeof sourceDocuments.$inferSelect;
