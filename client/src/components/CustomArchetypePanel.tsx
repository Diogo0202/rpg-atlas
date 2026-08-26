import React, { useRef, useState } from "react";
import { BookmarkPlus, Download, LoaderCircle, Pencil, RefreshCw, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { parseArchetypeImport, type ArchetypeSystemId } from "@shared/archetype-import";
import { toast } from "sonner";

type SystemId = ArchetypeSystemId;
const downloadArchetype = (data: Record<string, unknown>, title: string) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ format: "rpg-atlas-archetype-v1", ...data }, null, 2)], { type: "application/json" }));
  const link = document.createElement("a"); link.href = url; link.download = `arquetipo-${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.json`; link.click(); URL.revokeObjectURL(url);
};

export function CustomArchetypePanel({ systemId, snapshot, onApply }: { systemId: SystemId; snapshot: Record<string, unknown>; onApply: (payload: Record<string, unknown>, title: string) => void }) {
  const utils = trpc.useUtils();
  const { data: archetypes = [], isLoading, error, refetch } = trpc.archetypes.mine.useQuery({ systemId });
  const [title, setTitle] = useState(""); const [summary, setSummary] = useState(""); const [editing, setEditing] = useState<{ id: number; payload: Record<string, unknown> } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const resetForm = () => { setTitle(""); setSummary(""); setEditing(null); };
  const create = trpc.archetypes.create.useMutation({ onSuccess: async () => { await utils.archetypes.mine.invalidate({ systemId }); resetForm(); toast.success("Arquétipo salvo no seu arquivo."); }, onError: (e) => toast.error(e.message) });
  const update = trpc.archetypes.update.useMutation({ onSuccess: async () => { await utils.archetypes.mine.invalidate({ systemId }); resetForm(); toast.success("Arquétipo atualizado no seu arquivo."); }, onError: (e) => toast.error(e.message) });
  const refreshSnapshot = trpc.archetypes.update.useMutation({ onSuccess: async () => { await utils.archetypes.mine.invalidate({ systemId }); setEditing((current) => current ? { ...current, payload: snapshot } : current); toast.success("Retrato atualizado com os valores atuais da ficha."); }, onError: (e) => toast.error(e.message) });
  const remove = trpc.archetypes.remove.useMutation({ onSuccess: async () => { await utils.archetypes.mine.invalidate({ systemId }); toast.success("Arquétipo excluído."); }, onError: (e) => toast.error(e.message) });
  const save = () => {
    if (title.trim().length < 2) return toast.error("Dê um nome ao arquétipo antes de salvá-lo.");
    if (editing) return update.mutate({ archetypeId: editing.id, title: title.trim(), summary: summary.trim() || undefined, payload: editing.payload });
    create.mutate({ systemId, title: title.trim(), summary: summary.trim() || undefined, payload: snapshot });
  };
  const importArchetype = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 300_000) return toast.error("O arquivo ultrapassa o limite de 300 KB para arquétipos.");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = parseArchetypeImport(JSON.parse(String(reader.result ?? "{}")), systemId);
        if (!imported) throw new Error("invalid");
        create.mutate({ systemId, ...imported });
      } catch {
        toast.error("Arquivo inválido ou incompatível com este sistema de ficha.");
      }
    };
    reader.onerror = () => toast.error("Não foi possível ler o arquivo selecionado.");
    reader.readAsText(file);
  };
  const isSaving = create.isPending || update.isPending || refreshSnapshot.isPending;
  return <article className="border border-[#83a89a]/35 bg-[#171a18] p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="text-[9px] font-bold uppercase tracking-[.15em] text-[#a9c7bb]">Arquétipos próprios</p><h3 className="mt-1 font-serif text-2xl text-[#f4eee4]">Guarde e compartilhe combinações.</h3></div><div className="flex items-start gap-2"><p className="max-w-sm text-xs text-[#b8b3a8]">Cada sistema mantém o próprio acervo.</p><Button type="button" variant="outline" size="sm" onClick={() => importInputRef.current?.click()}><Upload className="mr-1 h-4 w-4"/>Importar JSON</Button><input ref={importInputRef} aria-label="Importar arquétipo JSON" type="file" accept="application/json,.json" className="sr-only" onChange={importArchetype} /></div></div><div className="mt-4 grid gap-3 md:grid-cols-[1fr_1.4fr_auto]"><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Investigadora do Elysium" className="h-10 border border-white/15 bg-[#101211] px-3"/><input value={summary} onChange={e => setSummary(e.target.value)} placeholder="Uma nota curta sobre o estilo" className="h-10 border border-white/15 bg-[#101211] px-3"/><div className="flex gap-2"><Button onClick={save} disabled={isSaving} className="flex-1">{isSaving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : editing ? <Pencil className="mr-2 h-4 w-4"/> : <BookmarkPlus className="mr-2 h-4 w-4"/>}{editing ? "Atualizar" : "Salvar"}</Button>{editing ? <Button onClick={resetForm} variant="outline">Cancelar</Button> : null}</div></div>{editing ? <div className="mt-2 flex flex-wrap items-center gap-2"><p className="text-xs text-[#a9c7bb]">Editando texto do arquétipo; sua configuração preservada será mantida.</p><Button type="button" size="sm" variant="outline" disabled={isSaving} onClick={() => refreshSnapshot.mutate({ archetypeId: editing.id, title: title.trim(), summary: summary.trim() || undefined, payload: snapshot })}><RefreshCw className="mr-1 h-3.5 w-3.5"/>Atualizar retrato</Button></div> : null}<div className="mt-4 grid gap-2">{isLoading ? <p>Consultando arquétipos…</p> : error ? <Button onClick={() => refetch()} variant="outline">Tentar novamente</Button> : archetypes.length ? archetypes.map(a => <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 border border-white/10 p-3"><div><b>{a.title}</b><p className="text-xs text-[#b8b3a8]">{a.summary}</p></div><div className="flex gap-2"><Button onClick={() => onApply(a.payload, a.title)} variant="outline" size="sm">Aplicar</Button><Button onClick={() => { setTitle(a.title); setSummary(a.summary || ""); setEditing({ id: a.id, payload: a.payload }); }} variant="outline" size="sm">Editar</Button><Button onClick={() => { downloadArchetype({ systemId: a.systemId, title: a.title, summary: a.summary, payload: a.payload }, a.title); toast.success("Arquétipo exportado em JSON."); }} variant="outline" size="sm"><Download className="mr-1 h-4 w-4"/>JSON</Button><Button onClick={() => remove.mutate({ archetypeId: a.id })} variant="outline" size="icon" aria-label={`Excluir ${a.title}`}><Trash2 className="h-4 w-4"/></Button></div></div>) : <p className="text-xs text-[#b8b3a8]">Nenhum arquétipo próprio salvo ainda.</p>}</div></article>;
}
