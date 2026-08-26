import { describe, expect, it } from "vitest";
import { getOneRingPdfFilename } from "./oneRingPdf";

describe("exportação de O Um Anel", () => {
  it("gera um nome de arquivo seguro para impressão", () => {
    expect(getOneRingPdfFilename("Frodo do Condado")).toBe("rpg-atlas-um-anel-frodo-do-condado.pdf");
  });
});
