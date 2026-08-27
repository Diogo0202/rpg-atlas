import { describe, expect, it } from "vitest";
import { V5_CLANS, V5_STARTER_ARCHETYPES, V5_STORE, appendV5History, applyClanDisciplines, buildV5SheetExportSections, calculateV5ExperienceCost, createV5CatalogInventoryItem, createV5SheetData, filterV5Store, getV5EquippedArmor, getV5EquippedWeapon, normalizeV5Inventory, reconcileV5EquipmentAfterInventoryEdit, v5HealthTrack, v5WillpowerTrack } from "./vampire-v5";

describe("fundação da ficha V5", () => {
  it("inicia a ficha com os marcadores centrais da criação", () => {
    const sheet = createV5SheetData();
    expect(sheet.generation).toBe(13);
    expect(sheet.humanity).toBe(7);
    expect(sheet.hunger).toBe(1);
    expect(sheet.damage).toEqual({ superficial: 0, aggravated: 0 });
  });

  it("calcula Vitalidade e Força de Vontade a partir dos atributos", () => {
    expect(v5HealthTrack({ Vigor: 3 })).toBe(6);
    expect(v5WillpowerTrack({ Determinação: 3, Autocontrole: 2 })).toBe(5);
  });

  it("oferece linhagens e aquisições em todas as categorias de consulta", () => {
    expect(V5_CLANS.length).toBeGreaterThanOrEqual(16);
    expect(V5_CLANS.map((clan) => clan.id)).toEqual(expect.arrayContaining(["banu-haqim", "brujah", "gangrel", "hecata", "lasombra", "malkavian", "ministerio", "nosferatu", "ravnos", "salubri", "toreador", "tremere", "tzimisce", "ventrue", "caitiff", "sangue-ralo"]));
    expect(new Set(V5_STORE.map((item) => item.category))).toEqual(new Set(["arma", "armadura", "equipamento", "roupa", "moradia", "veiculo", "montaria"]));
  });

  it("prepara as disciplinas de origem e oferece modelos iniciais para novos jogadores", () => {
    expect(applyClanDisciplines("toreador", { "Auspícios": ["Sentidos Aguçados"], "Potência": ["Salto"] })).toEqual({ "Auspícios": ["Sentidos Aguçados"], "Celeridade": [], "Presença": [] });
    expect(V5_STARTER_ARCHETYPES.map((archetype) => archetype.id)).toEqual(expect.arrayContaining(["combate-corpo-a-corpo", "armas-de-fogo", "assassino", "manipulacao", "social", "mental"]));
  });

  it("mantém um histórico compacto com as alterações mais recentes da ficha", () => {
    let sheet = createV5SheetData();
    sheet = appendV5History(sheet, "Clã definido: Toreador.", 100);
    sheet = appendV5History(sheet, "Modelo social aplicado.", 200);
    expect(sheet.history).toEqual([{ id: "history-200-1", label: "Modelo social aplicado.", recordedAt: 200 }, { id: "history-100-0", label: "Clã definido: Toreador.", recordedAt: 100 }]);
  });

  it("calcula a evolução por cada nível adquirido e encontra a arma equipada", () => {
    expect(calculateV5ExperienceCost("attribute", 2, 4)).toBe(35);
    expect(calculateV5ExperienceCost("outOfClanDiscipline", 1, 2)).toBe(14);
    expect(getV5EquippedWeapon({ inventory: [createV5CatalogInventoryItem("pistola")!], equippedWeaponId: "pistola" })?.damage).toBe(2);
    expect(getV5EquippedArmor({ inventory: [createV5CatalogInventoryItem("colete")!], equippedArmorId: "colete" })?.armor).toBe(2);
    expect(createV5SheetData().experienceHistory).toEqual([]);
  });

  it("filtra o arsenal por categoria, custo e tipo de dano", () => {
    const results = filterV5Store(V5_STORE, { categories: ["arma"], category: "arma", maxResources: 2, damageType: "contundente" });
    expect(results.map((item) => item.id)).toContain("taco");
    expect(results.every((item) => item.resources <= 2)).toBe(true);
  });

  it("resume inventário equipado e histórico de experiência para exportação", () => {
    const sheet = createV5SheetData();
    sheet.inventory = [createV5CatalogInventoryItem("pistola")!, createV5CatalogInventoryItem("colete")!];
    sheet.equippedWeaponId = "pistola";
    sheet.equippedArmorId = "colete";
    sheet.experienceHistory = [{ id: "xp-1", kind: "skill", currentDots: 2, targetDots: 3, cost: 9, recordedAt: 1_700_000_000_000 }];
    const sections = buildV5SheetExportSections({ name: "Mara", sheet });

    expect(sections.find((section) => section.title === "Inventário e equipamento")?.lines.join(" ")).toContain("[ARMA EQUIPADA]");
    expect(sections.find((section) => section.title === "Inventário e equipamento")?.lines.join(" ")).toContain("[ARMADURA EQUIPADA]");
    expect(sections.find((section) => section.title === "Histórico de experiência")?.lines.join(" ")).toContain("9 XP");
  });

  it("migra itens legados e preserva itens personalizados editáveis", () => {
    const inventory = normalizeV5Inventory(["pistola", { id: "custom-estojo", source: "custom", name: "Estojo ritual", category: "equipamento", resources: 1, quantity: 2, specification: "Ampolas e lâminas.", damage: 0 }]);
    expect(inventory).toHaveLength(2);
    expect(inventory[0]).toMatchObject({ catalogId: "pistola", source: "catalog", quantity: 1 });
    expect(inventory[1]).toMatchObject({ name: "Estojo ritual", quantity: 2, source: "custom" });
  });

  it("remove equipamento ativo incompatível quando a categoria do item é alterada", () => {
    expect(reconcileV5EquipmentAfterInventoryEdit({ equippedWeaponId: "pistola", equippedArmorId: "colete" }, { id: "pistola", category: "equipamento" })).toMatchObject({ equippedWeaponId: null, equippedArmorId: "colete" });
    expect(reconcileV5EquipmentAfterInventoryEdit({ equippedWeaponId: "pistola", equippedArmorId: "colete" }, { id: "colete", category: "armadura" })).toMatchObject({ equippedWeaponId: "pistola", equippedArmorId: "colete" });
  });
});
