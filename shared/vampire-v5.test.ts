import { describe, expect, it } from "vitest";
import { V5_CLANS, V5_STORE, buildV5SheetExportSections, calculateV5ExperienceCost, createV5SheetData, filterV5Store, getV5EquippedArmor, getV5EquippedWeapon, v5HealthTrack, v5WillpowerTrack } from "./vampire-v5";

describe("fundação da ficha V5", () => {
  it("inicia a ficha com os marcadores centrais da criação", () => {
    const sheet = createV5SheetData();
    expect(sheet.generation).toBe(13);
    expect(sheet.humanity).toBe(7);
    expect(sheet.hunger).toBe(1);
  });

  it("calcula Vitalidade e Força de Vontade a partir dos atributos", () => {
    expect(v5HealthTrack({ Vigor: 3 })).toBe(6);
    expect(v5WillpowerTrack({ Determinação: 3, Autocontrole: 2 })).toBe(5);
  });

  it("oferece linhagens e aquisições em todas as categorias de consulta", () => {
    expect(V5_CLANS.length).toBeGreaterThanOrEqual(16);
    expect(new Set(V5_STORE.map((item) => item.category))).toEqual(new Set(["arma", "armadura", "equipamento", "roupa", "moradia", "veiculo", "montaria"]));
  });

  it("calcula a evolução por cada nível adquirido e encontra a arma equipada", () => {
    expect(calculateV5ExperienceCost("attribute", 2, 4)).toBe(35);
    expect(calculateV5ExperienceCost("outOfClanDiscipline", 1, 2)).toBe(14);
    expect(getV5EquippedWeapon({ equippedWeaponId: "pistola" })?.damage).toBe(2);
    expect(getV5EquippedArmor({ equippedArmorId: "colete" })?.armor).toBe(2);
    expect(createV5SheetData().experienceHistory).toEqual([]);
  });

  it("filtra o arsenal por categoria, custo e tipo de dano", () => {
    const results = filterV5Store(V5_STORE, { categories: ["arma"], category: "arma", maxResources: 2, damageType: "contundente" });
    expect(results.map((item) => item.id)).toContain("taco");
    expect(results.every((item) => item.resources <= 2)).toBe(true);
  });

  it("resume inventário equipado e histórico de experiência para exportação", () => {
    const sheet = createV5SheetData();
    sheet.inventory = ["pistola", "colete"];
    sheet.equippedWeaponId = "pistola";
    sheet.equippedArmorId = "colete";
    sheet.experienceHistory = [{ id: "xp-1", kind: "skill", currentDots: 2, targetDots: 3, cost: 9, recordedAt: 1_700_000_000_000 }];
    const sections = buildV5SheetExportSections({ name: "Mara", sheet });

    expect(sections.find((section) => section.title === "Inventário e equipamento")?.lines.join(" ")).toContain("[ARMA EQUIPADA]");
    expect(sections.find((section) => section.title === "Inventário e equipamento")?.lines.join(" ")).toContain("[ARMADURA EQUIPADA]");
    expect(sections.find((section) => section.title === "Histórico de experiência")?.lines.join(" ")).toContain("9 XP");
  });
});
