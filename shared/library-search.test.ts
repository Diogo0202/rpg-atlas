import { describe, expect, it } from "vitest";
import { expandLibraryQuery, rankLibraryEntries } from "./library-search";

describe("busca contextual da biblioteca", () => {
  it("normaliza acentos e expande termos narrativos recorrentes", () => {
    expect(expandLibraryQuery("Sangue")).toEqual(expect.arrayContaining(["sangue", "fome", "vampiro"]));
  });

  it("prioriza títulos e encontra contexto associado ao termo", () => {
    const results = rankLibraryEntries([
      { id: 1, kind: "dossier", title: "O Ancião Tzimisce", body: "Mestre da carne e da forma.", metadata: "Vampiro" },
      { id: 2, kind: "material", title: "Porto de Sangue", body: "Docas e contrabando.", metadata: "Cenário" },
    ], "carne");
    expect(results[0]?.id).toBe(1);
  });
});
