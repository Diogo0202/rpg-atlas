export type CampaignMapRegionId = "arys" | "estrada" | "estatua" | "floresta" | "ruinas" | "sinalizador";

export type CampaignMapState = {
  selectedRegion: CampaignMapRegionId;
  tension: number;
  resolved: string[];
};

export const CAMPAIGN_MAP_STORAGE_KEY = "rpg-atlas-shadowlords-map-state";

export const initialCampaignMapState = (): CampaignMapState => ({ selectedRegion: "arys", tension: 0, resolved: [] });

export function advanceCampaignTension(state: CampaignMapState, amount = 1): CampaignMapState {
  return { ...state, tension: Math.min(6, Math.max(0, state.tension + amount)) };
}

export function selectCampaignRegion(state: CampaignMapState, region: CampaignMapRegionId): CampaignMapState {
  return { ...state, selectedRegion: region };
}

export function resolveCampaignEncounter(state: CampaignMapState, encounterId: string): CampaignMapState {
  return state.resolved.includes(encounterId) ? state : { ...state, resolved: [...state.resolved, encounterId] };
}

export function resetCampaignMap(): CampaignMapState {
  return initialCampaignMapState();
}

export function serializeCampaignMapState(state: CampaignMapState): string {
  return JSON.stringify(state);
}

export function parseCampaignMapState(raw: string | null): CampaignMapState {
  if (!raw) return initialCampaignMapState();
  try {
    const parsed = JSON.parse(raw) as Partial<CampaignMapState>;
    const tension = typeof parsed.tension === "number" ? Math.min(6, Math.max(0, parsed.tension)) : 0;
    const selectedRegion = parsed.selectedRegion ?? "arys";
    const validRegions: CampaignMapRegionId[] = ["arys", "estrada", "estatua", "floresta", "ruinas", "sinalizador"];
    return {
      selectedRegion: validRegions.includes(selectedRegion) ? selectedRegion : "arys",
      tension,
      resolved: Array.isArray(parsed.resolved) ? parsed.resolved.filter((value): value is string => typeof value === "string") : [],
    };
  } catch {
    return initialCampaignMapState();
  }
}
