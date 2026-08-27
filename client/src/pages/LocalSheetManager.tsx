import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { createLocalSheetId, duplicateLocalSheet, listLocalSheetViews, listLocalSheets, removeLocalSheet, removeLocalSheetView, renameLocalSheet, saveLocalSheet, saveLocalSheetView, updateLocalSheetMetadata, type LocalSheetRecord, type LocalSheetView } from "@/lib/localSheetVault";
import { createCharacterJsonEnvelope, createCharacterShareUrl, createVaultBackup, downloadJsonFile, parseVaultBackup, type ParsedCharacterJson } from "@/lib/sheetJson";
import QRCode from "qrcode";
import { Copy, Download, Edit3, FolderOpen, QrCode, Search, Save, Tags, Trash2, Upload, X } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import { Link } from "wouter";

const vaults = [
  { storageKey: "rpg-atlas-local-vampiro-v5-v1", label: "Vampiro V5", path: "/ficha-v5", accent: "sangue", systemId: "vampiro-v5" },
  { storageKey: "rpg-atlas-local-hunter-v1", label: "Caçador", path: "/ficha-cacador", accent: "caça", systemId: "cacador-a-vinganca" },
  { storageKey: "rpg-atlas-local-o-um-anel-v1", label: "O Um Anel", path: "/ficha-um-anel", accent: "jornada", systemId: "o-um-anel" },
] as const;

type LocalPayload = { name: string; concept?: string; campaignId?: string; sheet: unknown };
type ManagerRecord = LocalSheetRecord<LocalPayload> & { storageKey: string; systemLabel: string; path: string; systemId: ParsedCharacterJson["systemId"] };
type SortKey = "updated-desc" | "updated-asc" | "created-desc" | "created-asc" | "name-asc" | "name-desc" | "system-asc";

function readAllRecords(): ManagerRecord[] {
  return vaults.flatMap((vault) => listLocalSheets<LocalPayload>(vault.storageKey).map((record) => ({ ...record, storageKey: vault.storageKey, systemLabel: vault.label, path: vault.path, systemId: vault.systemId })));
}

function dateValue(record: ManagerRecord, key: "createdAt" | "updatedAt") {
  return new Date(record[key] || record.updatedAt).getTime();
}

