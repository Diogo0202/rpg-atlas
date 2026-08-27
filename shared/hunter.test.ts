import { describe, expect, it } from "vitest";
import { HUNTER_IMPORT_FORMAT, parseHunterCharacterImport, rollHunterV5 } from "./hunter";

describe("ficha de Caçador", () => {
  it("hidrata uma ficha importada e limita os valores aos limites da ficha", () => {
    const imported = parseHunterCharacterImport({ format: HUNTER_IMPORT_FORMAT, character: { name: "Mara Duarte", concept: "Paramédica", sheetData: { creed: "marcial", attributes: { forca: 99 }, skills: { investigacao: 2 }, desperation: 8 } } });
    expect(imported).toMatchObject({ name: "Mara Duarte", concept: "Paramédica", sheetData: { creed: "marcial", attributes: { forca: 5 }, skills: { investigacao: 2 }, desperation: 5 } });
  });

  it("rejeita formatos declarados para outros sistemas", () => {
    expect(parseHunterCharacterImport({ systemId: "vampiro-v5", name: "Mara", sheetData: { attributes: {}, skills: {} } })).toBeNull();
  });

  it("substitui dados pela tensão do Desespero e identifica seus desfechos especiais", () => {
    const criticalDice = [10, 10, 4];
    const critical = rollHunterV5(3, 1, () => criticalDice.shift()!);
    expect(critical).toMatchObject({ successes: 4, desperationDice: 1, desperateCritical: true, desperateFailure: false, verdict: "Crítico desesperado" });
    const failureDice = [1, 4];
    const failure = rollHunterV5(2, 1, () => failureDice.shift()!);
    expect(failure).toMatchObject({ successes: 0, desperationDice: 1, desperateCritical: false, desperateFailure: true, verdict: "Falha desesperada" });
  });
});
