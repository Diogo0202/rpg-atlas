import { describe, expect, it } from "vitest";
import { normalizeMasterOrder, type SectionKey } from "./CampaignWorkbench";

describe("normalizeMasterOrder", () => {
  it("mantém a ordem personalizada e completa as seções ausentes", () => {
    expect(normalizeMasterOrder(["items", "session"] as SectionKey[])).toEqual(["items", "session", "crises", "hooks", "npcs"]);
  });

  it("remove entradas duplicadas sem perder uma seção necessária", () => {
    expect(normalizeMasterOrder(["npcs", "npcs", "crises"] as SectionKey[])).toEqual(["npcs", "crises", "session", "hooks", "items"]);
  });
});
