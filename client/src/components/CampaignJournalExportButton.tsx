import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { campaignJournalFilename, createCampaignJournalExport } from "@shared/campaign-journal";
import { Download, FileText, LoaderCircle } from "lucide-react";
import React from "react";
import { toast } from "sonner";

type SessionExport = { id: number; sequence: number; title: string; summary: string | null; status: string; playedAt: Date | null };

export function CampaignJournalExportButton({ campaignId, campaignTitle, sessions }: { campaignId: number | null; campaignTitle?: string; sessions: SessionExport[] }) {
  const events = trpc.campaigns.events.useQuery({ campaignId: campaignId || 0 }, { enabled: Boolean(campaignId) });
  const payload = () => {
    if (!campaignId || !campaignTitle) { toast.error("Selecione uma campanha antes de exportar o diário."); return null; }
    return createCampaignJournalExport({ id: campaignId, title: campaignTitle }, sessions, events.data || []);
  };
  const exportJournal = () => {
    const content = payload();
    if (!content) return;
    try {
      const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: "application/json" }));
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = campaignJournalFilename(content.campaign.title); document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
      toast.success("Diário de campanha exportado em JSON.");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível exportar o diário em JSON agora.");
    }
  };
  const exportPdf = async () => {
    const content = payload();
    if (!content) return;
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = 190;
      let y = 18;
      const write = (text: string, size = 9, bold = false) => { pdf.setFont("times", bold ? "bold" : "normal"); pdf.setFontSize(size); const lines = pdf.splitTextToSize(text, pageWidth); const height = lines.length * (size * 0.48 + 1); if (y + height > 280) { pdf.addPage(); y = 18; } pdf.text(lines, 10, y); y += height + 3; };
      pdf.setFillColor(17, 19, 18); pdf.rect(0, 0, 210, 297, "F"); pdf.setTextColor(234, 227, 213); write("RPG ATLAS · DIÁRIO DE CAMPANHA", 9, true); write(content.campaign.title, 24, true); write(`Exportado em ${new Date(content.exportedAt).toLocaleString("pt-BR")}`, 9);
      pdf.setDrawColor(181, 91, 50); pdf.line(10, y, 200, y); y += 8;
      write("SESSÕES", 13, true);
      content.sessions.forEach((session) => write(`#${session.sequence} · ${session.title} · ${session.status}\n${session.summary || "Sem resumo registrado."}${session.playedAt ? `\nRealizada: ${new Date(session.playedAt).toLocaleDateString("pt-BR")}` : ""}`));
      write("EVENTOS DA LINHA DO TEMPO", 13, true);
      content.events.forEach((event) => write(`${event.title} · ${event.status}\n${event.description || "Sem descrição registrada."}${event.sessionId ? `\nSessão vinculada: #${content.sessions.find((session) => session.id === event.sessionId)?.sequence || event.sessionId}` : ""}${event.factions.length ? `\nFacções: ${event.factions.map((faction) => faction.name).join(" · ")}` : ""}`));
      pdf.save(campaignJournalFilename(content.campaign.title).replace(/\.json$/, ".pdf"));
      toast.success("Diário de campanha exportado em PDF.");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível exportar o diário em PDF agora.");
    }
  };
  const disabled = !campaignId || events.isLoading;
  return <div className="flex gap-2"> <Button type="button" onClick={exportPdf} disabled={disabled} variant="outline" className="h-10 rounded-none border-[#b55b32]/60 bg-[#b55b32]/10 text-[9px] font-bold uppercase tracking-[.12em] text-[#f4eee4] hover:bg-[#b55b32]/20">{events.isLoading ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <FileText className="mr-2 h-3.5 w-3.5" />}PDF</Button><Button type="button" onClick={exportJournal} disabled={disabled} variant="outline" className="h-10 rounded-none border-[#83a89a]/55 bg-[#83a89a]/10 text-[9px] font-bold uppercase tracking-[.12em] text-[#f4eee4] hover:bg-[#83a89a]/20">{events.isLoading ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-2 h-3.5 w-3.5" />}JSON</Button></div>;
}
