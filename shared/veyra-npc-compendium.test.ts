import { describe, expect, it } from "vitest";
import { filterVeyraNpcs, kaneNpcSource, veyraNpcCompendium } from "./veyra-npc-compendium";

describe("compêndio de NPCs de Véspera do Vau", () => {
  it("preserva os três grupos de relação e uma fonte para cada NPC", () => {
    expect(filterVeyraNpcs("ally")).toHaveLength(5);
    expect(filterVeyraNpcs("enemy")).toHaveLength(4);
    expect(filterVeyraNpcs("neutral")).toHaveLength(7);
    expect(veyraNpcCompendium.every((npc) => npc.sourcePage > 0 && npc.hook.length > 0)).toBe(true);
  });

  it("mantém os seis personagens Kane vinculados ao guia e à página corretos", () => {
    const kaneNpcs = veyraNpcCompendium.filter((npc) => npc.id.endsWith("-kane"));
    expect(kaneNpcs).toHaveLength(6);
    expect(kaneNpcs.map((npc) => npc.sourcePage)).toEqual([4, 8, 11, 14, 17, 17]);
    expect(kaneNpcs.every((npc) => npc.source?.url === kaneNpcSource.url)).toBe(true);
  });

  it("busca NPCs por nome, especialidade, descrição ou gancho, sem diferenciar maiúsculas ou acentos", () => {
    expect(filterVeyraNpcs("all", "Cardeal Inquisidor").map((npc) => npc.id)).toEqual(["salamon-kane"]);
    expect(filterVeyraNpcs("all", "contrainteligencia").map((npc) => npc.id)).toEqual(["salamon-kane"]);
    expect(filterVeyraNpcs("neutral", "infiltração").map((npc) => npc.id)).toEqual(["alistair-kane", "dorian-kane"]);
    expect(filterVeyraNpcs("ally", "ossário").map((npc) => npc.id)).toEqual(["maela-varn"]);
    expect(filterVeyraNpcs("enemy", "cultos niilistas").map((npc) => npc.id)).toEqual(["salamon-kane"]);
  });
});
