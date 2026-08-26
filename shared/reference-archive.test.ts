import { describe, expect, it } from "vitest";
import { HUNTER_CREEDS, ONE_RING_LINEAGES, V5_REFERENCE_CLANS } from "./reference-archive";

describe("acervo de consulta", () => {
  it("preserva as doze entradas principais de clãs para consulta rápida", () => {
    expect(V5_REFERENCE_CLANS).toHaveLength(12);
    expect(V5_REFERENCE_CLANS.map((clan) => clan.id)).toEqual(expect.arrayContaining(["banu-haqim", "brujah", "toreador", "tremere", "tzimisce", "ventrue"]));
  });

  it("reúne os cinco credos de Caçador e os seis povos jogáveis de O Um Anel", () => {
    expect(HUNTER_CREEDS.map((creed) => creed.name)).toEqual(["Empreendedor", "Devoto", "Inquisitivo", "Marcial", "Clandestino"]);
    expect(ONE_RING_LINEAGES).toHaveLength(6);
    expect(ONE_RING_LINEAGES.map((lineage) => lineage.name)).toContain("Patrulheiros do Norte");
  });
});
