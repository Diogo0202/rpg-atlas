import { and, asc, desc, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { randomBytes } from "node:crypto";
import { antagonistCharacters, antagonists, antagonistSessions, campaignMembers, campaignSessions, campaigns, characterArchetypes, characterShareLinks, characters, diceRolls, InsertUser, rpgSystems, sourceDocuments, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { rankLibraryEntries } from "../shared/library-search";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listRpgSystems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rpgSystems).orderBy(rpgSystems.name);
}

export async function listCampaignsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).where(eq(campaigns.ownerId, userId)).orderBy(desc(campaigns.updatedAt));
}

export async function createCampaignForUser(input: {
  ownerId: number;
  systemId: string;
  title: string;
  description?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const inserted = await db.insert(campaigns).values({
    ownerId: input.ownerId,
    systemId: input.systemId,
    title: input.title,
    description: input.description ?? null,
  }).$returningId();
  const campaignId = inserted[0]?.id;
  if (!campaignId) throw new Error("Não foi possível criar a campanha.");

  await db.insert(campaignMembers).values({ campaignId, userId: input.ownerId, role: "narrator" });
  const created = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
  return created[0];
}

export async function listCharactersForUser(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(characters).where(eq(characters.ownerId, ownerId)).orderBy(desc(characters.updatedAt));
}

export async function createCharacterForUser(input: {
  ownerId: number;
  systemId: string;
  name: string;
  concept?: string;
  campaignId?: number | null;
  sheetData: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const inserted = await db.insert(characters).values({
    ownerId: input.ownerId,
    systemId: input.systemId,
    name: input.name,
    concept: input.concept ?? null,
    campaignId: input.campaignId ?? null,
    sheetData: input.sheetData,
  }).$returningId();
  const characterId = inserted[0]?.id;
  if (!characterId) throw new Error("Não foi possível registrar a ficha.");
  const created = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1);
  return created[0];
}

export async function updateCharacterForUser(input: {
  ownerId: number;
  characterId: number;
  name: string;
  concept?: string;
  campaignId?: number | null;
  sheetData: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const owned = await db.select({ id: characters.id }).from(characters).where(and(eq(characters.id, input.characterId), eq(characters.ownerId, input.ownerId))).limit(1);
  if (!owned[0]) throw new Error("Ficha não encontrada ou sem permissão.");
  if (input.campaignId && !await campaignBelongsToUser(input.campaignId, input.ownerId)) throw new Error("Campanha não encontrada ou sem permissão.");
  await db.update(characters).set({ name: input.name, concept: input.concept ?? null, campaignId: input.campaignId ?? null, sheetData: input.sheetData }).where(eq(characters.id, input.characterId));
  return (await db.select().from(characters).where(eq(characters.id, input.characterId)).limit(1))[0];
}

export async function createCharacterShareLinkForUser(input: { ownerId: number; characterId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const owned = await db.select({ id: characters.id }).from(characters).where(and(eq(characters.id, input.characterId), eq(characters.ownerId, input.ownerId))).limit(1);
  if (!owned[0]) throw new Error("Ficha não encontrada ou sem permissão.");
  const token = randomBytes(24).toString("base64url");
  const existing = await db.select({ id: characterShareLinks.id }).from(characterShareLinks).where(eq(characterShareLinks.characterId, input.characterId)).limit(1);
  if (existing[0]) await db.update(characterShareLinks).set({ token, ownerId: input.ownerId }).where(eq(characterShareLinks.id, existing[0].id));
  else await db.insert(characterShareLinks).values({ characterId: input.characterId, ownerId: input.ownerId, token });
  return { token };
}

export async function getSharedCharacterByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({ id: characters.id, systemId: characters.systemId, name: characters.name, concept: characters.concept, sheetData: characters.sheetData, updatedAt: characters.updatedAt }).from(characterShareLinks).innerJoin(characters, eq(characterShareLinks.characterId, characters.id)).where(eq(characterShareLinks.token, token)).limit(1);
  return rows[0] || null;
}

export async function revokeCharacterShareLinkForUser(input: { ownerId: number; characterId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const owned = await db.select({ id: characters.id }).from(characters).where(and(eq(characters.id, input.characterId), eq(characters.ownerId, input.ownerId))).limit(1);
  if (!owned[0]) throw new Error("Ficha não encontrada ou sem permissão.");
  await db.delete(characterShareLinks).where(and(eq(characterShareLinks.characterId, input.characterId), eq(characterShareLinks.ownerId, input.ownerId)));
}

export async function recordDiceRollForUser(input: {
  rollerId: number;
  systemId: string;
  characterId?: number | null;
  campaignId?: number | null;
  context?: string;
  resultData: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.insert(diceRolls).values(input);
}

export async function listDiceRollsForCharacterUser(input: { rollerId: number; characterId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const owned = await db.select({ id: characters.id }).from(characters).where(and(eq(characters.id, input.characterId), eq(characters.ownerId, input.rollerId))).limit(1);
  if (!owned[0]) throw new Error("Ficha não encontrada ou sem permissão.");
  return db.select().from(diceRolls).where(and(eq(diceRolls.characterId, input.characterId), eq(diceRolls.rollerId, input.rollerId))).orderBy(desc(diceRolls.createdAt));
}

export async function listCharacterArchetypesForUser(ownerId: number, systemId?: string) {
  const db = await getDb();
  if (!db) return [];
  const clauses = [eq(characterArchetypes.ownerId, ownerId)];
  if (systemId) clauses.push(eq(characterArchetypes.systemId, systemId));
  return db.select().from(characterArchetypes).where(and(...clauses)).orderBy(desc(characterArchetypes.updatedAt));
}

export async function createCharacterArchetypeForUser(input: { ownerId: number; systemId: string; title: string; summary?: string; payload: Record<string, unknown> }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const inserted = await db.insert(characterArchetypes).values({ ...input, summary: input.summary ?? null }).$returningId();
  const archetypeId = inserted[0]?.id;
  if (!archetypeId) throw new Error("Não foi possível salvar o arquétipo.");
  return (await db.select().from(characterArchetypes).where(eq(characterArchetypes.id, archetypeId)).limit(1))[0];
}

export async function deleteCharacterArchetypeForUser(input: { ownerId: number; archetypeId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const owned = await db.select({ id: characterArchetypes.id }).from(characterArchetypes).where(and(eq(characterArchetypes.id, input.archetypeId), eq(characterArchetypes.ownerId, input.ownerId))).limit(1);
  if (!owned[0]) throw new Error("Arquétipo não encontrado ou sem permissão.");
  await db.delete(characterArchetypes).where(eq(characterArchetypes.id, input.archetypeId));
}

export async function listAntagonists(filters?: {
  systemId?: string;
  creatureType?: "vampire" | "werewolf" | "mage" | "mortal" | "faction" | "entity" | "other";
  threatLevel?: "minor" | "moderate" | "major" | "critical" | "cataclysmic";
}) {
  const db = await getDb();
  if (!db) return [];
  const clauses = [eq(antagonists.visibility, "public")];
  if (filters?.systemId) clauses.push(eq(antagonists.systemId, filters.systemId));
  if (filters?.creatureType) clauses.push(eq(antagonists.creatureType, filters.creatureType));
  if (filters?.threatLevel) clauses.push(eq(antagonists.threatLevel, filters.threatLevel));
  return db.select().from(antagonists).where(and(...clauses)).orderBy(asc(antagonists.threatLevel), asc(antagonists.name));
}

export async function listSourceDocuments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sourceDocuments).orderBy(asc(sourceDocuments.category), asc(sourceDocuments.title));
}

async function campaignBelongsToUser(campaignId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select({ id: campaigns.id }).from(campaigns).where(and(eq(campaigns.id, campaignId), eq(campaigns.ownerId, userId))).limit(1);
  return Boolean(result[0]);
}

export async function listCampaignSessionsForUser(campaignId: number, userId: number) {
  if (!await campaignBelongsToUser(campaignId, userId)) return [];
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaignSessions).where(eq(campaignSessions.campaignId, campaignId)).orderBy(asc(campaignSessions.sequence));
}

export async function createCampaignSessionForUser(input: { campaignId: number; userId: number; title: string; summary?: string }) {
  if (!await campaignBelongsToUser(input.campaignId, input.userId)) throw new Error("Campanha não encontrada ou sem permissão.");
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const existing = await db.select({ sequence: campaignSessions.sequence }).from(campaignSessions).where(eq(campaignSessions.campaignId, input.campaignId)).orderBy(desc(campaignSessions.sequence)).limit(1);
  const nextSequence = (existing[0]?.sequence ?? 0) + 1;
  const inserted = await db.insert(campaignSessions).values({ campaignId: input.campaignId, sequence: nextSequence, title: input.title, summary: input.summary ?? null }).$returningId();
  const sessionId = inserted[0]?.id;
  if (!sessionId) throw new Error("Não foi possível registrar a sessão.");
  return (await db.select().from(campaignSessions).where(eq(campaignSessions.id, sessionId)).limit(1))[0];
}

export async function listAntagonistsForUser(userId: number, filters?: { campaignId?: number; systemId?: string }) {
  const db = await getDb();
  if (!db) return [];
  const clauses = [or(eq(antagonists.visibility, "public"), eq(antagonists.ownerId, userId))];
  if (filters?.campaignId) clauses.push(eq(antagonists.campaignId, filters.campaignId));
  if (filters?.systemId) clauses.push(eq(antagonists.systemId, filters.systemId));
  return db.select().from(antagonists).where(and(...clauses)).orderBy(desc(antagonists.updatedAt));
}

export async function createAntagonistForUser(input: { ownerId: number; campaignId?: number | null; systemId: string; name: string; creatureType: "vampire" | "werewolf" | "mage" | "mortal" | "faction" | "entity" | "other"; threatLevel: "minor" | "moderate" | "major" | "critical" | "cataclysmic"; summary: string; hooks: string[]; }) {
  if (input.campaignId && !await campaignBelongsToUser(input.campaignId, input.ownerId)) throw new Error("Campanha não encontrada ou sem permissão.");
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const inserted = await db.insert(antagonists).values({ ...input, campaignId: input.campaignId ?? null, visibility: "private" }).$returningId();
  const antagonistId = inserted[0]?.id;
  if (!antagonistId) throw new Error("Não foi possível registrar o antagonista.");
  return (await db.select().from(antagonists).where(eq(antagonists.id, antagonistId)).limit(1))[0];
}

export async function updateAntagonistForUser(input: { ownerId: number; antagonistId: number; name: string; creatureType: "vampire" | "werewolf" | "mage" | "mortal" | "faction" | "entity" | "other"; threatLevel: "minor" | "moderate" | "major" | "critical" | "cataclysmic"; summary: string; hooks: string[]; campaignId?: number | null; }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  if (input.campaignId && !await campaignBelongsToUser(input.campaignId, input.ownerId)) throw new Error("Campanha não encontrada ou sem permissão.");
  const owned = await db.select({ id: antagonists.id }).from(antagonists).where(and(eq(antagonists.id, input.antagonistId), eq(antagonists.ownerId, input.ownerId))).limit(1);
  if (!owned[0]) throw new Error("Apenas dossiês próprios podem ser editados.");
  await db.update(antagonists).set({ name: input.name, creatureType: input.creatureType, threatLevel: input.threatLevel, summary: input.summary, hooks: input.hooks, campaignId: input.campaignId ?? null }).where(eq(antagonists.id, input.antagonistId));
  return (await db.select().from(antagonists).where(eq(antagonists.id, input.antagonistId)).limit(1))[0];
}

async function antagonistBelongsToUser(antagonistId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const found = await db.select({ id: antagonists.id }).from(antagonists).where(and(eq(antagonists.id, antagonistId), eq(antagonists.ownerId, userId))).limit(1);
  return Boolean(found[0]);
}

export async function linkAntagonistToSession(input: { ownerId: number; antagonistId: number; sessionId: number; role: "rumor" | "presence" | "confrontation" | "aftermath"; notes?: string }) {
  if (!await antagonistBelongsToUser(input.antagonistId, input.ownerId)) throw new Error("Apenas dossiês próprios podem receber vínculos.");
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const session = await db.select({ campaignId: campaignSessions.campaignId }).from(campaignSessions).where(eq(campaignSessions.id, input.sessionId)).limit(1);
  if (!session[0] || !await campaignBelongsToUser(session[0].campaignId, input.ownerId)) throw new Error("Sessão não encontrada ou sem permissão.");
  await db.insert(antagonistSessions).values({ antagonistId: input.antagonistId, sessionId: input.sessionId, role: input.role, notes: input.notes ?? null }).onDuplicateKeyUpdate({ set: { role: input.role, notes: input.notes ?? null } });
}

export async function linkAntagonistToCharacter(input: { ownerId: number; antagonistId: number; characterId: number; relation: "enemy" | "rival" | "target" | "ally" | "patron" | "debt"; notes?: string }) {
  if (!await antagonistBelongsToUser(input.antagonistId, input.ownerId)) throw new Error("Apenas dossiês próprios podem receber vínculos.");
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const character = await db.select({ ownerId: characters.ownerId }).from(characters).where(eq(characters.id, input.characterId)).limit(1);
  if (!character[0] || character[0].ownerId !== input.ownerId) throw new Error("Ficha não encontrada ou sem permissão.");
  await db.insert(antagonistCharacters).values({ antagonistId: input.antagonistId, characterId: input.characterId, relation: input.relation, notes: input.notes ?? null }).onDuplicateKeyUpdate({ set: { relation: input.relation, notes: input.notes ?? null } });
}

export async function searchLibraryContext(query: string) {
  const [dossiers, documents] = await Promise.all([listAntagonists(), listSourceDocuments()]);
  return rankLibraryEntries([
    ...dossiers.map((item) => ({ id: item.id, kind: "dossier" as const, title: item.name, body: `${item.summary} ${(item.hooks || []).join(" ")}`, metadata: `${item.creatureType} ${item.threatLevel} ${item.sourceTitle || ""}` })),
    ...documents.map((item) => ({ id: item.id, kind: "material" as const, title: item.title, body: item.notes || "", metadata: `${item.category} ${item.integrationStatus}` })),
  ], query);
}
