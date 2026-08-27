import { Button } from "@/components/ui/button";
import { loadLocalSheet, listLocalSheets, removeLocalSheet, saveLocalSheet, type LocalSheetRecord } from "@/lib/localSheetVault";
import { FolderOpen, Save, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

type SheetPayload = { name: string; concept?: string; campaignId?: string; sheet: unknown };

type LocalSheetVaultPanelProps = {
  storageKey: string;
  systemLabel: string;
  name: string;
  concept?: string;
  campaignId?: string;
  sheet: unknown;
  onLoad: (payload: SheetPayload) => void;
};

export function LocalSheetVaultPanel({ storageKey, systemLabel, name, concept, campaignId, sheet, onLoad }: LocalSheetVaultPanelProps) {
  const [records, setRecords] = useState<LocalSheetRecord<SheetPayload>[]>(() => listLocalSheets<SheetPayload>(storageKey));
  const save = () => {
    if (name.trim().length < 2) return toast.error("Informe um nome antes de salvar localmente.");
    const record = { id: `${storageKey}-${name.trim().toLocaleLowerCase("pt-BR")}`, name: name.trim(), updatedAt: new Date().toISOString(), sheet: { name: name.trim(), concept, campaignId, sheet } };
    try { setRecords(saveLocalSheet(storageKey, record)); toast.success(`Ficha de ${systemLabel} salva neste navegador.`); } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível salvar localmente."); }
  };
  const load = (id: string) => { const record = loadLocalSheet<SheetPayload>(storageKey, id); if (!record) return; onLoad(record.sheet); toast.success(`Ficha ${record.name} carregada do navegador.`); };
  const remove = (id: string) => { setRecords(listLocalSheets<SheetPayload>(storageKey).filter((record) => record.id !== id)); removeLocalSheet(storageKey, id); };

  return <section className="border border-[#83a89a]/35 bg-[#171a18] p-4" aria-label={`Cofre local de fichas de ${systemLabel}`}><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#a9c7bb]"><FolderOpen className="h-4 w-4 text-[#d27648]" /> Cofre local · {systemLabel}</p><p className="mt-1 text-xs text-[#8f958c]">Salva uma cópia neste navegador, sem substituir o arquivo da campanha.</p></div><Button type="button" onClick={save} className="h-10 rounded-none bg-[#b55b32] text-[10px] font-bold uppercase tracking-[.13em] text-[#161715] hover:bg-[#d27648]"><Save className="mr-2 h-4 w-4" /> Salvar localmente</Button></div>{records.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{records.map((record) => <div key={record.id} className="flex items-center justify-between gap-3 border border-white/10 bg-black/10 p-3"><button type="button" onClick={() => load(record.id)} className="min-w-0 text-left text-[#f4eee4] hover:text-[#ffb08e]"><span className="block truncate font-serif text-lg">{record.name}</span><span className="block text-[9px] uppercase tracking-[.1em] text-[#8f958c]">Atualizada em {new Date(record.updatedAt).toLocaleDateString("pt-BR")}</span></button><button type="button" aria-label={`Excluir ${record.name} do cofre local`} onClick={() => remove(record.id)} className="text-[#a9c7bb] hover:text-[#ffb08e]"><Trash2 className="h-4 w-4" /></button></div>)}</div> : <p className="mt-4 text-xs text-[#8f958c]">Nenhuma ficha local salva ainda.</p>}</section>;
}
