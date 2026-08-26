import React, { useState } from "react";
import { BookmarkPlus, Download, LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type SystemId = "vampiro-v5" | "o-um-anel" | "cacador-a-vinganca";
const downloadArchetype = (data: Record<string, unknown>, title: string) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ format: "rpg-atlas-archetype-v1", ...data }, null, 2)], { type: "application/json" }));
  const link = document.createElement("a"); link.href = url; link.download = `arquetipo-${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.json`; link.click(); URL.revokeObjectURL(url);
};

export function CustomArchetypePanel({ systemId, snapshot, onApply }: { systemId: SystemId; snapshot: Record<string, unknown>; onApply: (payload: Record<string, unknown>, title: string) => void }) {
  const utils = trpc.useUtils();
  const { data: archetypes = [], isLoading, error, refetch } = trpc.archetypes.mine.useQuery({ systemId });
  const [title, setTitle] = useState(""); const [summary, setSummary] = useState("");
  const create = trpc.archetypes.create.useMutation({ onSuccess: async () => { await utils.archetypes.mine.invalidate({ systemId }); setTitle(""); setSummary(""); toast.success("Arquétipo salvo no seu arquivo."); }, onError: (e) => toast.error(e.message) });
  const remove = trpc.archetypes.remove.useMutation({ onSuccess: async () => { await utils.archetypes.mine.invalidate({ systemId }); toast.success("Arquétipo excluído."); }, onError: (e) => toast.error(e.message) });
  const save = () => title.trim().length < 2 ? toast.error("Dê um nome ao arquétipo antes de salvá-lo.") : create.mutate({ systemId, title: title.trim(), summary: summary.trim() || undefined, payload: snapshot });
  return <article className="border border-[#83a89a]/35 bg-[#171a18] p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="text-[9px] font-bold uppercase tracking-[.15em] text-[#a9c7bb]">Arquétipos próprios</p><h3 className="mt-1 font-serif text-2xl text-[#f4eee4]">Guarde e compartilhe combinações.</h3></div><p className="max-w-sm text-xs text-[#b8b3a8]">Cada sistema mantém o próprio acervo.</p></div><div className="mt-4 grid gap-3 md:grid-cols-[1fr_1.4fr_auto]"><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Investigadora do Elysium" className="h-10 border border-white/15 bg-[#101211] px-3"/><input value={summary} onChange={e => setSummary(e.target.value)} placeholder="Uma nota curta sobre o estilo" className="h-10 border border-white/15 bg-[#101211] px-3"/><Button onClick={save} disabled={create.isPending}>{create.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : <BookmarkPlus className="mr-2 h-4 w-4"/>}Salvar</Button></div><div className="mt-4 grid gap-2">{isLoading ? <p>Consultando arquétipos…</p> : error ? <Button onClick={() => refetch()} variant="outline">Tentar novamente</Button> : archetypes.length ? archetypes.map(a => <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 border border-white/10 p-3"><div><b>{a.title}</b><p className="text-xs text-[#b8b3a8]">{a.summary}</p></div><div className="flex gap-2"><Button onClick={() => onApply(a.payload, a.title)} variant="outline" size="sm">Aplicar</Button><Button onClick={() => { downloadArchetype({ systemId: a.systemId, title: a.title, summary: a.summary, payload: a.payload }, a.title); toast.success("Arquétipo exportado em JSON."); }} variant="outline" size="sm"><Download className="mr-1 h-4 w-4"/>JSON</Button><Button onClick={() => remove.mutate({ archetypeId: a.id })} variant="outline" size="icon" aria-label={`Excluir ${a.title}`}><Trash2 className="h-4 w-4"/></Button></div></div>) : <p className="text-xs text-[#b8b3a8]">Nenhum arquétipo próprio salvo ainda.</p>}</div></article>;
}
