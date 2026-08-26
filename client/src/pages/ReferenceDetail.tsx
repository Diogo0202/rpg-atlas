import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { HUNTER_CREEDS, ONE_RING_LINEAGES, REFERENCE_SOURCES, V5_REFERENCE_CLANS } from "@shared/reference-archive";
import { V5_DISCIPLINES } from "@shared/vampire-v5";
import { ArrowLeft, BookMarked, Crosshair, Sparkles } from "lucide-react";
import React from "react";
import { Link, useParams } from "wouter";

type ReferenceCategory = "clas" | "credos" | "linhagens";

function DetailShell({ eyebrow, title, source, children }: { eyebrow: string; title: string; source: string; children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#101211] text-[#eae3d5]"><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10"><Link href="/acervo"><Button variant="outline" className="h-10 rounded-none border-white/15 bg-[#171a18] text-[10px] font-bold uppercase tracking-[0.13em] text-[#eae3d5] hover:bg-white/[0.04]"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Acervo</Button></Link><header className="mt-7 border-b border-white/10 pb-7"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#83a89a]">{eyebrow}</p><h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] text-[#f4eee4]">{title}</h1><p className="mt-4 flex items-center gap-2 text-xs leading-5 text-[#a9c7bb]"><BookMarked className="h-4 w-4 shrink-0 text-[#d27648]" /> Fonte de consulta: {source}</p></header>{children}</div></div>;
}

function NotFoundDetail() {
  return <DetailShell eyebrow="Acervo de referência" title="Registro não localizado" source="Arquivo do Atlas"><section className="mt-7 border border-dashed border-white/20 bg-[#171a18] p-7 text-sm leading-6 text-[#b8b3a8]">O dossiê solicitado não está disponível neste índice. Retorne ao Acervo para consultar os registros catalogados.</section></DetailShell>;
}

export function ReferenceDetailContent({ category, id }: { category: ReferenceCategory; id: string }) {
  if (category === "clas") {
    const clan = V5_REFERENCE_CLANS.find((entry) => entry.id === id);
    if (!clan) return <NotFoundDetail />;
    return <DetailShell eyebrow="Vampiro: A Máscara V5 · dossiê de clã" title={clan.name} source={REFERENCE_SOURCES.vampire.label}><section className="mt-7 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]"><article className="border border-[#b55b32]/45 bg-[#171a18] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]">Herança de sangue</p><div className="mt-5 space-y-5"><div><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#d27648]">Perdição</p><p className="mt-2 text-sm leading-6 text-[#eae3d5]">{clan.bane}</p></div><div className="border-t border-white/10 pt-4"><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#a9c7bb]">Compulsão</p><p className="mt-2 text-sm leading-6 text-[#eae3d5]">{clan.compulsion}</p></div></div></article><article className="border border-white/10 bg-[#171a18] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]">Disciplinas de clã</p><div className="mt-4 grid gap-3">{clan.disciplines.map((discipline) => { const data = V5_DISCIPLINES[discipline]; return <article key={discipline} className="border border-white/10 bg-black/10 p-4"><p className="font-serif text-2xl text-[#f4eee4]">{discipline}</p><p className="mt-2 text-sm leading-6 text-[#b8b3a8]">{data?.description || "Afinidade de sangue registrada no dossiê."}</p>{data ? <p className="mt-4 text-xs leading-5 text-[#a9c7bb]">Poderes iniciais: {data.powers.map((power) => `N${power.level} · ${power.name}`).join(" · ")}</p> : null}</article>; })}</div></article></section></DetailShell>;
  }

  if (category === "credos") {
    const creed = HUNTER_CREEDS.find((entry) => entry.id === id);
    if (!creed) return <NotFoundDetail />;
    return <DetailShell eyebrow="Caçador · dossiê de credo" title={creed.name} source={REFERENCE_SOURCES.hunter.label}><section className="mt-7 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"><article className="border border-[#b55b32]/45 bg-[#171a18] p-5"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]"><Crosshair className="h-4 w-4 text-[#d27648]" /> Perspectiva de Caça</div><p className="mt-4 text-sm leading-7 text-[#eae3d5]">{creed.focus}</p><div className="mt-6 border-t border-white/10 pt-4"><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#a9c7bb]">Métodos recorrentes</p><ul className="mt-3 space-y-2 text-sm leading-6 text-[#c7c1b5]">{creed.methods.map((method) => <li key={method}>— {method}</li>)}</ul></div></article><article className="border border-white/10 bg-[#171a18] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]">Arquétipos de referência</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{creed.archetypes.map((archetype, index) => <div key={archetype} className="border border-white/10 bg-black/10 p-4"><span className="font-serif text-lg text-[#d27648]">{String(index + 1).padStart(2, "0")}</span><p className="mt-5 font-serif text-2xl leading-none text-[#f4eee4]">{archetype}</p></div>)}</div></article></section></DetailShell>;
  }

  const lineage = ONE_RING_LINEAGES.find((entry) => entry.id === id);
  if (!lineage) return <NotFoundDetail />;
  return <DetailShell eyebrow="O Um Anel · dossiê de linhagem" title={lineage.name} source={REFERENCE_SOURCES.oneRing.label}><section className="mt-7 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"><article className="border border-[#b55b32]/45 bg-[#171a18] p-5"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]"><Sparkles className="h-4 w-4 text-[#d27648]" /> Origem e visão de mundo</div><p className="mt-4 text-[9px] font-bold uppercase tracking-[0.13em] text-[#a9c7bb]">Terra natal</p><p className="mt-2 text-sm leading-6 text-[#eae3d5]">{lineage.homeland}</p><p className="mt-5 border-t border-white/10 pt-4 text-sm leading-7 text-[#c7c1b5]">{lineage.outlook}</p></article><article className="border border-white/10 bg-[#171a18] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]">Bênção cultural</p><div className="mt-4 border border-[#b55b32]/45 bg-[#b55b32]/5 p-6"><p className="font-serif text-4xl text-[#f4eee4]">{lineage.culturalBlessing}</p><p className="mt-4 text-sm leading-6 text-[#b8b3a8]">Este registro resume a bênção associada à cultura heroica. Consulte o material de origem para os efeitos mecânicos completos e para a criação de personagem.</p></div></article></section></DetailShell>;
}

export default function ReferenceDetail() {
  const params = useParams<{ category: ReferenceCategory; id: string }>();
  return <DashboardLayout><ReferenceDetailContent category={params.category} id={params.id} /></DashboardLayout>;
}
