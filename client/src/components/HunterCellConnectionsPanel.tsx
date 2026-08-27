import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { HUNTER_SYSTEM_ID } from "@shared/hunter";
import { GitFork, Link2, LoaderCircle, Plus, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type HunterRecord = { id: number; name: string; concept: string | null; campaignId: number | null };
type CampaignRecord = { id: number; title: string };

type Props = {
  hunters: HunterRecord[];
  campaigns: CampaignRecord[];
  selectedHunterId: number | null;
  onSelectCellName: (name: string) => void;
};

export function HunterCellConnectionsPanel({ hunters, campaigns, selectedHunterId, onSelectCellName }: Props) {
  const utils = trpc.useUtils();
  const { data: cells = [], isLoading } = trpc.hunterCells.mine.useQuery();
  const { data: antagonists = [] } = trpc.library.mine.useQuery({ systemId: HUNTER_SYSTEM_ID });
  const [cellName, setCellName] = useState("");
  const [cellDescription, setCellDescription] = useState("");
  const [newCellCampaignId, setNewCellCampaignId] = useState("");
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);
  const selectedCell = useMemo(() => cells.find((cell) => cell.id === selectedCellId) ?? null, [cells, selectedCellId]);
  const [campaignId, setCampaignId] = useState("");
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [antagonistIds, setAntagonistIds] = useState<number[]>([]);

  useEffect(() => {
    if (!selectedCell && cells[0]) setSelectedCellId(cells[0].id);
  }, [cells, selectedCell]);

  useEffect(() => {
    if (!selectedCell) return;
    setCampaignId(selectedCell.campaignId ? String(selectedCell.campaignId) : "");
    setMemberIds(selectedCell.members.map((member) => member.id));
    setAntagonistIds(selectedCell.antagonists.map((antagonist) => antagonist.id));
  }, [selectedCell]);

  const createCell = trpc.hunterCells.create.useMutation({
    onSuccess: async (cell) => {
      await utils.hunterCells.mine.invalidate();
      if (cell) { setSelectedCellId(cell.id); onSelectCellName(cell.name); }
      setCellName(""); setCellDescription(""); setNewCellCampaignId("");
      toast.success("Célula registrada no mapa de vínculos.");
    },
    onError: (error) => toast.error(error.message),
  });
  const configureCell = trpc.hunterCells.configure.useMutation({
    onSuccess: async (cell) => {
      await utils.hunterCells.mine.invalidate();
      if (cell) onSelectCellName(cell.name);
      toast.success("Vínculos da célula atualizados.");
    },
    onError: (error) => toast.error(error.message),
  });

  const toggle = (ids: number[], id: number) => ids.includes(id) ? ids.filter((entry) => entry !== id) : [...ids, id];
  const saveLinks = () => {
    if (!selectedCell) return toast.error("Selecione uma célula antes de registrar os vínculos.");
    configureCell.mutate({ cellId: selectedCell.id, campaignId: campaignId ? Number(campaignId) : null, characterIds: memberIds, antagonistIds });
  };
  const addCurrentHunter = () => {
    if (!selectedHunterId) return toast.error("Preserve a ficha antes de associá-la a uma célula.");
    if (!selectedCell) return toast.error("Selecione uma célula antes de associar a ficha.");
    if (!memberIds.includes(selectedHunterId)) setMemberIds((current) => [...current, selectedHunterId]);
  };

  return <section className="border border-[#83a89a]/40 bg-[#171a18] p-5">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#83a89a]"><GitFork className="h-4 w-4 text-[#d27648]" /> Mapa de vínculos</p><h2 className="mt-2 font-serif text-3xl leading-none text-[#f4eee4]">Células, crônicas e ameaças.</h2><p className="mt-2 max-w-2xl text-xs leading-5 text-[#b8b3a8]">Uma célula organiza seus integrantes e os antagonistas que cruzam a mesma campanha. Os vínculos ficam preservados no arquivo.</p></div><span className="border border-[#b55b32]/50 px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#ffb08e]">{cells.length} célula{cells.length === 1 ? "" : "s"}</span></div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[.76fr_1.24fr]"><aside className="space-y-3"><div className="border border-white/10 bg-black/10 p-3"><p className="text-[9px] font-bold uppercase tracking-[.14em] text-[#a9c7bb]">Nova célula</p><div className="mt-3 grid gap-2"><input value={cellName} onChange={(event) => setCellName(event.target.value)} placeholder="Ex.: Vigília da Ponte" className="field-input" aria-label="Nome da nova célula" /><textarea value={cellDescription} onChange={(event) => setCellDescription(event.target.value)} placeholder="Objetivo ou juramento da célula" className="min-h-18 border border-white/15 bg-[#101211] p-3 text-sm text-[#eae3d5]" aria-label="Descrição da nova célula" /><select value={newCellCampaignId} onChange={(event) => setNewCellCampaignId(event.target.value)} className="field-input" aria-label="Campanha da nova célula"><option value="">Sem campanha vinculada</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}</select><Button onClick={() => cellName.trim().length >= 2 ? createCell.mutate({ name: cellName.trim(), description: cellDescription.trim() || undefined, campaignId: newCellCampaignId ? Number(newCellCampaignId) : null }) : toast.error("Informe o nome da célula.")} disabled={createCell.isPending} className="h-10 rounded-none bg-[#b55b32] text-[10px] font-bold uppercase tracking-[.13em] text-[#161715] hover:bg-[#d27648]"><Plus className="mr-2 h-4 w-4" /> Registrar célula</Button></div></div>
      <div className="grid gap-2">{isLoading ? <p className="flex items-center gap-2 text-xs text-[#b8b3a8]"><LoaderCircle className="h-4 w-4 animate-spin" /> Abrindo mapa…</p> : cells.length ? cells.map((cell) => <button type="button" key={cell.id} onClick={() => { setSelectedCellId(cell.id); onSelectCellName(cell.name); }} className={`border p-3 text-left transition-colors ${selectedCellId === cell.id ? "border-[#b55b32] bg-[#b55b32]/10" : "border-white/10 bg-black/10 hover:border-[#83a89a]/55"}`}><p className="font-serif text-xl text-[#f4eee4]">{cell.name}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#a9c7bb]">{cell.campaign?.title || "Sem crônica"}</p><p className="mt-2 text-xs text-[#b8b3a8]">{cell.members.length} integrante(s) · {cell.antagonists.length} ameaça(s)</p></button>) : <p className="border border-dashed border-white/15 p-3 text-xs leading-5 text-[#b8b3a8]">Registre uma célula para começar a desenhar seus vínculos.</p>}</div></aside>
      <article className="border border-white/10 bg-black/10 p-4">{selectedCell ? <><div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[.14em] text-[#83a89a]">Célula em foco</p><h3 className="mt-1 font-serif text-3xl leading-none text-[#f4eee4]">{selectedCell.name}</h3><p className="mt-2 text-xs leading-5 text-[#b8b3a8]">{selectedCell.description || "Sem juramento registrado."}</p></div><Link2 className="h-5 w-5 shrink-0 text-[#d27648]" /></div><div className="mt-5 grid gap-5 lg:grid-cols-3"><div><label className="field-label">Campanha vinculada<select value={campaignId} onChange={(event) => setCampaignId(event.target.value)} className="field-input"><option value="">Sem campanha</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}</select></label><p className="mt-3 text-[10px] leading-4 text-[#a9c7bb]">A campanha ancora a célula na crônica e em suas sessões.</p></div><div><p className="field-label">Integrantes</p><div className="mt-2 max-h-44 space-y-2 overflow-y-auto pr-1">{hunters.map((hunter) => <label key={hunter.id} className="flex cursor-pointer items-center gap-2 border-b border-white/10 py-1.5 text-xs text-[#eae3d5]"><input type="checkbox" checked={memberIds.includes(hunter.id)} onChange={() => setMemberIds((current) => toggle(current, hunter.id))} className="accent-[#b55b32]" /> <span>{hunter.name}<small className="block text-[10px] text-[#a9c7bb]">{hunter.concept || "sem conceito"}</small></span></label>)}</div>{selectedHunterId ? <Button type="button" onClick={addCurrentHunter} variant="outline" size="sm" className="mt-3 h-8 rounded-none border-[#83a89a]/45 text-[9px] font-bold uppercase tracking-[.1em] text-[#eae3d5]"><UsersRound className="mr-2 h-3.5 w-3.5" /> Incluir ficha aberta</Button> : null}</div><div><p className="field-label">Antagonistas</p><div className="mt-2 max-h-44 space-y-2 overflow-y-auto pr-1">{antagonists.length ? antagonists.map((antagonist) => <label key={antagonist.id} className="flex cursor-pointer items-center gap-2 border-b border-white/10 py-1.5 text-xs text-[#eae3d5]"><input type="checkbox" checked={antagonistIds.includes(antagonist.id)} onChange={() => setAntagonistIds((current) => toggle(current, antagonist.id))} className="accent-[#b55b32]" /> <span>{antagonist.name}<small className="block text-[10px] text-[#ffb08e]">{antagonist.threatLevel}</small></span></label>) : <p className="text-xs leading-5 text-[#b8b3a8]">Registre dossiês de Caçador na Biblioteca para vinculá-los.</p>}</div></div></div><div className="mt-5 flex flex-col justify-between gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center"><p className="text-[10px] leading-4 text-[#a9c7bb]">O diagrama conecta {memberIds.length} ficha(s), {campaignId ? "uma campanha" : "nenhuma campanha"} e {antagonistIds.length} antagonista(s).</p><Button onClick={saveLinks} disabled={configureCell.isPending} className="h-10 rounded-none bg-[#b55b32] text-[10px] font-bold uppercase tracking-[.13em] text-[#161715] hover:bg-[#d27648]">{configureCell.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}Preservar vínculos</Button></div></> : <div className="flex min-h-56 items-center justify-center border border-dashed border-white/15 p-6 text-center text-sm leading-6 text-[#b8b3a8]">Selecione ou registre uma célula para conectar a equipe, a crônica e as ameaças.</div>}</article></div>
  </section>;
}
