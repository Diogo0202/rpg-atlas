export const CAMPAIGN_JOURNAL_EXPORT_FORMAT = "rpg-atlas-campaign-journal-v1";

type SessionRecord = { id: number; sequence: number; title: string; summary: string | null; status: string; playedAt: Date | null };
type EventRecord = { id: number; title: string; description: string | null; status: string; occurredAt: Date; sessionId: number | null; factions?: { id: number; name: string; tension: number; maxTension: number }[] };

export function createCampaignJournalExport(campaign: { id: number; title: string }, sessions: SessionRecord[], events: EventRecord[]) {
  return {
    format: CAMPAIGN_JOURNAL_EXPORT_FORMAT,
    exportedAt: new Date().toISOString(),
    campaign: { id: campaign.id, title: campaign.title },
    sessions: sessions.map((session) => ({ id: session.id, sequence: session.sequence, title: session.title, summary: session.summary, status: session.status, playedAt: session.playedAt?.toISOString() || null })),
    events: events.map((event) => ({ id: event.id, title: event.title, description: event.description, status: event.status, occurredAt: event.occurredAt.toISOString(), sessionId: event.sessionId, factions: (event.factions || []).map((faction) => ({ id: faction.id, name: faction.name, tension: faction.tension, maxTension: faction.maxTension })) })),
  };
}

export function campaignJournalFilename(title: string) {
  const safeTitle = title.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${safeTitle || "campanha"}-diario-rpg-atlas.json`;
}
