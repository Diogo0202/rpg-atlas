import { describe, expect, it } from "vitest";
import { getHunterPdfFilename } from "./hunterPdf";

describe("exportação PDF de Caçador", () => {
  it("gera um nome de arquivo seguro com o sistema", () => {
    expect(getHunterPdfFilename("Ágata da Célula")).toBe("rpg-atlas-cacador-agata-da-celula.pdf");
  });
});
