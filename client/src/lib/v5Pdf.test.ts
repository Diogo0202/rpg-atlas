import { describe, expect, it } from "vitest";
import { createV5MailtoUrl, getV5PdfFilename } from "./v5Pdf";

describe("compartilhamento da ficha V5", () => {
  it("gera um nome de arquivo seguro para o dossiê PDF", () => {
    expect(getV5PdfFilename("Mara de Veyr")).toBe("rpg-atlas-v5-mara-de-veyr.pdf");
  });

  it("prepara uma mensagem de e-mail contextualizada para anexar o PDF baixado", () => {
    const url = createV5MailtoUrl({ name: "Mara", concept: "Detetive", campaignName: "A Coroa Partida" });
    expect(url).toContain("mailto:");
    expect(decodeURIComponent(url)).toContain("Ficha V5 · Mara");
    expect(decodeURIComponent(url)).toContain("A Coroa Partida");
  });
});
