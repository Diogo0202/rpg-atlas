import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { createLocalSheetId, saveLocalSheet } from "@/lib/localSheetVault";
import { createCharacterJsonEnvelope, downloadJsonFile, parseCharacterSharePayload, slugifyFilename } from "@/lib/sheetJson";
import { Download, FileWarning, Import, Share2, X } from "lucide-react";
import React, { useMemo, useState } from "react";

const vaultKeyBySystem = {
  "vampiro-v5": "rpg-atlas-local-vampiro-v5-v1",
  "cacador-a-vinganca": "rpg-atlas-local-hunter-v1",
  "o-um-anel": "rpg-atlas-local-o-um-anel-v1",
} as const;

type SharedPreviewProps = { onClose: () => void; onImport: () => void; parsed: NonNullable<ReturnType<typeof parseCharacterSharePayload>> };

function SharedPreviewModal({ onClose, onImport, parsed }: SharedPreviewProps) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="presentation">
    <div role="dialog" aria-modal="true" aria-labelledby="shared-preview-title" className="w-full max-w-lg border border-[#d27648]/60 bg-[#171a18] p-6 shadow-2xl shadow-black/50 sm:p-8">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#83a89a]"><Share2 className="h-4 w-4 text-[#d27648]" /> Pré-visualização</p><h2 id="shared-preview-title" className="mt-3 font-serif text-4xl text-[#f4eee4]">Antes de importar</h2></div><button type="button" aria-label="Fechar pré-visualização" onClick={onClose} className="text-[#a9c7bb] transition-colors hover:text-[#f4eee4]"><X className="h-5 w-5" /></button></div>
      <p className="mt-5 text-sm leading-6 text-[#b8b3a8]">Confira os dados básicos da ficha. A importação criará uma nova cópia no Cofre Local e não substituirá registros existentes.</p>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2"><div className="border border-white/10 bg-black/10 p-4"><dt className="text-[9px] font-bold uppercase tracking-[.12em] text-[#8f958c]">Personagem</dt><dd className="mt-2 font-serif text-2xl text-[#f4eee4]">{parsed.name}</dd></div><div className="border border-white/10 bg-black/10 p-4"><dt className="text-[9px] font-bold uppercase tracking-[.12em] text-[#8f958c]">Sistema</dt><dd className="mt-2 text-sm text-[#f4eee4]">{parsed.systemId}</dd></div><div className="border border-white/10 bg-black/10 p-4"><dt className="text-[9px] font-bold uppercase tracking-[.12em] text-[#8f958c]">Conceito</dt><dd className="mt-2 text-sm text-[#f4eee4]">{parsed.concept || "Não informado"}</dd></div><div className="border border-white/10 bg-black/10 p-4"><dt className="text-[9px] font-bold uppercase tracking-[.12em] text-[#8f958c]">Nível</dt><dd className="mt-2 text-sm text-[#f4eee4]">{parsed.level ? `Nível ${parsed.level}` : "Não definido"}</dd></div></dl>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={onClose} className="h-10 rounded-none border-white/20 text-[10px] font-bold uppercase tracking-[.12em] text-[#eae3d5]">Continuar sem importar</Button><Button type="button" onClick={onImport} className="h-10 rounded-none bg-[#b55b32] text-[10px] font-bold uppercase tracking-[.12em] text-[#161715]"><Import className="mr-2 h-4 w-4" /> Importar cópia local</Button></div>
    </div>
  </div>;
}

