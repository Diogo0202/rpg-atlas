import { describe, expect, it } from "vitest";
import { V5_CLANS, V5_STORE, createV5SheetData, v5HealthTrack, v5WillpowerTrack } from "./vampire-v5";

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
});
