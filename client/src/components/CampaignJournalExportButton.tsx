import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { campaignJournalFilename, createCampaignJournalExport } from "@shared/campaign-journal";
import { Download, LoaderCircle } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export function CampaignJournalExportButton({ campaignId, campaignTitle, sessions }: { campaignId: number | null; campaignTitle?: string; sessions: { id: number; sequence: number; title: string; summary: string | null; status: string; playedAt: Date | null }[] }) {
  const events = trpc.campaigns.events.useQuery({ campaignId: campaignId || 0 }, { enabled: Boolean(campaignId) });
  const exportJournal = () => {
    if (!campaignId || !campaignTitle) return toast.error("Selecione uma campanha antes de exportar o diário.");
    const payload = createCampaignJournalExport({ id: campaignId, title: campaignTitle }, sessions, events.data || []);
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = campaignJournalFilename(campaignTitle); document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
    toast.success("Diário de campanha exportado em JSON.");
  };
  return <Button type="button" onClick={exportJournal} disabled={!campaignId || events.isLoading} variant="outline" className="h-10 rounded-none border-[#83a89a]/55 bg-[#83a89a]/10 text-[9px] font-bold uppercase tracking-[.12em] text-[#f4eee4] hover:bg-[#83a89a]/20">{events.isLoading ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-2 h-3.5 w-3.5" />}Exportar JSON</Button>;
}
