import { describe, expect, it } from "vitest";
import { HUNTER_IMPORT_FORMAT, parseHunterCharacterImport } from "./hunter";

describe("ficha de Caçador", () => {
  it("hidrata uma ficha importada e limita os valores aos limites da ficha", () => {
    const imported = parseHunterCharacterImport({ format: HUNTER_IMPORT_FORMAT, character: { name: "Mara Duarte", concept: "Paramédica", sheetData: { creed: "marcial", attributes: { forca: 99 }, skills: { investigacao: 2 }, desperation: 8 } } });
    expect(imported).toMatchObject({ name: "Mara Duarte", concept: "Paramédica", sheetData: { creed: "marcial", attributes: { forca: 5 }, skills: { investigacao: 2 }, desperation: 5 } });
  });

  it("rejeita formatos declarados para outros sistemas", () => {
    expect(parseHunterCharacterImport({ systemId: "vampiro-v5", name: "Mara", sheetData: { attributes: {}, skills: {} } })).toBeNull();
  });
});
