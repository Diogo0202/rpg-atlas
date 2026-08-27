import DashboardLayout from "@/components/DashboardLayout";
import { SystemRuleTooltip } from "@/components/SystemRuleTooltip";
import { CampaignMembersPanel } from "@/components/CampaignMembersPanel";
import { CampaignSessionsPanel } from "@/components/CampaignSessionsPanel";
import { CampaignFactionsPanel } from "@/components/CampaignFactionsPanel";
import { CampaignTimelinePanel } from "@/components/CampaignTimelinePanel";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { createHunterSheetData, HUNTER_SYSTEM_ID } from "@shared/hunter";
import { ArchiveRestore, BookOpen, Dices, FolderPlus, Plus, ScrollText, ShieldCheck, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const systemLabels: Record<string, string> = {
  "vampiro-v5": "Vampiro: A Máscara V5",
  "o-um-anel": "O Um Anel",
  "cacador-a-vinganca": "Caçador: A Revanche",
};
const recentCampaignKey = "rpg-atlas-active-db-campaign-id";

function SanctumContent() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [campaignTitle, setCampaignTitle] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [systemId, setSystemId] = useState<"vampiro-v5" | "o-um-anel" | "cacador-a-vinganca">("vampiro-v5");
  const [recentCampaignId, setRecentCampaignId] = useState<number | null>(() => { const stored = window.localStorage.getItem(recentCampaignKey); return stored ? Number(stored) : null; });
  const { data: systems = [] } = trpc.systems.list.useQuery();
  const { data: campaigns = [], isLoading: loadingCampaigns } = trpc.campaigns.mine.useQuery(undefined, { enabled: Boolean(user) });
  const { data: characters = [], isLoading: loadingCharacters } = trpc.characters.mine.useQuery(undefined, { enabled: Boolean(user) });
  const recentCampaign = campaigns.find((campaign) => campaign.id === recentCampaignId) ?? campaigns[0];
  useEffect(() => { if (recentCampaign && recentCampaign.id !== recentCampaignId) { setRecentCampaignId(recentCampaign.id); window.localStorage.setItem(recentCampaignKey, String(recentCampaign.id)); } }, [recentCampaign, recentCampaignId]);
  const markRecent = (campaign: { id: number; title: string }) => { setRecentCampaignId(campaign.id); window.localStorage.setItem(recentCampaignKey, String(campaign.id)); toast.success(`${campaign.title} carregada como contexto atual do arquivo.`); };
  const createCampaign = trpc.campaigns.create.useMutation({
    onSuccess: async (campaign) => { setCampaignTitle(""); await utils.campaigns.mine.invalidate(); markRecent(campaign); },
    onError: () => toast.error("Não foi possível registrar a campanha."),
  });
  const createCharacter = trpc.characters.create.useMutation({
    onSuccess: async () => { setCharacterName(""); await utils.characters.mine.invalidate(); toast.success("Ficha criada e preservada no arquivo."); },
    onError: () => toast.error("Não foi possível criar a ficha."),
  });

  const submitCampaign = () => {
    const title = campaignTitle.trim();
    if (!title) { toast.error("Dê um nome à campanha antes de registrar."); return; }
    createCampaign.mutate({ title, systemId });
  };
  const submitCharacter = () => {
    const name = characterName.trim();
    if (!name) { toast.error("Dê um nome ao personagem antes de registrar."); return; }
    createCharacter.mutate({
      name,
      systemId,
      sheetData: systemId === "vampiro-v5" ? { hunger: 0, healthDamage: [], willpowerDamage: [], attributes: {}, skills: {} } : systemId === HUNTER_SYSTEM_ID ? createHunterSheetData() : { endurance: 0, hope: 0, shadow: 0, attributes: {}, skills: {} },
    });
  };

  return <div className="min-h-screen bg-[#101211] text-[#eae3d5]"><div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10"><header className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#83a89a]">Santuário autenticado · registro 01</p><h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] text-[#f4eee4]">Bem-vindo ao<br />arquivo vivo.</h1></div><div className="border-l border-[#b55b32]/55 pl-5 text-sm leading-6 text-[#b8b3a8]"><p className="font-serif text-xl text-[#eae3d5]">{user?.name || "Cronista"}</p><p>Suas campanhas, fichas e futuros registros agora vivem fora do navegador.</p></div></header>
  <section className="mt-6 border border-[#b55b32]/45 bg-[#171a18] p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#83a89a]"><ArchiveRestore className="h-3.5 w-3.5 text-[#d27648]" /> Contexto recente</div><p className="mt-2 font-serif text-2xl leading-none text-[#f4eee4]">{recentCampaign?.title || "Nenhuma campanha registrada"}</p><p className="mt-2 text-sm text-[#b8b3a8]">Carregue a última campanha para retomá-la como referência do arquivo.</p></div>{recentCampaign ? <Button onClick={() => markRecent(recentCampaign)} className="h-10 rounded-none bg-[#b55b32] text-[9px] font-bold uppercase tracking-[0.14em] text-[#101211] hover:bg-[#d27648]">Carregar campanha</Button> : null}</div></section>

  <section className="mt-8 grid gap-4 md:grid-cols-3"><article className="border border-white/10 bg-[#171a18] p-5"><ScrollText className="h-4 w-4 text-[#d27648]" /><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#a9c7bb]">Campanhas ativas</p><p className="mt-2 font-serif text-4xl text-[#f4eee4]">{loadingCampaigns ? "—" : campaigns.length}</p></article><article className="border border-white/10 bg-[#171a18] p-5"><UsersRound className="h-4 w-4 text-[#d27648]" /><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#a9c7bb]">Fichas preservadas</p><p className="mt-2 font-serif text-4xl text-[#f4eee4]">{loadingCharacters ? "—" : characters.length}</p></article><article className="border border-white/10 bg-[#171a18] p-5"><ShieldCheck className="h-4 w-4 text-[#d27648]" /><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#a9c7bb]">Sistemas disponíveis</p><p className="mt-2 font-serif text-4xl text-[#f4eee4]">{systems.length}</p></article></section>
  <CampaignMembersPanel campaigns={campaigns} initialCampaignId={recentCampaign?.id ?? null} />
  <CampaignSessionsPanel campaigns={campaigns} initialCampaignId={recentCampaign?.id ?? null} />
  <CampaignFactionsPanel campaigns={campaigns} initialCampaignId={recentCampaign?.id ?? null} />
  <CampaignTimelinePanel campaigns={campaigns} initialCampaignId={recentCampaign?.id ?? null} />

  <section className="mt-8 grid gap-7 xl:grid-cols-[0.88fr_1.12fr]"><article className="relative overflow-hidden border border-[#b55b32]/45 bg-[#171a18] p-6"><div className="absolute inset-0 dossier-grid opacity-20" /><div className="relative"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a9c7bb]">Preparar registro</p><h2 className="mt-3 font-serif text-4xl leading-none">Inicie uma<br />nova crônica.</h2><p className="mt-4 max-w-sm text-sm leading-6 text-[#b8b3a8]">Escolha o sistema. Cada campanha carrega suas próprias regras, membros e documentos.</p><label className="mt-7 flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#a9c7bb]">Sistema<select value={systemId} onChange={(event) => setSystemId(event.target.value as "vampiro-v5" | "o-um-anel")} className="h-11 border border-white/15 bg-[#101211] px-3 text-sm font-semibold normal-case tracking-normal text-[#eae3d5] outline-none focus:border-[#b55b32]">{systems.map((system) => <option key={system.id} value={system.id}>{system.name} · {system.edition}</option>)}</select></label><label className="mt-4 flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#a9c7bb]">Nome da campanha<input value={campaignTitle} onChange={(event) => setCampaignTitle(event.target.value)} placeholder="Ex.: A Coroa Partida" className="h-11 border border-white/15 bg-[#101211] px-3 text-sm font-medium normal-case tracking-normal text-[#eae3d5] outline-none placeholder:text-[#6f746c] focus:border-[#b55b32]" /></label><Button onClick={submitCampaign} disabled={createCampaign.isPending} className="mt-5 h-11 rounded-none bg-[#b55b32] px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#101211] hover:bg-[#d27648]"><FolderPlus className="mr-2 h-4 w-4" />{createCampaign.isPending ? "Registrando" : "Registrar campanha"}</Button></div></article>

  <article className="archive-paper border border-[#161715]/20 p-6 text-[#161715]"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b55b32]">Fichas do cronista</p><div className="mt-3 flex flex-col justify-between gap-4 border-b border-[#161715]/15 pb-5 sm:flex-row sm:items-end"><h2 className="font-serif text-4xl leading-none">Personagens sob<br />sua guarda.</h2><div className="flex gap-2"><input value={characterName} onChange={(event) => setCharacterName(event.target.value)} placeholder="Nome da ficha" className="h-10 w-full min-w-0 border border-[#161715]/25 bg-[#f7efe3] px-3 text-sm outline-none placeholder:text-[#7d786f] focus:border-[#b55b32] sm:w-40" /><Button onClick={submitCharacter} disabled={createCharacter.isPending} className="h-10 shrink-0 rounded-none bg-[#b55b32] px-3 text-[#101211] hover:bg-[#d27648]"><Plus className="mr-1 h-4 w-4" /> Criar</Button></div></div><div className="mt-5 grid gap-3">{loadingCharacters ? <p className="text-sm text-[#5a5b53]">Consultando o arquivo…</p> : characters.length ? characters.map((character) => <div key={character.id} className="flex items-center justify-between gap-4 border border-[#161715]/15 bg-[#f7efe3]/60 p-4"><div><p className="font-serif text-2xl leading-none">{character.name}</p><p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#776f64]">{systemLabels[character.systemId] || character.systemId} · registro {String(character.id).padStart(3, "0")}</p></div><Dices className="h-5 w-5 text-[#b55b32]" /></div>) : <div className="border border-dashed border-[#161715]/25 p-5 text-sm leading-6 text-[#5a5b53]">Nenhuma ficha foi persistida neste arquivo. Crie a primeira para iniciar a transição do cofre local para a biblioteca da plataforma.</div>}</div></article></section>

  <section className="mt-8 border-t border-white/10 pt-6"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a9c7bb]"><BookOpen className="h-4 w-4 text-[#d27648]" /> Sistemas em operação</div><div className="mt-4 grid gap-3 md:grid-cols-2">{systems.map((system) => <div key={system.id} className="border border-white/10 bg-white/[0.025] p-4"><p className="font-serif text-2xl leading-none text-[#f4eee4]">{system.name}</p><p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#83a89a]">{system.edition} · {system.status === "active" ? "arquivo ativo" : "planejado"}</p></div>)}</div></section></div></div>;
}

export default function Sanctum() { return <DashboardLayout><SanctumContent /></DashboardLayout>; }