export function LocalSheetManagerContent() {
  const [records, setRecords] = useState<ManagerRecord[]>(readAllRecords);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingMetaKey, setEditingMetaKey] = useState<string | null>(null);
  const [editingLevel, setEditingLevel] = useState("");
  const [editingTags, setEditingTags] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("updated-desc");
  const [views, setViews] = useState<LocalSheetView[]>(listLocalSheetViews);
  const [viewName, setViewName] = useState("");
  const [selectedViewId, setSelectedViewId] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareQr, setShareQr] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const refresh = () => { setRecords(readAllRecords()); setViews(listLocalSheetViews()); };
  const availableTags = useMemo(() => Array.from(new Set(records.flatMap((record) => record.tags || []))).sort((a, b) => a.localeCompare(b, "pt-BR")), [records]);
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    const tagQuery = tagFilter.trim().toLocaleLowerCase("pt-BR");
    const selectedLevel = levelFilter ? Number(levelFilter) : null;
    return records.filter((record) => {
      const searchMatches = !query || [record.name, record.systemLabel, record.sheet.concept || "", ...(record.tags || [])].some((value) => value.toLocaleLowerCase("pt-BR").includes(query));
      const levelMatches = selectedLevel === null || record.level === selectedLevel;
      const tagMatches = !tagQuery || (record.tags || []).some((tag) => tag.toLocaleLowerCase("pt-BR") === tagQuery);
      return searchMatches && levelMatches && tagMatches;
    }).sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name, "pt-BR");
      if (sortBy === "name-desc") return b.name.localeCompare(a.name, "pt-BR");
      if (sortBy === "system-asc") return a.systemLabel.localeCompare(b.systemLabel, "pt-BR") || a.name.localeCompare(b.name, "pt-BR");
      if (sortBy === "created-asc") return dateValue(a, "createdAt") - dateValue(b, "createdAt");
      if (sortBy === "created-desc") return dateValue(b, "createdAt") - dateValue(a, "createdAt");
      if (sortBy === "updated-asc") return dateValue(a, "updatedAt") - dateValue(b, "updatedAt");
      return dateValue(b, "updatedAt") - dateValue(a, "updatedAt");
    });
  }, [records, search, sortBy, levelFilter, tagFilter]);

  const beginRename = (record: ManagerRecord) => { setEditingKey(`${record.storageKey}:${record.id}`); setEditingName(record.name); };
  const commitRename = (record: ManagerRecord) => { try { renameLocalSheet(record.storageKey, record.id, editingName); setEditingKey(null); setNotice(`“${editingName.trim()}” foi renomeada.`); refresh(); } catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível renomear a ficha."); } };
  const beginMetadata = (record: ManagerRecord) => { setEditingMetaKey(`${record.storageKey}:${record.id}`); setEditingLevel(record.level ? String(record.level) : ""); setEditingTags((record.tags || []).join(", ")); };
  const commitMetadata = (record: ManagerRecord) => { const parsedLevel = editingLevel.trim() ? Number(editingLevel) : undefined; const level = parsedLevel !== undefined && Number.isFinite(parsedLevel) ? Math.max(1, Math.min(100, Math.round(parsedLevel))) : undefined; const tags = Array.from(new Set(editingTags.split(",").map((tag) => tag.trim()).filter(Boolean))).slice(0, 12); updateLocalSheetMetadata(record.storageKey, record.id, { level, tags }); setEditingMetaKey(null); setNotice(`Organização de “${record.name}” atualizada.`); refresh(); };
  const duplicate = (record: ManagerRecord) => { duplicateLocalSheet<LocalPayload>(record.storageKey, record.id); setNotice(`Uma cópia de “${record.name}” foi criada.`); refresh(); };
  const saveView = () => {
    const name = viewName.trim();
    if (name.length < 2) { setNotice("Dê um nome com pelo menos 2 caracteres para salvar a visualização."); return; }
    const current = views.find((view) => view.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"));
    const saved = saveLocalSheetView({ id: current?.id || createLocalSheetId("rpg-atlas-view"), name, search, levelFilter, tagFilter, sortBy });
    setViews(saved); setSelectedViewId(saved[0]?.id || ""); setViewName(""); setNotice(`Visualização “${name}” salva.`);
  };
  const applyView = (id: string) => {
    setSelectedViewId(id);
    const view = views.find((entry) => entry.id === id);
    if (!view) return;
    setSearch(view.search); setLevelFilter(view.levelFilter); setTagFilter(view.tagFilter); setSortBy(view.sortBy as SortKey); setNotice(`Visualização “${view.name}” aplicada.`);
  };
  const deleteView = () => {
    if (!selectedViewId) return;
    const view = views.find((entry) => entry.id === selectedViewId);
    setViews(removeLocalSheetView(selectedViewId)); setSelectedViewId(""); setNotice(view ? `Visualização “${view.name}” excluída.` : "Visualização excluída.");
  };
  const shareRecord = async (record: ManagerRecord) => {
    try {
      const payload = createCharacterJsonEnvelope({ systemId: record.systemId, name: record.name, concept: record.sheet.concept, campaignId: record.sheet.campaignId, createdAt: record.createdAt, level: record.level, tags: record.tags, sheet: record.sheet.sheet });
      const url = createCharacterShareUrl(payload);
      const qr = await QRCode.toDataURL(url, { width: 220, margin: 2, color: { dark: "#161715", light: "#f4eee4" } });
      setShareQr(qr);
      setShareUrl(url);
      try { await navigator.clipboard.writeText(url); setNotice(`Link JSON de “${record.name}” copiado.`); } catch { window.prompt("Copie o link JSON da ficha:", url); }
    } catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível criar o link JSON."); }
  };
  const remove = (record: ManagerRecord) => { if (!window.confirm(`Excluir “${record.name}” do navegador? Esta ação não remove a ficha remota.`)) return; removeLocalSheet(record.storageKey, record.id); setNotice(`“${record.name}” foi excluída do cofre local.`); refresh(); };

  const exportBackup = () => {
    const payload = createVaultBackup(records.map((record) => ({ systemId: record.systemId, name: record.name, concept: record.sheet.concept || "", campaignId: record.sheet.campaignId, createdAt: record.createdAt, level: record.level, tags: record.tags, sheet: record.sheet.sheet, updatedAt: record.updatedAt })));
    downloadJsonFile(payload, `backup-cofre-rpg-atlas-${new Date().toISOString().slice(0, 10)}.json`);
    setNotice(`Backup com ${records.length} ficha(s) exportado.`);
  };

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5_000_000) { setNotice("Use um JSON de até 5 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseVaultBackup(JSON.parse(String(reader.result ?? "{}")));
        if (!parsed?.length) throw new Error("invalid");
        parsed.forEach((entry, index) => {
          const vault = vaults.find((candidate) => candidate.systemId === entry.systemId);
          if (!vault) throw new Error("system");
          const timestamp = entry.updatedAt || entry.createdAt || new Date(Date.now() + index).toISOString();
          saveLocalSheet(vault.storageKey, { id: createLocalSheetId(vault.storageKey), name: entry.name, createdAt: entry.createdAt || timestamp, updatedAt: timestamp, level: entry.level, tags: entry.tags, sheet: { name: entry.name, concept: entry.concept, campaignId: entry.campaignId, sheet: entry.sheet } });
        });
        refresh();
        setNotice(`${parsed.length} ficha(s) importada(s) sem substituir registros existentes.`);
      } catch (error) {
        setNotice(error instanceof Error && error.message === "system" ? "O backup contém um sistema que este cofre ainda não suporta." : "O JSON não foi reconhecido como ficha ou backup compatível.");
      }
    };
    reader.onerror = () => setNotice("Não foi possível ler o arquivo selecionado.");
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#101211] text-[#eae3d5]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="border-b border-white/10 pb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#83a89a]">Arquivo pessoal · cofre local</p>
          <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><h1 className="font-serif text-5xl leading-none tracking-[-0.04em] text-[#f4eee4]">Suas fichas,<br /><em className="font-normal text-[#d27648]">sob custódia.</em></h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#b8b3a8]">Gerencie as cópias salvas neste navegador. Renomear, duplicar e excluir aqui não altera personagens persistidos nas campanhas.</p></div><div className="border border-[#83a89a]/45 bg-[#171a18] px-6 py-4 text-center"><strong className="font-serif text-4xl text-[#d27648]">{records.length}</strong><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#a9c7bb]">fichas locais</p></div></div>
        </header>
        {notice ? <div role="status" className="mt-5 flex items-center justify-between gap-3 border border-[#83a89a]/45 bg-[#83a89a]/10 p-4 text-sm text-[#d8efe2]"><span>{notice}</span><button type="button" aria-label="Fechar aviso" onClick={() => setNotice("")}><X className="h-4 w-4" /></button></div> : null}
        <section className="mt-7 grid gap-4 md:grid-cols-3">{vaults.map((vault) => <Link key={vault.storageKey} href={vault.path} className="group border border-white/10 bg-[#171a18] p-4 transition-colors hover:border-[#b55b32]/70"><div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]">{vault.accent}</span><FolderOpen className="h-4 w-4 text-[#d27648]" /></div><p className="mt-4 font-serif text-2xl text-[#f4eee4]">{vault.label}</p><p className="mt-2 text-xs text-[#8f958c]">Abrir ficha e carregar um registro</p></Link>)}</section>
        <section className="mt-7 border border-[#b55b32]/45 bg-[#171a18] p-5">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]">Todos os registros locais</p><h2 className="mt-2 font-serif text-3xl text-[#f4eee4]">Biblioteca do navegador</h2></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => importInputRef.current?.click()} className="h-10 rounded-none border-[#83a89a]/45 bg-transparent text-[10px] font-bold uppercase tracking-[.1em] text-[#eae3d5]"><Upload className="mr-2 h-4 w-4" /> Importar JSON</Button><input ref={importInputRef} className="sr-only" aria-label="Importar ficha ou backup JSON para o cofre" type="file" accept="application/json,.json" onChange={importBackup} /><Button type="button" variant="outline" onClick={exportBackup} disabled={!records.length} className="h-10 rounded-none border-[#83a89a]/45 bg-transparent text-[10px] font-bold uppercase tracking-[.1em] text-[#eae3d5]"><Download className="mr-2 h-4 w-4" /> Exportar backup</Button></div></div>
          <div className="mt-4 grid gap-2 border border-white/10 bg-black/10 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]"><label className="sr-only" htmlFor="saved-vault-view">Visualização salva</label><select id="saved-vault-view" value={selectedViewId} onChange={(event) => applyView(event.target.value)} aria-label="Visualizações salvas do cofre" className="h-10 border border-white/15 bg-[#101211] px-3 text-xs text-[#eae3d5]"><option value="">Aplicar visualização salva</option>{views.map((view) => <option key={view.id} value={view.id}>{view.name}</option>)}</select><label className="sr-only" htmlFor="new-vault-view">Nome da visualização</label><input id="new-vault-view" value={viewName} onChange={(event) => setViewName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveView(); }} placeholder="Nome da visualização atual" aria-label="Nome da nova visualização" className="h-10 border border-white/15 bg-[#101211] px-3 text-xs text-[#eae3d5] placeholder:text-[#777b73]" /><Button type="button" onClick={saveView} className="h-10 rounded-none bg-[#b55b32] px-3 text-[9px] font-bold uppercase tracking-[.1em] text-[#161715]"><Save className="mr-2 h-4 w-4" /> Salvar visão</Button><Button type="button" variant="outline" onClick={deleteView} disabled={!selectedViewId} className="h-10 rounded-none border-white/15 bg-transparent px-3 text-[9px] font-bold uppercase tracking-[.1em] text-[#ffb08e]"><Trash2 className="mr-2 h-4 w-4" /> Excluir visão</Button></div>
          {shareUrl ? <div className="mt-4 flex flex-wrap items-center gap-3 border border-[#83a89a]/35 bg-[#f4eee4] p-3"><img src={shareQr || ""} alt="QR code da ficha JSON compartilhada no cofre" className="h-36 w-36" /><div className="max-w-xs text-right text-[9px] leading-4 text-[#161715]"><strong className="block uppercase tracking-[.1em]">Link JSON pronto</strong><span>O link foi copiado. Envie a URL ou escaneie o QR code para abrir a ficha.</span><button type="button" onClick={() => setShareUrl(null)} className="mt-2 block w-full text-right font-bold uppercase tracking-[.1em] underline">Fechar</button></div></div> : null}
          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_150px_180px_230px_auto]"><label className="relative block"><span className="sr-only">Pesquisar fichas locais</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#83a89a]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar por nome, sistema, conceito ou tag" aria-label="Pesquisar fichas locais" className="h-11 w-full border border-white/15 bg-[#101211] pl-10 pr-3 text-sm text-[#eae3d5] outline-none transition-colors placeholder:text-[#777b73] focus:border-[#d27648]" /></label><label className="block"><span className="sr-only">Filtrar por nível</span><select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} aria-label="Filtrar fichas por nível" className="h-11 w-full border border-white/15 bg-[#101211] px-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#eae3d5] outline-none focus:border-[#d27648]"><option value="">Todos os níveis</option>{Array.from({ length: 20 }, (_, index) => index + 1).map((level) => <option key={level} value={level}>Nível {level}</option>)}</select></label><label className="block"><span className="sr-only">Filtrar por tag</span><select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} aria-label="Filtrar fichas por tag" className="h-11 w-full border border-white/15 bg-[#101211] px-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#eae3d5] outline-none focus:border-[#d27648]"><option value="">Todas as tags</option>{availableTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select></label><label className="block"><span className="sr-only">Ordenar fichas locais</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortKey)} aria-label="Ordenar fichas locais" className="h-11 w-full border border-white/15 bg-[#101211] px-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#eae3d5] outline-none focus:border-[#d27648]"><option value="updated-desc">Atualizadas recentemente</option><option value="updated-asc">Atualizadas há mais tempo</option><option value="created-desc">Criadas recentemente</option><option value="created-asc">Criadas há mais tempo</option><option value="name-asc">Nome A–Z</option><option value="name-desc">Nome Z–A</option><option value="system-asc">Sistema A–Z</option></select></label><span className="flex h-11 items-center border border-white/10 px-3 text-[10px] font-bold uppercase tracking-[.1em] text-[#8f958c]">{filteredRecords.length} de {records.length}</span></div>
          {filteredRecords.length ? <div className="mt-5 space-y-3">{filteredRecords.map((record) => { const key = `${record.storageKey}:${record.id}`; const isEditing = editingKey === key; const isEditingMeta = editingMetaKey === key; return <article key={key} className="flex flex-col gap-4 border border-white/10 bg-black/10 p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center border border-[#b55b32]/60 text-[#d27648]"><Save className="h-5 w-5" /></div><div className="min-w-0"><span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#a9c7bb]">{record.systemLabel}</span>{isEditing ? <div className="mt-2 flex flex-wrap gap-2"><label className="sr-only" htmlFor={`rename-${key}`}>Novo nome</label><input id={`rename-${key}`} autoFocus value={editingName} onChange={(event) => setEditingName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") commitRename(record); if (event.key === "Escape") setEditingKey(null); }} className="h-9 min-w-[220px] border border-[#b55b32] bg-[#101211] px-3 font-serif text-lg text-[#f4eee4]" /><Button type="button" onClick={() => commitRename(record)} className="h-9 rounded-none bg-[#b55b32] px-3 text-[9px] font-bold uppercase text-[#161715]">Salvar</Button></div> : <><h3 className="truncate font-serif text-2xl text-[#f4eee4]">{record.name}</h3><p className="mt-1 truncate text-xs text-[#8f958c]">{record.sheet.concept || "Sem conceito"} · Atualizada em {new Date(record.updatedAt).toLocaleDateString("pt-BR")}</p>{isEditingMeta ? <div className="mt-3 flex flex-wrap items-end gap-2"><label className="text-[9px] font-bold uppercase tracking-[.1em] text-[#a9c7bb]">Nível<input aria-label={`Nível de ${record.name}`} type="number" min={1} max={100} value={editingLevel} onChange={(event) => setEditingLevel(event.target.value)} className="mt-1 h-8 w-20 border border-[#b55b32] bg-[#101211] px-2 text-xs text-[#f4eee4]" /></label><label className="min-w-48 flex-1 text-[9px] font-bold uppercase tracking-[.1em] text-[#a9c7bb]">Tags<input aria-label={`Tags de ${record.name}`} value={editingTags} onChange={(event) => setEditingTags(event.target.value)} placeholder="investigação, jogador" className="mt-1 h-8 w-full border border-[#b55b32] bg-[#101211] px-2 text-xs normal-case tracking-normal text-[#f4eee4]" /></label><Button type="button" onClick={() => commitMetadata(record)} className="h-8 rounded-none bg-[#b55b32] px-3 text-[9px] font-bold uppercase text-[#161715]">Salvar</Button></div> : <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[.08em] text-[#8f958c]"><span>{record.level ? `Nível ${record.level}` : "Nível não definido"}</span>{(record.tags || []).map((tag) => <span key={tag} className="border border-[#83a89a]/35 px-2 py-1 text-[#a9c7bb]">#{tag}</span>)}</div>}</>}</div></div><div className="flex flex-wrap items-center gap-2 lg:justify-end"><Link href={record.path}><Button type="button" variant="outline" className="h-9 rounded-none border-white/15 bg-transparent text-[9px] font-bold uppercase tracking-[0.1em] text-[#eae3d5]">Abrir sistema</Button></Link><Button type="button" aria-label={`Renomear ${record.name}`} onClick={() => beginRename(record)} variant="outline" className="h-9 rounded-none border-white/15 bg-transparent px-3 text-[#a9c7bb]"><Edit3 className="h-4 w-4" /></Button><Button type="button" aria-label={`Editar nível e tags de ${record.name}`} onClick={() => beginMetadata(record)} variant="outline" className="h-9 rounded-none border-white/15 bg-transparent px-3 text-[#a9c7bb]"><Tags className="h-4 w-4" /></Button><Button type="button" aria-label={`Compartilhar ${record.name} por link JSON`} onClick={() => shareRecord(record)} variant="outline" className="h-9 rounded-none border-white/15 bg-transparent px-3 text-[#a9c7bb]"><QrCode className="h-4 w-4" /></Button><Button type="button" aria-label={`Duplicar ${record.name}`} onClick={() => duplicate(record)} variant="outline" className="h-9 rounded-none border-white/15 bg-transparent px-3 text-[#a9c7bb]"><Copy className="h-4 w-4" /></Button><Button type="button" aria-label={`Excluir ${record.name}`} onClick={() => remove(record)} variant="outline" className="h-9 rounded-none border-[#b55b32]/50 bg-transparent px-3 text-[#ffb08e]"><Trash2 className="h-4 w-4" /></Button></div></article>; })}</div> : <div className="mt-5 border border-dashed border-white/20 p-7 text-center"><p className="font-serif text-2xl text-[#f4eee4]">{records.length ? "Nenhuma ficha encontrada." : "O cofre está vazio."}</p><p className="mt-2 text-sm text-[#8f958c]">{records.length ? "Tente outro termo ou altere os filtros." : "Salve uma ficha em qualquer um dos sistemas para vê-la aqui."}</p></div>}
        </section>
      </div>
    </div>
  );
}

export default function LocalSheetManager() {
  return <DashboardLayout><LocalSheetManagerContent /></DashboardLayout>;
}
