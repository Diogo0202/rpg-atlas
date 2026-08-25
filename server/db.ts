import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { campaignMembers, campaigns, characters, diceRolls, InsertUser, rpgSystems, users } from "../drizzle/schema";
import { ENV } from './_core/env';

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
