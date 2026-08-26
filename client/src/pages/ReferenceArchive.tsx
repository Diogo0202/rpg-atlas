import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HUNTER_CREEDS, ONE_RING_LINEAGES, REFERENCE_SOURCES, V5_REFERENCE_CLANS } from "@shared/reference-archive";
import { BookMarked, Crosshair, Search, Sparkles, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link } from "wouter";

function includesQuery(values: string[], query: string) {
  return !query || values.join(" ").toLocaleLowerCase("pt-BR").includes(query);
}

export function ReferenceArchiveContent() {
  const [queryInput, setQueryInput] = useState("");
  const query = queryInput.trim().toLocaleLowerCase("pt-BR");
  const clans = useMemo(() => V5_REFERENCE_CLANS.filter((clan) => includesQuery([clan.name, ...clan.disciplines, clan.bane, clan.compulsion], query)), [query]);
  const creeds = useMemo(() => HUNTER_CREEDS.filter((creed) => includesQuery([creed.name, creed.focus, ...creed.methods, ...creed.archetypes], query)), [query]);
  const lineages = useMemo(() => ONE_RING_LINEAGES.filter((lineage) => includesQuery([lineage.name, lineage.homeland, lineage.outlook, lineage.culturalBlessing], query)), [query]);

  return (
    <div className="min-h-screen bg-[#101211] text-[#eae3d5]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="border-b border-white/10 pb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#83a89a]">Acervo de referência · consulta 09</p>
          <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="font-serif text-5xl leading-none tracking-[-0.04em] text-[#f4eee4]">Nomes, credos<br />e linhagens.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#b8b3a8]">Um índice de mesa para escolhas de personagem. O conteúdo organiza referências dos materiais preservados sem substituir os livros de origem.</p>
            </div>
            <div className="grid grid-cols-3 border border-white/10 bg-[#171a18] text-center"><div className="border-r border-white/10 px-4 py-3"><strong className="font-serif text-3xl text-[#d27648]">12</strong><p className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#a9c7bb]">Clãs</p></div><div className="border-r border-white/10 px-4 py-3"><strong className="font-serif text-3xl text-[#d27648]">5</strong><p className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#a9c7bb]">Credos</p></div><div className="px-4 py-3"><strong className="font-serif text-3xl text-[#d27648]">6</strong><p className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#a9c7bb]">Linhagens</p></div></div>
          </div>
        </header>

        <section className="mt-7 border border-[#83a89a]/45 bg-[#171a18] p-5"><div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]"><span className="flex items-center gap-2"><Search className="h-4 w-4 text-[#d27648]" /> Índice de consulta</span>{query ? <button type="button" onClick={() => setQueryInput("")} className="flex items-center gap-1 text-[#d27648] hover:text-[#ffb08e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b55b32]"><X className="h-3.5 w-3.5" /> limpar</button> : <span>filtros por afinidade e origem</span>}</div><label htmlFor="archive-query" className="sr-only">Pesquisar o acervo</label><input id="archive-query" value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="Ex.: sombras, justiça, Bri, infiltração…" className="mt-4 h-11 w-full border border-white/15 bg-[#101211] px-3 text-sm text-[#eae3d5] outline-none placeholder:text-[#777b73] focus:border-[#b55b32]" /></section>

        <Tabs defaultValue="vampiro" className="mt-7"><TabsList aria-label="Categorias do acervo" className="h-auto w-full rounded-none border border-white/10 bg-[#171a18] p-1 sm:w-auto"><TabsTrigger value="vampiro" className="rounded-none px-4 text-[10px] font-bold uppercase tracking-[0.12em]">Vampiro V5</TabsTrigger><TabsTrigger value="cacador" className="rounded-none px-4 text-[10px] font-bold uppercase tracking-[0.12em]">Caçador</TabsTrigger><TabsTrigger value="um-anel" className="rounded-none px-4 text-[10px] font-bold uppercase tracking-[0.12em]">O Um Anel</TabsTrigger></TabsList>

          <TabsContent value="vampiro" className="mt-5"><section className="border border-[#b55b32]/45 bg-[#171a18] p-5"><div className="flex flex-col justify-between gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]">Doze clãs em custódia</p><h2 className="mt-2 font-serif text-3xl text-[#f4eee4]">Vampiro: A Máscara V5</h2></div><p className="text-xs text-[#b8b3a8]">{clans.length} registro(s) localizado(s)</p></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{clans.map((clan, index) => <article key={clan.id} className="border border-white/10 bg-black/10 p-4"><div className="flex items-start justify-between gap-4"><p className="font-serif text-3xl leading-none text-[#f4eee4]">{clan.name}</p><span className="font-serif text-xl text-[#d27648]">{String(index + 1).padStart(2, "0")}</span></div><p className="mt-4 text-[9px] font-bold uppercase tracking-[0.13em] text-[#a9c7bb]">Disciplinas iniciais</p><p className="mt-2 text-sm leading-6 text-[#eae3d5]">{clan.disciplines.join(" · ")}</p><div className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-[#b8b3a8]"><p><strong className="font-semibold text-[#d27648]">Perdição:</strong> {clan.bane}</p><p className="mt-2"><strong className="font-semibold text-[#a9c7bb]">Compulsão:</strong> {clan.compulsion}</p></div><Link href={`/acervo/clas/${clan.id}`} className="mt-5 inline-flex text-[9px] font-bold uppercase tracking-[0.12em] text-[#d27648] hover:text-[#ffb08e]">Abrir dossiê →</Link></article>)}</div>{!clans.length ? <p className="mt-5 border border-dashed border-white/20 p-5 text-sm text-[#b8b3a8]">Nenhum clã responde a esta busca.</p> : null}</section></TabsContent>

          <TabsContent value="cacador" className="mt-5"><section className="border border-[#b55b32]/45 bg-[#171a18] p-5"><div className="flex flex-col justify-between gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]">Cinco credos de Caçador</p><h2 className="mt-2 font-serif text-3xl text-[#f4eee4]">Uma Revanche Iminente</h2></div><p className="text-xs text-[#b8b3a8]">Fonte: {REFERENCE_SOURCES.hunter.label}</p></div><div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{creeds.map((creed) => <article key={creed.id} className="border border-white/10 bg-black/10 p-4"><div className="flex items-center justify-between gap-3"><p className="font-serif text-3xl text-[#f4eee4]">{creed.name}</p><Crosshair className="h-5 w-5 text-[#d27648]" /></div><p className="mt-3 text-sm leading-6 text-[#b8b3a8]">{creed.focus}</p><p className="mt-4 text-[9px] font-bold uppercase tracking-[0.13em] text-[#a9c7bb]">Métodos</p><p className="mt-2 text-xs leading-5 text-[#eae3d5]">{creed.methods.join(" · ")}</p><p className="mt-4 text-[9px] font-bold uppercase tracking-[0.13em] text-[#a9c7bb]">Arquétipos de referência</p><p className="mt-2 text-xs leading-5 text-[#b8b3a8]">{creed.archetypes.join(" · ")}</p><Link href={`/acervo/credos/${creed.id}`} className="mt-5 inline-flex text-[9px] font-bold uppercase tracking-[0.12em] text-[#d27648] hover:text-[#ffb08e]">Abrir dossiê →</Link></article>)}</div>{!creeds.length ? <p className="mt-5 border border-dashed border-white/20 p-5 text-sm text-[#b8b3a8]">Nenhum credo responde a esta busca.</p> : null}</section></TabsContent>

          <TabsContent value="um-anel" className="mt-5"><section className="border border-[#b55b32]/45 bg-[#171a18] p-5"><div className="flex flex-col justify-between gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]">Seis culturas heroicas</p><h2 className="mt-2 font-serif text-3xl text-[#f4eee4]">Linhagens de O Um Anel</h2></div><p className="text-xs text-[#b8b3a8]">{REFERENCE_SOURCES.oneRing.label}</p></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{lineages.map((lineage) => <article key={lineage.id} className="border border-white/10 bg-black/10 p-4"><div className="flex items-center justify-between gap-3"><p className="font-serif text-3xl leading-none text-[#f4eee4]">{lineage.name}</p><Sparkles className="h-5 w-5 shrink-0 text-[#d27648]" /></div><p className="mt-4 text-[9px] font-bold uppercase tracking-[0.13em] text-[#a9c7bb]">Origem</p><p className="mt-2 text-sm leading-6 text-[#eae3d5]">{lineage.homeland}</p><p className="mt-4 text-xs leading-5 text-[#b8b3a8]">{lineage.outlook}</p><div className="mt-4 border-t border-white/10 pt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#a9c7bb]">Bênção cultural · <span className="text-[#d27648]">{lineage.culturalBlessing}</span></div><Link href={`/acervo/linhagens/${lineage.id}`} className="mt-5 inline-flex text-[9px] font-bold uppercase tracking-[0.12em] text-[#d27648] hover:text-[#ffb08e]">Abrir dossiê →</Link></article>)}</div>{!lineages.length ? <p className="mt-5 border border-dashed border-white/20 p-5 text-sm text-[#b8b3a8]">Nenhuma linhagem responde a esta busca.</p> : null}</section></TabsContent>
        </Tabs>

        <footer className="mt-7 flex items-start gap-3 border-t border-white/10 pt-5 text-xs leading-5 text-[#8e938a]"><BookMarked className="mt-0.5 h-4 w-4 shrink-0 text-[#d27648]" /><p><strong className="font-semibold text-[#c7c1b5]">Proveniência:</strong> {REFERENCE_SOURCES.vampire.detail} {REFERENCE_SOURCES.hunter.detail} {REFERENCE_SOURCES.oneRing.detail}</p></footer>
      </div>
    </div>
  );
}

export default function ReferenceArchive() {
  return <DashboardLayout><ReferenceArchiveContent /></DashboardLayout>;
}
