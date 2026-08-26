import { describe, expect, it } from "vitest";
import { isCrisisInCampaign, matchesCrisisCategory, matchesItemCategory, matchesSearchText, normalizeMasterOrder, toWorkbenchCampaign, type SectionKey } from "./CampaignWorkbench";

describe("normalizeMasterOrder", () => {
  it("mantém a ordem personalizada e completa as seções ausentes", () => {
    expect(normalizeMasterOrder(["items", "session"] as SectionKey[])).toEqual(["items", "session", "crises", "hooks", "npcs"]);
  });

  it("remove entradas duplicadas sem perder uma seção necessária", () => {
    expect(normalizeMasterOrder(["npcs", "npcs", "crises"] as SectionKey[])).toEqual(["npcs", "crises", "session", "hooks", "items"]);
  });

  it("adapta campanhas persistentes sem colidir com os identificadores locais", () => {
    expect(toWorkbenchCampaign({ id: 7, title: "A Estrada Cinzenta", description: null, systemId: "o-um-anel" })).toMatchObject({ id: "cloud-7", name: "A Estrada Cinzenta", register: "ARQ-007", setting: "Campanha persistente no arquivo" });
  });

  it("localiza texto de crises e itens sem diferenciar maiúsculas", () => {
    expect(matchesSearchText("sombra", ["Crise na Sombra", "Consequência pendente"])).toBe(true);
    expect(matchesSearchText("ponte", ["Crise na Sombra", "Consequência pendente"])).toBe(false);
  });

  it("atribui crises legadas à campanha inicial e isola crises de outra campanha", () => {
    expect(isCrisisInCampaign({ faction: "Conselho", session: "", title: "Legada", consequence: "", resolved: false }, "coroa-partida")).toBe(true);
    expect(isCrisisInCampaign({ campaignId: "sino-afogado", faction: "Conselho", session: "", title: "Outra", consequence: "", resolved: false }, "coroa-partida")).toBe(false);
  });

  it("filtra crises por estado e itens pelo tipo selecionado", () => {
    const ongoing = { faction: "Conselho", session: "", title: "Alerta", consequence: "", resolved: false };
    const relic = { id: "IT-1", campaignId: "coroa-partida", campaign: "A Coroa Partida", name: "Selo", type: "Relíquia" as const, rarity: "Raro" as const, description: "", cost: "", complication: "" };
    expect(matchesCrisisCategory(ongoing, "Em curso")).toBe(true);
    expect(matchesCrisisCategory(ongoing, "Resolvidas")).toBe(false);
    expect(matchesItemCategory(relic, "Relíquia")).toBe(true);
    expect(matchesItemCategory(relic, "Ritual")).toBe(false);
  });
});
