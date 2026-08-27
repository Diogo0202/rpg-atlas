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

/** Link exclusivo de leitura para compartilhar uma ficha sem expor a conta do proprietário. */
export const characterShareLinks = mysqlTable("characterShareLinks", {
  id: int("id").autoincrement().primaryKey(),
  characterId: int("characterId").notNull().references(() => characters.id, { onDelete: "cascade" }),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 96 }).notNull(),
  expiresAt: timestamp("expiresAt"),
  label: varchar("label", { length: 120 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("character_share_links_token_unique").on(table.token),
  uniqueIndex("character_share_links_character_unique").on(table.characterId),
  index("character_share_links_owner_idx").on(table.ownerId),
]);

/** Arquétipos pessoais, isolados por usuário e sistema de regras. */
export const characterArchetypes = mysqlTable("characterArchetypes", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  systemId: varchar("systemId", { length: 64 }).notNull().references(() => rpgSystems.id),
  title: varchar("title", { length: 120 }).notNull(),
  summary: text("summary"),
  payload: json("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("character_archetypes_owner_system_idx").on(table.ownerId, table.systemId),
]);

/** Itens do catálogo V5 marcados por uma pessoa para aquisição futura. */
export const storeFavorites = mysqlTable("storeFavorites", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemId: varchar("itemId", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("store_favorites_owner_item_unique").on(table.ownerId, table.itemId),
  index("store_favorites_owner_idx").on(table.ownerId),
]);

/** Listas de compras privadas de um participante, organizadas por campanha. */
export const campaignShoppingLists = mysqlTable("campaignShoppingLists", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  campaignId: int("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 120 }).notNull(),
  shareToken: varchar("shareToken", { length: 72 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("shopping_lists_share_token_unique").on(table.shareToken),
  index("shopping_lists_owner_idx").on(table.ownerId),
  index("shopping_lists_campaign_idx").on(table.campaignId),
]);

/** Itens do catálogo reservados em uma lista de compras específica. */
export const campaignShoppingListItems = mysqlTable("campaignShoppingListItems", {
  id: int("id").autoincrement().primaryKey(),
  listId: int("listId").notNull().references(() => campaignShoppingLists.id, { onDelete: "cascade" }),
  itemId: varchar("itemId", { length: 120 }).notNull(),
  isAcquired: int("isAcquired").default(0).notNull(),
  acquiredAt: timestamp("acquiredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("shopping_list_items_unique").on(table.listId, table.itemId),
  index("shopping_list_items_list_idx").on(table.listId),
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

/** Sessões ordenadas de uma campanha, usadas para conectar eventos e dossiês. */
export const campaignSessions = mysqlTable("campaignSessions", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  sequence: int("sequence").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  summary: text("summary"),
  status: mysqlEnum("status", ["planned", "played", "archived"]).default("planned").notNull(),
  playedAt: timestamp("playedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("campaign_sessions_sequence_unique").on(table.campaignId, table.sequence),
  index("campaign_sessions_campaign_idx").on(table.campaignId),
]);

/** Facções vinculadas à campanha, com relógio de tensão e consequência de ruptura. */
export const campaignFactions = mysqlTable("campaignFactions", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  createdBy: int("createdBy").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  objective: varchar("objective", { length: 255 }),
  tension: int("tension").default(0).notNull(),
  maxTension: int("maxTension").default(6).notNull(),
  ruptureConsequence: text("ruptureConsequence"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("campaign_factions_campaign_idx").on(table.campaignId),
  index("campaign_factions_creator_idx").on(table.createdBy),
]);

/** Eventos da campanha para a linha do tempo, ligados opcionalmente a uma sessão. */
export const campaignEvents = mysqlTable("campaignEvents", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  sessionId: int("sessionId").references(() => campaignSessions.id, { onDelete: "set null" }),
  createdBy: int("createdBy").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["planned", "active", "resolved", "failed", "consequence"]).default("active").notNull(),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("campaign_events_campaign_idx").on(table.campaignId),
  index("campaign_events_session_idx").on(table.sessionId),
  index("campaign_events_occurred_idx").on(table.occurredAt),
]);

/** Referências musicais e briefs de ambientação associados ao arquivo de uma campanha. */
export const campaignMusicCues = mysqlTable("campaignMusicCues", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  sessionId: int("sessionId").references(() => campaignSessions.id, { onDelete: "set null" }),
  createdBy: int("createdBy").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  sceneType: mysqlEnum("sceneType", ["arrival", "exploration", "intrigue", "tension", "combat", "aftermath", "rest"]).default("exploration").notNull(),
  durationSeconds: int("durationSeconds").default(120).notNull(),
  musicPrompt: text("musicPrompt").notNull(),
  notes: text("notes"),
  audioUrl: text("audioUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("campaign_music_cues_campaign_idx").on(table.campaignId),
  index("campaign_music_cues_session_idx").on(table.sessionId),
]);

/** Mapas táticos de uma campanha; o binário da imagem permanece no armazenamento de arquivos. */
export const campaignMaps = mysqlTable("campaignMaps", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  createdBy: int("createdBy").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  imageKey: varchar("imageKey", { length: 512 }),
  imageUrl: text("imageUrl"),
  gridEnabled: int("gridEnabled").default(1).notNull(),
  gridSize: int("gridSize").default(50).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("campaign_maps_campaign_idx").on(table.campaignId),
  index("campaign_maps_creator_idx").on(table.createdBy),
]);

/** Marcadores em coordenadas normalizadas (0–10.000), estáveis independentemente do zoom da mesa. */
export const campaignMapMarkers = mysqlTable("campaignMapMarkers", {
  id: int("id").autoincrement().primaryKey(),
  mapId: int("mapId").notNull().references(() => campaignMaps.id, { onDelete: "cascade" }),
  createdBy: int("createdBy").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 120 }).notNull(),
  description: text("description"),
  markerType: mysqlEnum("markerType", ["location", "character", "threat", "objective", "secret"]).default("location").notNull(),
  color: varchar("color", { length: 16 }).default("#b55b32").notNull(),
  positionX: int("positionX").notNull(),
  positionY: int("positionY").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("campaign_map_markers_map_idx").on(table.mapId),
]);

