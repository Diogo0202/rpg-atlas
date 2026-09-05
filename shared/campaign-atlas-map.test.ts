import { describe, expect, it } from "vitest";
import {
  advanceCampaignTension,
  initialCampaignMapState,
  parseCampaignMapState,
  resetCampaignMap,
  resolveCampaignEncounter,
  selectCampaignRegion,
  serializeCampaignMapState,
} from "./campaign-atlas-map";

describe("campaign atlas map state", () => {
  it("starts at Arys with an empty tension clock", () => {
    expect(initialCampaignMapState()).toEqual({ selectedRegion: "arys", tension: 0, resolved: [] });
  });

  it("clamps tension between zero and six", () => {
    const state = initialCampaignMapState();
    expect(advanceCampaignTension(state, 8).tension).toBe(6);
    expect(advanceCampaignTension({ ...state, tension: 2 }, -9).tension).toBe(0);
  });

  it("selects regions and resolves encounters only once", () => {
    const selected = selectCampaignRegion(initialCampaignMapState(), "floresta");
    const resolved = resolveCampaignEncounter(selected, "miasma");
    expect(resolveCampaignEncounter(resolved, "miasma")).toEqual(resolved);
    expect(resolved).toEqual({ selectedRegion: "floresta", tension: 0, resolved: ["miasma"] });
  });

  it("serializes and sanitizes persisted state", () => {
    const state = { selectedRegion: "ruinas" as const, tension: 4, resolved: ["sinos"] };
    expect(parseCampaignMapState(serializeCampaignMapState(state))).toEqual(state);
    expect(parseCampaignMapState('{"selectedRegion":"unknown","tension":99,"resolved":["x",3]}')).toEqual({ selectedRegion: "arys", tension: 6, resolved: ["x"] });
    expect(parseCampaignMapState("not-json")).toEqual(initialCampaignMapState());
  });

  it("resets the campaign state", () => {
    expect(resetCampaignMap()).toEqual(initialCampaignMapState());
  });
});
