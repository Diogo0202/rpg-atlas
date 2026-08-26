export type ArchetypeSystemId = "vampiro-v5" | "o-um-anel" | "cacador-a-vinganca";

type ImportedArchetype = { format?: unknown; systemId?: unknown; title?: unknown; summary?: unknown; payload?: unknown };
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);

export function parseArchetypeImport(value: unknown, systemId: ArchetypeSystemId): { title: string; summary?: string; payload: Record<string, unknown> } | null {
  if (!isRecord(value)) return null;
  const imported = value as ImportedArchetype;
  if (imported.format !== "rpg-atlas-archetype-v1" || imported.systemId !== systemId || typeof imported.title !== "string" || imported.title.trim().length < 2 || imported.title.length > 120 || (imported.summary !== undefined && typeof imported.summary !== "string") || !isRecord(imported.payload)) return null;
  return { title: imported.title.trim(), summary: imported.summary?.trim() || undefined, payload: imported.payload };
}
