import { jsPDF } from "jspdf";
import { describe, expect, it } from "vitest";
import { buildV5SheetExportSections, createV5SheetData } from "./vampire-v5";

describe("artefato PDF da ficha V5", () => {
  it("gera um documento PDF válido a partir das seções completas da ficha", () => {
    const sheet = createV5SheetData();
    sheet.inventory = ["pistola"];
    sheet.equippedWeaponId = "pistola";
    sheet.experienceHistory = [{ id: "xp-1", kind: "attribute", currentDots: 1, targetDots: 2, cost: 10, recordedAt: 1_700_000_000_000 }];
    const report = buildV5SheetExportSections({ name: "Mara", sheet });
    const pdf = new jsPDF();
    pdf.text(report.flatMap((section) => [section.title, ...section.lines]).join("\n"), 15, 15);
    const bytes = new Uint8Array(pdf.output("arraybuffer"));

    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe("%PDF");
    expect(report.map((section) => section.title)).toContain("Histórico de experiência");
  });
});
