import type { RpgSystemId } from "@shared/rpg-systems";

export const CHARACTER_JSON_FORMAT = "rpg-atlas-character-v1" as const;
export const VAULT_BACKUP_JSON_FORMAT = "rpg-atlas-vault-v1" as const;

export type CharacterJsonEnvelope = {
  format: typeof CHARACTER_JSON_FORMAT;
  version: 1;
  exportedAt: string;
  systemId: RpgSystemId;
  character: {
    name: string;
    concept: string;
    campaignId?: string;
    createdAt?: string;
    sheet: unknown;
  };
};

export type ParsedCharacterJson = {
  systemId: RpgSystemId;
  name: string;
  concept: string;
  campaignId?: string;
  createdAt?: string;
  sheet: unknown;
};

export type VaultBackupEnvelope = {
  format: typeof VAULT_BACKUP_JSON_FORMAT;
  version: 1;
  exportedAt: string;
  records: Array<ParsedCharacterJson & { updatedAt?: string }>;
};

const SYSTEM_IDS: readonly RpgSystemId[] = ["vampiro-v5", "cacador-a-vinganca", "o-um-anel"];
const LEGACY_HUNTER_FORMAT = "rpg-atlas-hunter-character-v1";

export function inferRpgSystemId(storageKey: string): RpgSystemId {
  if (storageKey.includes("hunter")) return "cacador-a-vinganca";
  if (storageKey.includes("anel")) return "o-um-anel";
  return "vampiro-v5";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asSystemId(value: unknown, format?: unknown): RpgSystemId | null {
  if (typeof value === "string" && SYSTEM_IDS.includes(value as RpgSystemId)) return value as RpgSystemId;
  if (format === LEGACY_HUNTER_FORMAT) return "cacador-a-vinganca";
  return null;
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function createCharacterJsonEnvelope(input: {
  systemId: RpgSystemId;
  name: string;
  concept?: string;
  campaignId?: string | null;
  createdAt?: string;
  sheet: unknown;
}): CharacterJsonEnvelope {
  return {
    format: CHARACTER_JSON_FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    systemId: input.systemId,
    character: {
      name: input.name.trim(),
      concept: input.concept?.trim() || "",
      ...(input.campaignId ? { campaignId: input.campaignId } : {}),
      ...(input.createdAt ? { createdAt: input.createdAt } : {}),
      sheet: input.sheet,
    },
  };
}

export function parseCharacterJson(value: unknown): ParsedCharacterJson | null {
  if (!isRecord(value)) return null;
  const systemId = asSystemId(value.systemId, value.format);
  if (!systemId) return null;
  const candidate = isRecord(value.character) ? value.character : value;
  const name = normalizeText(candidate.name);
  const sheet = candidate.sheet ?? candidate.sheetData ?? candidate;
  if (name.length < 2 || !isRecord(sheet)) return null;
  const campaignId = candidate.campaignId == null ? undefined : String(candidate.campaignId);
  const createdAt = typeof candidate.createdAt === "string" ? candidate.createdAt : undefined;
  return {
    systemId,
    name,
    concept: normalizeText(candidate.concept),
    ...(campaignId ? { campaignId } : {}),
    ...(createdAt ? { createdAt } : {}),
    sheet,
  };
}

export function createVaultBackup(records: Array<ParsedCharacterJson & { updatedAt?: string }>): VaultBackupEnvelope {
  return {
    format: VAULT_BACKUP_JSON_FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    records,
  };
}

export function parseVaultBackup(value: unknown): Array<ParsedCharacterJson & { updatedAt?: string }> | null {
  if (isRecord(value) && value.format === VAULT_BACKUP_JSON_FORMAT && value.version === 1 && Array.isArray(value.records)) {
    const parsed = value.records.flatMap((record) => {
      const candidate = parseCharacterJson(record);
      if (!candidate) return [];
      const updatedAt = isRecord(record) && typeof record.updatedAt === "string" ? record.updatedAt : undefined;
      return [{ ...candidate, ...(updatedAt ? { updatedAt } : {}) }];
    });
    return parsed.length === value.records.length ? parsed : null;
  }
  const single = parseCharacterJson(value);
  return single ? [single] : null;
}

export function downloadJsonFile(payload: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function slugifyFilename(value: string, fallback = "ficha") {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || fallback;
}
