import { describe, expect, it } from "vitest";
import { PDF_THEME_LABELS } from "./pdfThemes";

describe("temas de PDF", () => {
  it("identifica os três sistemas com rótulos próprios", () => {
    expect(PDF_THEME_LABELS).toEqual({ "vampire-v5": "Vampiro V5", hunter: "Caçador", "o-um-anel": "O Um Anel" });
  });
});
