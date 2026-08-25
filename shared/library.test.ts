import { describe, expect, it } from "vitest";
import { buildLibraryFilters } from "./library";

describe("filtros da Biblioteca de Antagonistas", () => {
  it("omite os valores sentinela para consultar o acervo inteiro", () => {
    expect(buildLibraryFilters({ systemId: "all", creatureType: "all", threatLevel: "all" })).toEqual({
      systemId: undefined,
      creatureType: undefined,
      threatLevel: undefined,
    });
  });

  it("preserva uma combinação específica de sistema, tipo e perigo", () => {
    expect(buildLibraryFilters({ systemId: "vampiro-v5", creatureType: "faction", threatLevel: "major" })).toEqual({
      systemId: "vampiro-v5",
      creatureType: "faction",
      threatLevel: "major",
    });
  });
});
