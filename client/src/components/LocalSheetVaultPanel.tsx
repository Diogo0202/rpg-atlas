import { Button } from "@/components/ui/button";
import { createLocalSheetId, loadLocalSheet, listLocalSheets, removeLocalSheet, saveLocalSheet, type LocalSheetRecord } from "@/lib/localSheetVault";
import { createCharacterJsonEnvelope, createVaultBackup, downloadJsonFile, inferRpgSystemId, parseVaultBackup, slugifyFilename } from "@/lib/sheetJson";
import { Download, FolderOpen, Save, Trash2, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

export type SheetPayload = { name: string; concept?: string; campaignId?: string; sheet: unknown };

type LocalSheetVaultPanelProps = {
  storageKey: string;
  systemLabel: string;
  name: string;
  concept?: string;
  campaignId?: string;
  sheet: unknown;
  onLoad: (payload: SheetPayload) => void;
};

function recordToJson(record: LocalSheetRecord<SheetPayload>, systemId: ReturnType<typeof inferRpgSystemId>) {
  return {
    ...createCharacterJsonEnvelope({
      systemId,
      name: record.name,
      concept: record.sheet.concept,
      campaignId: record.sheet.campaignId,
      createdAt: record.createdAt,
      sheet: record.sheet.sheet,
    }),
    exportedAt: record.updatedAt,
  };
}

export function LocalSheetVaultPanel({ storageKey, systemLabel, name, concept, campaignId, sheet, onLoad }: LocalSheetVaultPanelProps) {
  const [records, setRecords] = useState<LocalSheetRecord<SheetPayload>[]>(() => listLocalSheets<SheetPayload>(storageKey));
  const importInputRef = useRef<HTMLInputElement>(null);
  const systemId = inferRpgSystemId(storageKey);

  const save = () => {
    if (name.trim().length < 2) return toast.error("Informe um nome antes de salvar localmente.");
    const now = new Date().toISOString();
    const record = { id: `${storageKey}-${name.trim().toLocaleLowerCase("pt-BR")}`, name: name.trim(), createdAt: now, updatedAt: now, sheet: { name: name.trim(), concept, campaignId, sheet } };
    try { setRecords(saveLocalSheet(storageKey, record)); toast.success(`Ficha de ${systemLabel} salva neste navegador.`); } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível salvar localmente."); }
  };

  const load = (id: string) => {
    const record = loadLocalSheet<SheetPayload>(storageKey, id);
    if (!record) return;
    onLoad(record.sheet);
    toast.success(`Ficha ${record.name} carregada do navegador.`);
  };

  const remove = (id: string) => {
    setRecords(listLocalSheets<SheetPayload>(storageKey).filter((record) => record.id !== id));
    removeLocalSheet(storageKey, id);
  };

  const exportRecord = (record: LocalSheetRecord<SheetPayload>) => {
    downloadJsonFile(recordToJson(record, systemId), `${slugifyFilename(record.name)}-${slugifyFilename(systemLabel)}.json`);
    toast.success(`Ficha ${record.name} exportada em JSON.`);
  };

  const exportCurrent = () => {
    if (name.trim().length < 2) return toast.error("Informe um nome antes de exportar a ficha.");
    const now = new Date().toISOString();
    const record: LocalSheetRecord<SheetPayload> = { id: "current", name: name.trim(), createdAt: now, updatedAt: now, sheet: { name: name.trim(), concept, campaignId, sheet } };
    exportRecord(record);
  };

  const exportBackup = () => {
    const payload = createVaultBackup(records.map((record) => ({
      ...recordToJson(record, systemId).character,
      systemId,
      updatedAt: record.updatedAt,
    })));
    downloadJsonFile(payload, `backup-cofre-${slugifyFilename(systemLabel)}.json`);
    toast.success(`Backup de ${records.length} ficha(s) exportado.`);
  };

  const importJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5_000_000) return toast.error("Use um JSON de até 5 MB.");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseVaultBackup(JSON.parse(String(reader.result ?? "{}")));
        if (!parsed?.length) throw new Error("invalid");
        const compatible = parsed.filter((entry) => entry.systemId === systemId);
        if (compatible.length !== parsed.length || !compatible.length) throw new Error("system");
        let next = listLocalSheets<SheetPayload>(storageKey);
        compatible.forEach((entry, index) => {
          const importedAt = entry.updatedAt || new Date(Date.now() + index).toISOString();
          next = saveLocalSheet(storageKey, { id: createLocalSheetId(storageKey), name: entry.name, createdAt: entry.createdAt || importedAt, updatedAt: importedAt, sheet: { name: entry.name, concept: entry.concept, campaignId: entry.campaignId, sheet: entry.sheet } });
        });
        setRecords(next);
        toast.success(`${compatible.length} ficha(s) importada(s) para o Cofre Local.`);
      } catch (error) {
        toast.error(error instanceof Error && error.message === "system" ? "Este arquivo pertence a outro sistema." : "O JSON não foi reconhecido como ficha ou backup compatível.");
      }
    };
    reader.onerror = () => toast.error("Não foi possível ler o arquivo selecionado.");
    reader.readAsText(file);
  };

  return <section className="border border-[#83a89a]/35 bg-[#171a18] p-4" aria-label={`Cofre local de fichas de ${systemLabel}`}><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#a9c7bb]"><FolderOpen className="h-4 w-4 text-[#d27648]" /> Cofre local · {systemLabel}</p><p className="mt-1 text-xs text-[#8f958c]">Salva uma cópia neste navegador, sem substituir o arquivo da campanha.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => importInputRef.current?.click()} className="h-10 rounded-none border-[#83a89a]/45 bg-transparent text-[10px] font-bold uppercase tracking-[.1em] text-[#eae3d5]"><Upload className="mr-2 h-4 w-4" /> Importar JSON</Button><input ref={importInputRef} className="sr-only" aria-label={`Importar ficha ou backup JSON de ${systemLabel}`} type="file" accept="application/json,.json" onChange={importJson} /><Button type="button" variant="outline" onClick={exportBackup} disabled={!records.length} className="h-10 rounded-none border-[#83a89a]/45 bg-transparent text-[10px] font-bold uppercase tracking-[.1em] text-[#eae3d5]"><Download className="mr-2 h-4 w-4" /> Backup do cofre</Button><Button type="button" onClick={save} className="h-10 rounded-none bg-[#b55b32] text-[10px] font-bold uppercase tracking-[.13em] text-[#161715] hover:bg-[#d27648]"><Save className="mr-2 h-4 w-4" /> Salvar localmente</Button></div></div>{name.trim().length >= 2 ? <div className="mt-3 flex justify-end"><button type="button" onClick={exportCurrent} className="text-[9px] font-bold uppercase tracking-[.12em] text-[#a9c7bb] underline decoration-[#b55b32]/60 underline-offset-4 hover:text-[#ffb08e]">Exportar ficha atual sem salvar</button></div> : null}{records.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{records.map((record) => <div key={record.id} className="flex items-center justify-between gap-3 border border-white/10 bg-black/10 p-3"><button type="button" onClick={() => load(record.id)} className="min-w-0 text-left text-[#f4eee4] hover:text-[#ffb08e]"><span className="block truncate font-serif text-lg">{record.name}</span><span className="block text-[9px] uppercase tracking-[.1em] text-[#8f958c]">Atualizada em {new Date(record.updatedAt).toLocaleDateString("pt-BR")}</span></button><div className="flex shrink-0 items-center gap-2"><button type="button" aria-label={`Exportar ${record.name} em JSON`} onClick={() => exportRecord(record)} className="text-[#a9c7bb] hover:text-[#ffb08e]"><Download className="h-4 w-4" /></button><button type="button" aria-label={`Excluir ${record.name} do cofre local`} onClick={() => remove(record.id)} className="text-[#a9c7bb] hover:text-[#ffb08e]"><Trash2 className="h-4 w-4" /></button></div></div>)}</div> : <p className="mt-4 text-xs text-[#8f958c]">Nenhuma ficha local salva ainda. Você ainda pode exportar a ficha atual sem salvá-la.</p>}</section>;
}
