/** Visualizador de fichas locais no painel inicial; criação e edição vivem nos módulos próprios. */
import { BookOpen, ChevronRight, Eye, FolderOpen, UserRound } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

type StoredSheet = {
  id: string;
  name?: string;
  concept?: string;
  chronicle?: string;
  clanId?: string;
  hunger?: number;
  portrait?: string;
  selectedPowerIds?: string[];
};

const clanNames: Record<string, string> = {
  sanguelume: "Sanguelume",
  ferrovelho: "Ferrovelho",
  orvalhonegro: "Orvalho Negro",
};

function loadSheets(): StoredSheet[] {
  try {
    const raw = window.localStorage.getItem("rpg-atlas-v5-sheets-v1");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((sheet): sheet is StoredSheet => Boolean(sheet && typeof sheet === "object" && typeof sheet.id === "string")) : [];
  } catch {
    return [];
  }
}

export default function CharacterArchive() {
  const [, setLocation] = useLocation();
  const [sheets, setSheets] = useState<StoredSheet[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const next = loadSheets();
    setSheets(next);
    setActiveId((current) => current || next[0]?.id || "");
  }, []);

  const activeSheet = useMemo(() => sheets.find((sheet) => sheet.id === activeId) || sheets[0], [activeId, sheets]);

  return <section id="fichas" className="relative overflow-hidden bg-[#111312] text-[#eae3d5]"><div className="pointer-events-none absolute inset-0 dossier-grid opacity-25" /><div className="relative mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><header className="grid gap-8 border-b border-white/10 pb-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end"><div><p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#83a89a]"><span className="grid h-7 w-7 place-items-center border border-[#b55b32] font-serif text-[15px] text-[#d27648]">V</span> 06 · arquivo de personagens · V5</p><h2 className="mt-5 font-serif text-[54px] leading-[0.88] tracking-[-0.05em] text-[#f4eee4] sm:text-[76px]">Fichas em<br />consulta.</h2></div><p className="max-w-[620px] text-[17px] leading-8 text-[#b8b3a8]">Este painel inicial é dedicado à leitura das fichas que você já preservou no cofre local. A criação e a edição permanecem no módulo de ficha V5.</p></header>{sheets.length === 0 ? <div className="mt-10 grid gap-6 border border-dashed border-white/15 bg-[#171a18] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#a9c7bb]"><FolderOpen className="h-4 w-4" /> Cofre local vazio</p><p className="mt-4 max-w-xl font-serif text-3xl leading-none text-[#f4eee4]">Nenhuma ficha salva para visualizar.</p><p className="mt-4 max-w-xl text-sm leading-6 text-[#b8b3a8]">Quando uma ficha for preservada no módulo V5, ela aparecerá aqui para consulta rápida.</p></div><Button type="button" onClick={() => setLocation("/ficha-v5")} className="h-11 rounded-none bg-[#b55b32] px-5 text-[10px] font-bold uppercase tracking-[.13em] text-[#111312] hover:bg-[#d27648]">Abrir fichas V5 <ChevronRight className="ml-2 h-4 w-4" /></Button></div> : <div className="mt-10 grid gap-7 xl:grid-cols-[0.72fr_1.28fr]"><aside className="border border-white/10 bg-[#171a18] p-5"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#a9c7bb]"><BookOpen className="h-4 w-4" /> Registros preservados <span className="ml-auto border border-[#83a89a]/45 px-2 py-0.5 text-[8px]">{String(sheets.length).padStart(2, "0")}</span></div><div className="mt-5 space-y-2">{sheets.map((sheet, index) => <button key={sheet.id} type="button" onClick={() => setActiveId(sheet.id)} aria-pressed={activeSheet?.id === sheet.id} className={`w-full border p-4 text-left transition-colors ${activeSheet?.id === sheet.id ? "border-[#b55b32] bg-[#b55b32]/10" : "border-white/10 bg-black/10 hover:border-[#83a89a]"}`}><p className="text-[8px] font-bold uppercase tracking-[.14em] text-[#a9c7bb]">Registro {String(index + 1).padStart(2, "0")} · V5</p><p className="mt-2 font-serif text-2xl leading-none text-[#f4eee4]">{sheet.name || "Ficha sem nome"}</p><p className="mt-2 truncate text-[10px] font-bold uppercase tracking-[.1em] text-[#b8b3a8]">{sheet.concept || "Conceito em aberto"}</p></button>)}</div></aside><article className="relative overflow-hidden border border-[#b55b32]/45 bg-[#171a18] p-6 sm:p-8"><div className="absolute inset-0 dossier-grid opacity-20" />{activeSheet && <div className="relative"><div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-start"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#a9c7bb]"><Eye className="h-4 w-4" /> Visualização de ficha</p><h3 className="mt-4 font-serif text-5xl leading-none text-[#f4eee4]">{activeSheet.name || "Ficha sem nome"}</h3><p className="mt-3 text-sm text-[#d6d0c5]">{activeSheet.concept || "Conceito em aberto"}</p></div>{activeSheet.portrait ? <img src={activeSheet.portrait} alt={`Retrato de ${activeSheet.name || "personagem"}`} className="h-24 w-24 border border-[#83a89a]/55 object-cover" /> : <div className="grid h-24 w-24 place-items-center border border-dashed border-[#83a89a]/45 text-[#a9c7bb]"><UserRound className="h-8 w-8" /></div>}</div><div className="mt-6 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3"><div className="bg-[#101211] p-4"><p className="text-[8px] font-bold uppercase tracking-[.14em] text-[#a9c7bb]">Crônica</p><p className="mt-2 font-serif text-xl text-[#f4eee4]">{activeSheet.chronicle || "Não registrada"}</p></div><div className="bg-[#101211] p-4"><p className="text-[8px] font-bold uppercase tracking-[.14em] text-[#a9c7bb]">Clã</p><p className="mt-2 font-serif text-xl text-[#f4eee4]">{clanNames[activeSheet.clanId || ""] || "Não registrado"}</p></div><div className="bg-[#101211] p-4"><p className="text-[8px] font-bold uppercase tracking-[.14em] text-[#a9c7bb]">Fome</p><p className="mt-2 font-serif text-xl text-[#d27648]">{activeSheet.hunger ?? "—"}</p></div></div><p className="mt-6 text-[11px] leading-5 text-[#a6a397]">{activeSheet.selectedPowerIds?.length || 0} poder(es) registrado(s) nesta cópia. Para alterar traços, poderes ou inventário, abra o módulo de ficha V5.</p><Button type="button" onClick={() => setLocation("/ficha-v5")} variant="outline" className="mt-7 h-10 rounded-none border-[#83a89a]/55 px-4 text-[9px] font-bold uppercase tracking-[.12em] text-[#eae3d5] hover:bg-[#83a89a]/10">Abrir visualizador V5 <ChevronRight className="ml-2 h-4 w-4" /></Button></div>}</article></div>}</div></section>;
}
