export type LibrarySystemFilter = "all" | "vampiro-v5" | "o-um-anel" | "cacador-a-vinganca";
export type LibraryCreatureFilter = "all" | "vampire" | "werewolf" | "mage" | "mortal" | "faction" | "entity" | "other";
export type LibraryThreatFilter = "all" | "minor" | "moderate" | "major" | "critical" | "cataclysmic";

export type LibraryFilterState = {
  systemId: LibrarySystemFilter;
  creatureType: LibraryCreatureFilter;
  threatLevel: LibraryThreatFilter;
};

export const creatureTypeLabels: Record<Exclude<LibraryCreatureFilter, "all">, string> = {
  vampire: "Vampiro", werewolf: "Lobisomem", mage: "Mago", mortal: "Mortal", faction: "Facção", entity: "Entidade", other: "Outro",
};

export const threatLevelLabels: Record<Exclude<LibraryThreatFilter, "all">, string> = {
  minor: "Menor", moderate: "Moderada", major: "Maior", critical: "Crítica", cataclysmic: "Cataclísmica",
};

export const rpgSystemLabels: Record<Exclude<LibrarySystemFilter, "all">, string> = {
  "vampiro-v5": "Vampiro: A Máscara V5", "o-um-anel": "O Um Anel", "cacador-a-vinganca": "Caçador: A Revanche",
};

export function buildLibraryFilters(state: LibraryFilterState) {
  return {
    systemId: state.systemId === "all" ? undefined : state.systemId,
    creatureType: state.creatureType === "all" ? undefined : state.creatureType,
    threatLevel: state.threatLevel === "all" ? undefined : state.threatLevel,
  };
}
