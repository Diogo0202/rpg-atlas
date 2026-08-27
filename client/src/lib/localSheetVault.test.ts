import { beforeEach, describe, expect, it, vi } from "vitest";
import { createLocalSheetId, listLocalSheets, loadLocalSheet, removeLocalSheet, saveLocalSheet } from "./localSheetVault";

function createStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  };
}

describe("localSheetVault", () => {
  beforeEach(() => vi.stubGlobal("window", { localStorage: createStorage() }));

  it("salva, lista, carrega e remove fichas sem misturar registros", () => {
    const key = "test-vault";
    const first = { id: "one", name: "Lívia", updatedAt: "2026-08-27T10:00:00.000Z", sheet: { hunger: 2 } };
    const second = { id: "two", name: "Rafael", updatedAt: "2026-08-27T11:00:00.000Z", sheet: { hunger: 1 } };
    saveLocalSheet(key, first);
    saveLocalSheet(key, second);

    expect(listLocalSheets<typeof first.sheet>(key).map((entry) => entry.id)).toEqual(["two", "one"]);
    expect(loadLocalSheet<typeof first.sheet>(key, "one")?.sheet.hunger).toBe(2);
    removeLocalSheet(key, "one");
    expect(listLocalSheets(key).map((entry) => entry.id)).toEqual(["two"]);
  });

  it("gera identificadores locais com o prefixo do sistema", () => {
    expect(createLocalSheetId("vampiro")).toMatch(/^vampiro-/);
  });
});