/** Facções diretamente implicadas em um evento da linha do tempo da campanha. */
export const campaignEventFactions = mysqlTable("campaignEventFactions", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull().references(() => campaignEvents.id, { onDelete: "cascade" }),
  factionId: int("factionId").notNull().references(() => campaignFactions.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("campaign_event_factions_unique").on(table.eventId, table.factionId),
  index("campaign_event_factions_faction_idx").on(table.factionId),
]);

/** Dossiê de antagonista público ou pertencente ao arquivo particular de um cronista. */
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
  visibility: mysqlEnum("visibility", ["private", "campaign", "public"]).default("private").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("antagonists_owner_idx").on(table.ownerId),
  index("antagonists_campaign_idx").on(table.campaignId),
  index("antagonists_system_idx").on(table.systemId),
  index("antagonists_visibility_idx").on(table.visibility),
]);

/** Material de referência indexado no acervo contextual. */
export const sourceDocuments = mysqlTable("sourceDocuments", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["guide", "setting", "antagonist", "rules", "supplement", "folder", "asset"]).notNull(),
  driveFileId: varchar("driveFileId", { length: 128 }),
  sourceUrl: text("sourceUrl"),
  mimeType: varchar("mimeType", { length: 128 }),
  notes: text("notes"),
  integrationStatus: mysqlEnum("integrationStatus", ["referenced", "cataloged", "integrated"]).default("referenced").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("source_documents_owner_idx").on(table.ownerId),
  index("source_documents_category_idx").on(table.category),
]);

/** Participação de um antagonista em uma sessão específica. */
export const antagonistSessions = mysqlTable("antagonistSessions", {
  id: int("id").autoincrement().primaryKey(),
  antagonistId: int("antagonistId").notNull().references(() => antagonists.id, { onDelete: "cascade" }),
  sessionId: int("sessionId").notNull().references(() => campaignSessions.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["rumor", "presence", "confrontation", "aftermath"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("antagonist_sessions_unique").on(table.antagonistId, table.sessionId),
  index("antagonist_sessions_session_idx").on(table.sessionId),
]);

/** Relação registrada entre um antagonista e uma ficha de personagem. */
export const antagonistCharacters = mysqlTable("antagonistCharacters", {
  id: int("id").autoincrement().primaryKey(),
  antagonistId: int("antagonistId").notNull().references(() => antagonists.id, { onDelete: "cascade" }),
  characterId: int("characterId").notNull().references(() => characters.id, { onDelete: "cascade" }),
  relation: mysqlEnum("relation", ["enemy", "rival", "target", "ally", "patron", "debt"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("antagonist_characters_unique").on(table.antagonistId, table.characterId),
  index("antagonist_characters_character_idx").on(table.characterId),
]);

/** Célula de Caçador pertencente ao narrador, com uma crônica opcional como eixo operacional. */
export const hunterCells = mysqlTable("hunterCells", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  campaignId: int("campaignId").references(() => campaigns.id, { onDelete: "set null" }),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("hunter_cells_owner_idx").on(table.ownerId),
  index("hunter_cells_campaign_idx").on(table.campaignId),
]);

/** Fichas de Caçador que atuam como integrantes de uma célula. */
export const hunterCellMembers = mysqlTable("hunterCellMembers", {
  id: int("id").autoincrement().primaryKey(),
  cellId: int("cellId").notNull().references(() => hunterCells.id, { onDelete: "cascade" }),
  characterId: int("characterId").notNull().references(() => characters.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("hunter_cell_members_unique").on(table.cellId, table.characterId),
  index("hunter_cell_members_character_idx").on(table.characterId),
]);

/** Antagonistas investigados, caçados ou protegidos por uma célula. */
export const hunterCellAntagonists = mysqlTable("hunterCellAntagonists", {
  id: int("id").autoincrement().primaryKey(),
  cellId: int("cellId").notNull().references(() => hunterCells.id, { onDelete: "cascade" }),
  antagonistId: int("antagonistId").notNull().references(() => antagonists.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("hunter_cell_antagonists_unique").on(table.cellId, table.antagonistId),
  index("hunter_cell_antagonists_antagonist_idx").on(table.antagonistId),
]);

export type RpgSystem = typeof rpgSystems.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type CampaignMember = typeof campaignMembers.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type InsertCharacter = typeof characters.$inferInsert;
export type DiceRoll = typeof diceRolls.$inferSelect;
export type HunterCell = typeof hunterCells.$inferSelect;