export default function SharedJsonCharacterSheet() {
  const encoded = useMemo(() => new URLSearchParams(typeof window === "undefined" ? "" : window.location.search).get("payload") || "", []);
  const parsed = useMemo(() => parseCharacterSharePayload(encoded), [encoded]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(Boolean(parsed));
  const [notice, setNotice] = useState("");
  const exportFile = () => { if (!parsed) return; downloadJsonFile(createCharacterJsonEnvelope(parsed), `${slugifyFilename(parsed.name)}-compartilhada.json`); };
  const importCopy = () => {
    if (!parsed) return;
    const storageKey = vaultKeyBySystem[parsed.systemId];
    const timestamp = new Date().toISOString();
    saveLocalSheet(storageKey, { id: createLocalSheetId(storageKey), name: parsed.name, createdAt: parsed.createdAt || timestamp, updatedAt: timestamp, level: parsed.level, tags: parsed.tags, sheet: { name: parsed.name, concept: parsed.concept, campaignId: parsed.campaignId, sheet: parsed.sheet } });
    setIsPreviewOpen(false);
    setNotice(`A cópia de “${parsed.name}” foi importada no Cofre Local sem substituir fichas existentes.`);
  };

  return <DashboardLayout><main className="min-h-screen bg-[#101211] px-5 py-10 text-[#eae3d5] sm:px-8"><div className="mx-auto max-w-3xl">{parsed ? <article className="border border-[#83a89a]/45 bg-[#171a18] p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#83a89a]"><Share2 className="h-4 w-4 text-[#d27648]" /> Ficha compartilhada · leitura</p><h1 className="mt-3 font-serif text-5xl text-[#f4eee4]">{parsed.name}</h1><p className="mt-2 text-sm text-[#b8b3a8]">{parsed.concept || "Conceito não informado"} · {parsed.systemId}</p></div><div className="flex flex-wrap gap-2"><Button type="button" onClick={() => setIsPreviewOpen(true)} className="h-10 rounded-none bg-[#b55b32] text-[10px] font-bold uppercase tracking-[.12em] text-[#161715]"><Import className="mr-2 h-4 w-4" /> Pré-visualizar e importar</Button><Button type="button" onClick={exportFile} variant="outline" className="h-10 rounded-none border-[#83a89a]/45 text-[10px] font-bold uppercase tracking-[.12em] text-[#eae3d5]"><Download className="mr-2 h-4 w-4" /> Baixar JSON</Button></div></div><dl className="mt-6 grid gap-3 sm:grid-cols-3"><div className="border border-white/10 bg-black/10 p-4"><dt className="text-[9px] font-bold uppercase tracking-[.12em] text-[#8f958c]">Sistema</dt><dd className="mt-2 text-sm text-[#f4eee4]">{parsed.systemId}</dd></div><div className="border border-white/10 bg-black/10 p-4"><dt className="text-[9px] font-bold uppercase tracking-[.12em] text-[#8f958c]">Nível</dt><dd className="mt-2 text-sm text-[#f4eee4]">{parsed.level ? `Nível ${parsed.level}` : "Não definido"}</dd></div><div className="border border-white/10 bg-black/10 p-4"><dt className="text-[9px] font-bold uppercase tracking-[.12em] text-[#8f958c]">Tags</dt><dd className="mt-2 flex flex-wrap gap-1 text-sm text-[#a9c7bb]">{parsed.tags?.length ? parsed.tags.map((tag) => <span key={tag}>#{tag}</span>) : "Nenhuma"}</dd></div></dl>{notice ? <div role="status" className="mt-6 border border-[#83a89a]/45 bg-[#83a89a]/10 p-4 text-sm leading-6 text-[#d8efe2]">{notice}</div> : <p className="mt-6 border-l-2 border-[#b55b32] pl-3 text-xs leading-5 text-[#b8b3a8]">Este link contém uma cópia codificada da ficha. Revise os dados antes de importar para o seu Cofre Local.</p>}</article> : <article className="border border-[#b55b32]/60 bg-[#171a18] p-8 text-center"><FileWarning className="mx-auto h-10 w-10 text-[#d27648]" /><h1 className="mt-4 font-serif text-4xl text-[#f4eee4]">Link de ficha inválido</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#b8b3a8]">O payload está ausente, corrompido ou excede o tamanho permitido. Peça ao remetente um novo link ou use o arquivo JSON exportado.</p></article>}{parsed && isPreviewOpen ? <SharedPreviewModal parsed={parsed} onClose={() => setIsPreviewOpen(false)} onImport={importCopy} /> : null}</div></main></DashboardLayout>;
}
