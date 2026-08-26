import { getRpgSystem } from "./rpg-systems";

export const HUNTER_SYSTEM_ID = "cacador-a-vinganca" as const;
export const HUNTER_IMPORT_FORMAT = "rpg-atlas-hunter-character-v1";
const HUNTER = getRpgSystem(HUNTER_SYSTEM_ID)!;

export type HunterSheetData = {
  creed: string;
  drive: string;
  cell: string;
  ambition: string;
  attributes: Record<string, number>;
  skills: Record<string, number>;
  health: number;
  willpower: number;
  desperation: number;
  edges: string;
  notes: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const bounded = (value: unknown, min: number, max: number, fallback: number) => typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
const hydrateTraits = (raw: unknown, definitions: readonly { id: string; min: number; max: number }[], fallback: number) => Object.fromEntries(definitions.map((trait) => [trait.id, bounded(isRecord(raw) ? raw[trait.id] : undefined, trait.min, trait.max, fallback)]));

export function createHunterSheetData(): HunterSheetData {
  return {
    creed: "", drive: "", cell: "", ambition: "",
    attributes: Object.fromEntries(HUNTER.attributes.map((attribute) => [attribute.id, 1])),
    skills: Object.fromEntries(HUNTER.skills.map((skill) => [skill.id, 0])),
    health: 7, willpower: 5, desperation: 0, edges: "", notes: "",
  };
}

export function hydrateHunterSheet(value: unknown): HunterSheetData {
  const base = createHunterSheetData();
  const raw = isRecord(value) ? value : {};
  return {
    creed: typeof raw.creed === "string" ? raw.creed : base.creed,
    drive: typeof raw.drive === "string" ? raw.drive : base.drive,
    cell: typeof raw.cell === "string" ? raw.cell : base.cell,
    ambition: typeof raw.ambition === "string" ? raw.ambition : base.ambition,
    attributes: hydrateTraits(raw.attributes, HUNTER.attributes, 1),
    skills: hydrateTraits(raw.skills, HUNTER.skills, 0),
    health: bounded(raw.health, 0, 10, base.health),
    willpower: bounded(raw.willpower, 0, 10, base.willpower),
    desperation: bounded(raw.desperation, 0, 5, base.desperation),
    edges: typeof raw.edges === "string" ? raw.edges : base.edges,
    notes: typeof raw.notes === "string" ? raw.notes : base.notes,
  };
}

export type ImportedHunterCharacter = { name: string; concept: string; sheetData: HunterSheetData };

export function parseHunterCharacterImport(value: unknown): ImportedHunterCharacter | null {
  if (!isRecord(value)) return null;
  const candidate = isRecord(value.character) ? value.character : value;
  const declaredSystem = isRecord(value.character) ? value.systemId ?? value.format : value.systemId ?? value.format;
  if (declaredSystem && declaredSystem !== HUNTER_SYSTEM_ID && declaredSystem !== HUNTER_IMPORT_FORMAT) return null;
  const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
  const sheetSource = isRecord(candidate.sheetData) ? candidate.sheetData : candidate;
  if (name.length < 2 || !isRecord(sheetSource) || (!isRecord(sheetSource.attributes) && !isRecord(sheetSource.skills))) return null;
  return { name, concept: typeof candidate.concept === "string" ? candidate.concept : "", sheetData: hydrateHunterSheet(sheetSource) };
}
