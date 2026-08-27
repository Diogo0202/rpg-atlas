import { describe, expect, it } from "vitest";
import { CAMPAIGN_JOURNAL_EXPORT_FORMAT, campaignJournalFilename, createCampaignJournalExport } from "./campaign-journal";

describe("exportação do diário da campanha", () => {
  it("reúne sessões, eventos e facções vinculadas em um arquivo compartilhável", () => {
    const payload = createCampaignJournalExport({ id: 7, title: "A Coroa Partida" }, [{ id: 3, sequence: 2, title: "O Vau", summary: "Travessia", status: "played", playedAt: new Date("2026-08-27T12:00:00.000Z") }], [{ id: 9, title: "O sino", description: "A cidade ouviu", status: "active", occurredAt: new Date("2026-08-27T13:00:00.000Z"), sessionId: 3, factions: [{ id: 4, name: "Ordem da Cinza", tension: 2, maxTension: 6 }] }]);
    expect(payload.format).toBe(CAMPAIGN_JOURNAL_EXPORT_FORMAT);
    expect(payload.campaign).toEqual({ id: 7, title: "A Coroa Partida" });
    expect(payload.events[0]?.factions).toEqual([{ id: 4, name: "Ordem da Cinza", tension: 2, maxTension: 6 }]);
    expect(campaignJournalFilename("A Coroa Partida")).toBe("a-coroa-partida-diario-rpg-atlas.json");
  });
});
