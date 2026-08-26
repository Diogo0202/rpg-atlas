import { describe, expect, it } from "vitest";
import { parseArchetypeImport } from "./archetype-import";

describe("importação de arquétipos", () => {
  it("aceita um retrato JSON do sistema correto", () => {
    expect(parseArchetypeImport({ format: "rpg-atlas-archetype-v1", systemId: "vampiro-v5", title: "  Vigia da noite ", summary: "  Caçada urbana ", payload: { attributes: { forca: 3 } } }, "vampiro-v5")).toEqual({ title: "Vigia da noite", summary: "Caçada urbana", payload: { attributes: { forca: 3 } } });
  });

  it("rejeita o arquivo de outro sistema ou uma carga sem retrato", () => {
    expect(parseArchetypeImport({ format: "rpg-atlas-archetype-v1", systemId: "o-um-anel", title: "Vigia", payload: {} }, "vampiro-v5")).toBeNull();
    expect(parseArchetypeImport({ format: "rpg-atlas-archetype-v1", systemId: "vampiro-v5", title: "Vigia" }, "vampiro-v5")).toBeNull();
  });
});
