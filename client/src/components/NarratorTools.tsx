/**
 * Design philosophy: Arquivo Obsidiano — session tools behave as indexed records,
 * not generic dashboard widgets. State remains private to the browser.
 */
import { useEffect, useState } from "react";
import { AlertTriangle, Check, Clock3, Copy, Dices, Download, FileText, Heart, Minus, PencilLine, Plus, RefreshCw, Save, Trash2, UserRound, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import CampaignWorkbench from "@/components/CampaignWorkbench";
import NpcPrintPreview from "@/components/NpcPrintPreview";

type Territory = "Véspera do Vau" | "Ermo de Karzath" | "Velas Mortas";
type Tone = "Qualquer tom" | "Investigação" | "Horror" | "Intriga" | "Sobrevivência";
type FavoriteKind = "Gancho" | "NPC";

type Hook = {
  code: string;
  title: string;
  territory: Territory;
  factionId: string;
  faction: string;
  premise: string;
  pressure: string;
  witness: string;
  memory: string;
  reward: string;
  escalation: string;
};

type Npc = {
  code: string;
  name: string;
  role: string;
  appearance: string;
  desire: string;
  fear: string;
  secret: string;
  offer: string;
  betrayal: string;
  profile: { body: number; heart: number; wits: number; resistance: number; hope: number };
};

type Favorite = { id: string; kind: FavoriteKind; title: string; summary: string; record: string; npc?: Npc };
type SessionSummary = { title: string; happenings: string; decisions: string; nextScene: string };
type CrisisEvent = { id: string; factionId: string; faction: string; session: string; title: string; consequence: string; timestamp: string; resolved: boolean };
type AlertPreferences = { sound: boolean; pulse: boolean };

const hooksByTerritory: Record<Territory, Omit<Hook, "code" | "territory" | "factionId" | "faction">[]> = {
  "Véspera do Vau": [
    { title: "A lista que cresce sozinha", premise: "Uma lista de travessias começa a registrar nomes de pessoas que ainda não cruzaram o Rio Cinéreo.", pressure: "O Conselho dos Marcos exige silêncio antes que a Companhia do Sal Negro use a lista para vender proteção.", witness: "Uma aprendiz de escrivã viu um nome ser escrito por uma mão molhada dentro do próprio livro.", memory: "A última travessia de um parente desaparecido voltou a constar como paga.", reward: "Um salvo-conduto pelos marcos e um nome verdadeiro esquecido.", escalation: "Se a lista alcançar doze nomes, o Sino de Namar chama todos ao mesmo tempo." },
    { title: "O quarto toque", premise: "Três toques do Sino de Namar são rotina; o quarto anuncia que a cidade perdeu uma memória coletiva.", pressure: "A Lanterna de Sal quer isolar as margens, mas a população teme que o bloqueio esconda uma prisão.", witness: "Um barqueiro afirma ter levado uma mulher sem rosto para o centro do rio.", memory: "A canção que cada Herói aprendeu na infância perdeu um verso essencial.", reward: "Acesso a uma rota de sal que não existe em mapas públicos.", escalation: "Cada noite sem resposta transforma mais uma casa em endereço sem dono." },
    { title: "Vidro sob a ponte", premise: "Fragmentos verdes brotam sob a ponte do vau e refletem cenas que ainda não aconteceram.", pressure: "Os Vidreiros Errantes oferecem uma saída, mas o Conselho exige que os espelhos sejam destruídos.", witness: "Uma criança reconhece nos reflexos uma versão adulta de si mesma entregando o sino a alguém.", memory: "Um juramento que um Herói nunca fez aparece como quebrado no vidro.", reward: "Uma rota secreta, um favor dos Vidreiros e uma pergunta respondida pelo reflexo.", escalation: "Quando o último fragmento partir, uma das previsões se torna inevitável." },
  ],
  "Ermo de Karzath": [
    { title: "A coroa sob as cinzas", premise: "Uma escavação revelou um aro de bronze que sussurra o título de quem o toca, mas nunca o nome completo.", pressure: "A Cidadela de Escória quer fundir o objeto; os Clãs do Vidro Negro querem provar que ele pertence ao Rei Sem Fornalha.", witness: "Um ferreiro sem memória do próprio rosto afirma ter ouvido a coroa negar um pedido de guerra.", memory: "A lembrança de uma derrota pessoal passa a ter cheiro de metal queimado.", reward: "Uma marca de passagem pelas forjas e uma audiência indireta com um Cavaleiro de Escória.", escalation: "Se a coroa for aquecida, ela escolherá um portador e fechará todas as saídas da escavação." },
    { title: "O cavaleiro que não golpeia", premise: "Um Cavaleiro de Escória bloqueia uma rota vital, mas responde a violência apenas ajoelhando-se em silêncio.", pressure: "Os Barqueiros precisam da rota aberta; a Irmandade da Cinza Oca quer usar o impasse como propaganda.", witness: "Uma mensageira encontrou na armadura uma inscrição idêntica a uma promessa feita por um Herói.", memory: "A memória de uma pessoa esquecida pode libertar o guardião, mas custa uma verdade presente.", reward: "Uma chave de bronze e proteção contra uma patrulha da Cidadela.", escalation: "Quando o sol baixar, o Cavaleiro aceitará uma ordem de execução sem poder desobedecer." },
    { title: "Forja para ninguém", premise: "Uma fornalha abandonada produz armas com nomes gravados de pessoas que nunca existiram.", pressure: "A Companhia do Sal Negro quer vender as lâminas; os Forjados Sem Nome querem destruí-las antes que criem soldados.", witness: "Um catador reconhece seu próprio nome numa espada que lembra uma vida impossível.", memory: "Cada arma aceita uma lembrança para se tornar mais poderosa.", reward: "Uma ferramenta de Ofício singular e o mapa de um corredor sob a forja.", escalation: "Depois de sete armas, a fornalha exigirá um nome vivo para completar a oitava." },
  ],
  "Velas Mortas": [
    { title: "A vela que não se apaga", premise: "Uma vela funerária segue acesa há quarenta dias e ilumina apenas as mentiras ditas perto dela.", pressure: "O Círculo das Velas Mortas pede contenção; os Coletores de Ossos de Sal querem capturar sua chama.", witness: "Uma criança do pântano diz que a vela fala com a voz de uma pessoa que todos juram nunca ter conhecido.", memory: "O primeiro segredo que um Herói contar perto da chama deixa de pertencer somente a ele.", reward: "Um nome recuperado e a bênção temporária de uma rota sobre a água.", escalation: "Ao apagar, a vela devolve todas as mentiras de uma vez para seus donos." },
    { title: "O enterro que caminha", premise: "Uma procissão de barcas vazias atravessa o pântano ao amanhecer, sempre rumo a uma tumba sem nome.", pressure: "A Irmandade do Lodo oferece cura em troca da rota; os Barqueiros temem perder o comércio do Rio Velado.", witness: "Uma viúva viu a própria sombra embarcar na primeira barca.", memory: "Cada parada da procissão mostra uma perda que o grupo decidiu ignorar.", reward: "Cura de uma Fadiga grave e um juramento de abrigo dos Barqueiros.", escalation: "Se ninguém entrar na tumba antes do anoitecer, a procissão volta trazendo alguém que não deveria retornar." },
    { title: "Sal para os mortos", premise: "A água do pântano ficou doce e os mortos começaram a esquecer por que descansam.", pressure: "Os Coletores culpam a Cidadela; o Círculo suspeita de uma barganha feita para drenar a região.", witness: "Um guardião de túmulo carrega um frasco de sal com o brasão de um aliado do grupo.", memory: "Para restaurar o sal, alguém deve nomear uma perda que ainda tenta esconder.", reward: "Passagem segura pelos canais e uma vela que revela uma presença invisível.", escalation: "A cada noite, um túmulo abre e pede uma tarefa inacabada." },
  ],
};

const hookTones: Record<string, Tone[]> = {
  "A lista que cresce sozinha": ["Investigação", "Intriga"], "O quarto toque": ["Horror", "Investigação"], "Vidro sob a ponte": ["Investigação", "Intriga"],
  "A coroa sob as cinzas": ["Intriga", "Sobrevivência"], "O cavaleiro que não golpeia": ["Intriga", "Horror"], "Forja para ninguém": ["Sobrevivência", "Horror"],
  "A vela que não se apaga": ["Horror", "Investigação"], "O enterro que caminha": ["Horror", "Sobrevivência"], "Sal para os mortos": ["Sobrevivência", "Investigação"],
};

const tensionFactions = [
  { id: "conselho", name: "Conselho dos Marcos", note: "ordem e registro" },
  { id: "lanterna", name: "Lanterna de Sal", note: "vigília e contenção" },
  { id: "companhia", name: "Companhia do Sal Negro", note: "rotas e contratos" },
  { id: "vidreiros", name: "Vidreiros Errantes", note: "segredos e passagens" },
  { id: "velas", name: "Círculo das Velas Mortas", note: "nomes e luto" },
];

const ruptureConsequences: Record<string, { title: string; detail: string; prompt: string }> = {
  conselho: { title: "Edital de apagamento", detail: "O Conselho declara um registro como falso e inicia uma busca oficial por quem o preservou.", prompt: "Escolha qual prova será destruída, falsificada ou defendida antes da próxima travessia." },
  lanterna: { title: "Quarentena das margens", detail: "A Lanterna fecha rotas, recolhe luzes e transforma abrigo em suspeita para conter um perigo que ninguém consegue nomear.", prompt: "Defina quem fica preso do lado errado do rio e qual exceção custará um favor." },
  companhia: { title: "Pedágio de sal negro", detail: "A Companhia toma a rota mais segura e cobra memória, nome ou proteção de quem precisa atravessar.", prompt: "Determine o preço de uma passagem e quem será forçado a negociar primeiro." },
  vidreiros: { title: "Reflexos em fuga", detail: "Espelhos começam a mostrar versões dos heróis que aceitaram pactos diferentes, atraindo caçadores e testemunhas indesejadas.", prompt: "Escolha qual futuro possível invade a cena e que segredo ele revela." },
  velas: { title: "Vigília dos não lembrados", detail: "As velas do pântano chamam mortos sem nome para cobrar promessas deixadas sem resposta.", prompt: "Decida qual juramento retorna e quem será reconhecido por uma memória que nunca viveu." },
};

const tensionStages = ["Calma aparente", "Sussurros", "Pressão aberta", "Pânico", "Ruptura", "Confronto", "Consequência irreversível"];
const defaultTensions = { conselho: 1, lanterna: 1, companhia: 2, vidreiros: 1, velas: 1 };
const emptySession: SessionSummary = { title: "", happenings: "", decisions: "", nextScene: "" };
const defaultAlertPreferences: AlertPreferences = { sound: false, pulse: true };
const npcNames = ["Mara Veld", "Ivo Cantar", "Noa Cinzamar", "Rian da Ponte", "Talma Breu", "Elen Vidro", "Daro Avel", "Sila Orvalho", "Bren Salferro", "Yara Vau"];
const npcRoles = ["escrivã de marcos", "barqueiro de juramentos", "ferreira sem nome", "vigia de lanterna", "contrabandista de memória", "devota das velas", "batedor de cinzas", "curadora de Fadiga", "negociador da Cidadela", "mensageira do pântano"];
const npcAppearances = ["Dedos manchados de sal e um casaco que cheira a rio.", "Um olho de vidro negro e luvas de trabalho queimadas.", "Cabelos presos por uma tira de cobre; fala olhando para as rotas, não para as pessoas.", "Veste luto antigo, mas carrega uma lanterna impecável.", "Tem cinza sob as unhas e uma voz baixa demais para a distância."];
const npcDesires = ["proteger uma rota que mantém uma família inteira viva", "comprar de volta uma memória vendida", "provar que um juramento foi forjado", "tirar alguém do mapa antes que o Conselho o encontre", "impedir que uma fornalha receba mais um nome"];
const npcFears = ["ser lembrado pela pessoa errada", "perder o último vínculo com a própria origem", "ver sua facção transformar proteção em domínio", "descobrir que seu maior sacrifício não salvou ninguém", "ter de escolher entre uma cidade e uma pessoa"];
const npcSecrets = ["já ouviu o Sino de Namar chamar seu nome verdadeiro", "deve um favor ao Rei Sem Fornalha", "guardou uma vela com uma lembrança roubada", "falsificou um registro que agora está voltando à tona", "é a única testemunha de um pacto entre duas facções"];
const npcOffers = ["uma passagem discreta pelos marcos", "um mapa com uma rota que muda a cada lua", "uma verdade curta sobre o Eco sem Nome", "uma cura provisória para Fadiga", "um encontro seguro com alguém que não deveria ser encontrado"];
const npcBetrayals = ["entrega o grupo se a própria família for ameaçada", "omite o preço real do favor até a última cena", "segue uma ordem antiga que contradiz sua fala", "troca uma memória do grupo por proteção para si", "pede ajuda para testar se os Heróis merecem confiança"];

function pick<T>(items: T[]) { return items[Math.floor(Math.random() * items.length)]; }
function number(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(value: number, min: number, max: number) { return Math.min(Math.max(value, min), max); }
function safeLoad<T>(key: string, fallback: T): T { try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }

function dominantFaction(tensions: Record<string, number>) {
  return tensionFactions.reduce((leader, faction) => (tensions[faction.id] ?? 0) > (tensions[leader.id] ?? 0) ? faction : leader, tensionFactions[0]);
}

function createHook(territory: Territory, tone: Tone, tensions: Record<string, number> = defaultTensions): Hook {
  const candidates = hooksByTerritory[territory].filter((item) => tone === "Qualquer tom" || hookTones[item.title]?.includes(tone));
  const base = pick(candidates.length > 0 ? candidates : hooksByTerritory[territory]);
  const faction = dominantFaction(tensions);
  return { ...base, territory, factionId: faction.id, faction: faction.name, code: `G-${territory.slice(0, 2).toUpperCase()}-${number(11, 99)}` };
}

function createNpc(): Npc {
  const heart = number(1, 4);
  return { code: `NPC-${number(100, 999)}`, name: pick(npcNames), role: pick(npcRoles), appearance: pick(npcAppearances), desire: pick(npcDesires), fear: pick(npcFears), secret: pick(npcSecrets), offer: pick(npcOffers), betrayal: pick(npcBetrayals), profile: { body: number(1, 5), heart, wits: number(1, 5), resistance: 20 + heart, hope: 8 + heart } };
}

function formatNpcRecord(npc: Npc) {
  return `${npc.name} · ${npc.role} · ${npc.code}\nAparência: ${npc.appearance}\nDesejo: ${npc.desire}\nMedo: ${npc.fear}\nSegredo: ${npc.secret}\nOferta: ${npc.offer}\nTraição possível: ${npc.betrayal}\nCorpo ${npc.profile.body} · Coração ${npc.profile.heart} · Esperteza ${npc.profile.wits} · Resistência ${npc.profile.resistance} · Esperança ${npc.profile.hope}`;
}

function npcFromFavorite(favorite: Favorite): Npc {
  if (favorite.npc) return favorite.npc;
  const find = (label: string) => favorite.record.match(new RegExp(`${label}:\\s*(.+)`))?.[1] ?? "Não registrado";
  const stats = favorite.record.match(/Corpo\s+(\d+)\s+·\s+Coração\s+(\d+)\s+·\s+Esperteza\s+(\d+)\s+·\s+Resistência\s+(\d+)\s+·\s+Esperança\s+(\d+)/);
  return { code: favorite.id, name: favorite.title, role: favorite.summary || "NPC", appearance: find("Aparência"), desire: find("Desejo"), fear: find("Medo"), secret: find("Segredo"), offer: find("Oferta"), betrayal: find("Traição possível"), profile: { body: Number(stats?.[1] ?? 1), heart: Number(stats?.[2] ?? 1), wits: Number(stats?.[3] ?? 1), resistance: Number(stats?.[4] ?? 20), hope: Number(stats?.[5] ?? 8) } };
}

function CopyRecord({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard?.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1500); };
  return <button onClick={copy} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#83a89a] transition-colors hover:text-[#eae3d5]">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copiado" : "Copiar registro"}</button>;
}

export default function NarratorTools() {
  const [territory, setTerritory] = useState<Territory>("Véspera do Vau");
  const [tone, setTone] = useState<Tone>("Qualquer tom");
  const [tensions, setTensions] = useState<Record<string, number>>(() => safeLoad<Record<string, number>>("rpg-atlas-tension-v1", defaultTensions));
  const [hook, setHook] = useState<Hook>(() => createHook("Véspera do Vau", "Qualquer tom", defaultTensions));
  const [npc, setNpc] = useState<Npc>(() => createNpc());
  const [favorites, setFavorites] = useState<Favorite[]>(() => safeLoad<Favorite[]>("rpg-atlas-favorites-v1", []));
  const [sessionSummary, setSessionSummary] = useState<SessionSummary>(() => safeLoad<SessionSummary>("rpg-atlas-session-v1", emptySession));
  const [activeFactionId, setActiveFactionId] = useState("companhia");
  const [crises, setCrises] = useState<CrisisEvent[]>(() => safeLoad<CrisisEvent[]>("rpg-atlas-crises-v1", []));
  const [alertPreferences, setAlertPreferences] = useState<AlertPreferences>(() => safeLoad<AlertPreferences>("rpg-atlas-alerts-v1", defaultAlertPreferences));
  const [crisisFactionFilter, setCrisisFactionFilter] = useState("todas");
  const [crisisSessionFilter, setCrisisSessionFilter] = useState("todas");
  const [editingNpc, setEditingNpc] = useState<Npc | null>(null);
  const [editingFavoriteId, setEditingFavoriteId] = useState<string | null>(null);
  const [npcEditorOpen, setNpcEditorOpen] = useState(false);

  useEffect(() => { window.localStorage.setItem("rpg-atlas-favorites-v1", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { window.localStorage.setItem("rpg-atlas-tension-v1", JSON.stringify(tensions)); }, [tensions]);
  useEffect(() => { window.localStorage.setItem("rpg-atlas-session-v1", JSON.stringify(sessionSummary)); }, [sessionSummary]);
  useEffect(() => { window.localStorage.setItem("rpg-atlas-crises-v1", JSON.stringify(crises)); }, [crises]);
  useEffect(() => { window.localStorage.setItem("rpg-atlas-alerts-v1", JSON.stringify(alertPreferences)); }, [alertPreferences]);

  const hookText = `${hook.title}\n${hook.territory} · ${hook.code}\nTom: ${tone}\nFacção vinculada: ${hook.faction}\nPremissa: ${hook.premise}\nPressão: ${hook.pressure}\nTestemunha: ${hook.witness}\nMemória em risco: ${hook.memory}\nRecompensa: ${hook.reward}\nEscalada: ${hook.escalation}`;
  const npcText = formatNpcRecord(npc);
  const activeFaction = tensionFactions.find((faction) => faction.id === activeFactionId) ?? tensionFactions[0];
  const activeTension = tensions[activeFaction.id] ?? 0;
  const ruptureFactions = tensionFactions.filter((faction) => (tensions[faction.id] ?? 0) === 6);
  const crisisSessions = Array.from(new Set(crises.map((crisis) => crisis.session || "Sessão em curso")));
  const filteredCrises = crises.filter((crisis) => (crisisFactionFilter === "todas" || crisis.factionId === crisisFactionFilter) && (crisisSessionFilter === "todas" || (crisis.session || "Sessão em curso") === crisisSessionFilter));
  const activeFilteredCrises = filteredCrises.filter((crisis) => !crisis.resolved).length;
  const isSaved = (id: string) => favorites.some((favorite) => favorite.id === id);
  const toggleFavorite = (favorite: Favorite) => setFavorites((current) => current.some((item) => item.id === favorite.id) ? current.filter((item) => item.id !== favorite.id) : [favorite, ...current].slice(0, 16));
  const playRuptureSound = (force = false) => {
    if ((!force && !alertPreferences.sound) || typeof window === "undefined") return;
    try {
      const context = new AudioContext();
      const gain = context.createGain();
      const oscillator = context.createOscillator();
      const now = context.currentTime;
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(126, now);
      oscillator.frequency.exponentialRampToValueAtTime(82, now + 0.62);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.72);
      window.setTimeout(() => void context.close(), 900);
    } catch { /* O alerta visual permanece disponível quando o navegador bloqueia áudio. */ }
  };
  const registerRupture = (factionRef: string) => {
    const faction = tensionFactions.find((item) => item.id === factionRef || item.name === factionRef) ?? tensionFactions[0];
    const consequence = ruptureConsequences[faction.id];
    const entry: CrisisEvent = {
      id: `CR-${faction.id}-${Date.now()}`,
      factionId: faction.id,
      faction: faction.name,
      session: sessionSummary.title.trim() || "Sessão em curso",
      title: consequence.title,
      consequence: consequence.detail,
      timestamp: `Sessão atual · ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
      resolved: false,
    };
    setCrises((current) => current.some((item) => item.factionId === faction.id && !item.resolved) ? current : [entry, ...current].slice(0, 12));
    const diaryEntry = `Ruptura — ${faction.name}: ${consequence.title}. ${consequence.prompt}`;
    setSessionSummary((current) => ({ ...current, nextScene: current.nextScene.includes(diaryEntry) ? current.nextScene : [current.nextScene, diaryEntry].filter(Boolean).join("\n") }));
  };
  const changeTension = (id: string, delta: number) => {
    const currentValue = tensions[id] ?? 0;
    const nextValue = clamp(currentValue + delta, 0, 6);
    setTensions((current) => ({ ...current, [id]: nextValue }));
    if (delta > 0 && currentValue < 6 && nextValue === 6) {
      setActiveFactionId(id);
      registerRupture(id);
      playRuptureSound();
    }
  };
  const generateHook = (nextTerritory = territory, nextTone = tone) => { const generated = createHook(nextTerritory, nextTone, tensions); setHook(generated); setActiveFactionId(generated.factionId); };
  const resolveCrisis = (id: string) => setCrises((current) => current.map((crisis) => crisis.id === id ? { ...crisis, resolved: true } : crisis));
  const clearCrisisFilters = () => { setCrisisFactionFilter("todas"); setCrisisSessionFilter("todas"); };
  const exportCrises = () => {
    if (!crises.length) return;
    const openCrises = crises.filter((crisis) => !crisis.resolved).length;
    const content = [
      "# RPG Atlas — Histórico de Crises da Campanha",
      "",
      `Exportado em ${new Date().toLocaleString("pt-BR")}.`,
      "",
      "## Resumo",
      "",
      `- Crises registradas: ${crises.length}`,
      `- Crises em curso: ${openCrises}`,
      `- Crises resolvidas: ${crises.length - openCrises}`,
      "",
      "---",
      "",
      ...crises.flatMap((crisis, index) => [
        `## ${index + 1}. ${crisis.title}`,
        "",
        `> **Facção:** ${crisis.faction}  `,
        `> **Sessão:** ${crisis.session || "Sessão em curso"}  `,
        `> **Registro:** ${crisis.timestamp}  `,
        `> **Estado:** ${crisis.resolved ? "Resolvida" : "Em curso"}`,
        "",
        crisis.consequence,
        "",
      ]),
    ].join("\n");
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "rpg-atlas-historico-de-crises.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const exportFavorites = () => {
    if (!favorites.length) return;
    const content = ["# RPG Atlas — Registros Favoritos", "", `Exportado em ${new Date().toLocaleString("pt-BR")}.`, "", ...favorites.flatMap((favorite, index) => [`## ${index + 1}. ${favorite.kind} — ${favorite.title}`, "", `> ${favorite.summary}`, "", favorite.record, ""])].join("\n");
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "rpg-atlas-favoritos.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const openNpcEditor = (favorite: Favorite) => { setEditingFavoriteId(favorite.id); setEditingNpc(npcFromFavorite(favorite)); setNpcEditorOpen(true); };
  const saveNpcEdit = () => {
    if (!editingNpc || !editingFavoriteId) return;
    const updated: Favorite = { id: editingFavoriteId, kind: "NPC", title: editingNpc.name, summary: editingNpc.role, record: formatNpcRecord(editingNpc), npc: editingNpc };
    setFavorites((current) => current.map((favorite) => favorite.id === editingFavoriteId ? updated : favorite));
    setNpc(editingNpc);
    setNpcEditorOpen(false);
  };
  const duplicateCurrentNpc = () => {
    const duplicate = { ...npc, code: `NPC-${number(100, 999)}`, name: `${npc.name} · variação` };
    const favorite: Favorite = { id: duplicate.code, kind: "NPC", title: duplicate.name, summary: duplicate.role, record: formatNpcRecord(duplicate), npc: duplicate };
    setFavorites((current) => [favorite, ...current.filter((item) => item.id !== favorite.id)].slice(0, 16));
    setNpc(duplicate);
  };
  const hookFavorite: Favorite = { id: hook.code, kind: "Gancho", title: hook.title, summary: `${hook.territory} · ${tone} · ${hook.faction}`, record: hookText };
  const npcFavorite: Favorite = { id: npc.code, kind: "NPC", title: npc.name, summary: npc.role, record: npcText, npc };

  return (
    <section id="narrador" className="archive-paper relative text-[#161715]">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <div>
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a876d]"><span className="grid h-7 w-7 place-items-center border border-[#b55b32] font-serif text-[15px] text-[#b55b32]">N</span> 05 · estação do narrador · uso ao vivo</div>
            <h2 className="mt-5 font-serif text-[58px] leading-[0.88] tracking-[-0.05em] sm:text-[76px]">Ganchos, rostos<br />e consequências.</h2>
            <p className="mt-8 max-w-[420px] text-[17px] leading-8 text-[#484b45]">Ferramentas prontas para abrir uma cena quando a mesa toma um desvio inesperado. Todo resultado preserva o princípio de Veyr: ambiente, testemunha e memória em risco.</p>
            <div className="mt-10 border-y border-[#161715]/15 py-6 text-[13px] leading-6 text-[#585b53]"><strong className="font-semibold text-[#161715]">Procedimento:</strong> ajuste a tensão da facção, escolha o tom, gere o registro e salve apenas o que a sessão vai recuperar depois. Os dados ficam no armazenamento local deste navegador.</div>
            <div className="mt-8 border-l border-dashed border-[#7a876d]/70 pl-5"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#7a876d]">Marginalia de sessão · N-04</p><p className="mt-3 font-serif text-[25px] leading-[0.98] text-[#2d302c]">“Nenhuma consequência existe sem uma testemunha.”</p><p className="mt-4 text-[11px] leading-5 text-[#65675f]">Coord. 09°N / 13°R · Preserve o que a mesa não quer perder de vista.</p></div>
          </div>

          <div className="grid gap-7">
            <CampaignWorkbench />
            <article className="bg-[#171a18] p-6 text-[#eae3d5] sm:p-8">
              <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-start"><div className="flex items-start gap-3"><span className="relative grid h-9 w-9 shrink-0 place-items-center border border-[#b55b32]/65 font-serif text-[21px] text-[#eae3d5]"><span className="absolute inset-1 rounded-t-full border-x border-t border-[#83a89a]/55" />V</span><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#83a89a]"><Clock3 className="h-3.5 w-3.5" /> Relógio de consequências</div><h3 className="mt-3 font-serif text-[34px] leading-none">Tensão das facções</h3></div></div><span className="border border-[#b55b32]/45 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#d27648]">V-17 · persistente</span></div>
              <div className="mt-5 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#a6a397]">Alertas de Ruptura</p><p className="mt-1 max-w-[520px] text-[12px] leading-5 text-[#aaa79c]">Configure os efeitos antes da crise. O pulso evidencia registros ativos; o som só toca após uma interação da mesa e pode ser desativado a qualquer momento.</p></div><div className="flex shrink-0 flex-wrap gap-2"><button onClick={() => { const enabling = !alertPreferences.sound; setAlertPreferences((current) => ({ ...current, sound: enabling })); if (enabling) playRuptureSound(true); }} aria-pressed={alertPreferences.sound} className={`flex h-9 items-center gap-2 border px-3 text-[9px] font-bold uppercase tracking-[0.13em] transition-colors duration-150 ${alertPreferences.sound ? "border-[#ffb09d] bg-[#ffb09d] text-[#3b1d19]" : "border-white/20 text-[#c9c3b8] hover:border-[#ffb09d]/65 hover:text-[#ffb09d]"}`}>{alertPreferences.sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}{alertPreferences.sound ? "Som ativo" : "Ativar som"}</button><button onClick={() => setAlertPreferences((current) => ({ ...current, pulse: !current.pulse }))} aria-pressed={alertPreferences.pulse} className={`h-9 border px-3 text-[9px] font-bold uppercase tracking-[0.13em] transition-colors duration-150 ${alertPreferences.pulse ? "border-[#b55b32]/70 text-[#d27648]" : "border-white/20 text-[#c9c3b8] hover:border-[#d27648]/65 hover:text-[#d27648]"}`}>Pulso {alertPreferences.pulse ? "ativo" : "inativo"}</button></div></div>
              {ruptureFactions.length > 0 && <div className="mt-6 border-2 border-[#e0523f] bg-[#3b1d19] p-4 shadow-[5px_5px_0_rgba(224,82,63,0.2)]"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffb09d]"><AlertTriangle className="h-4 w-4" /> Ruptura detectada · ação imediata</div><div className="mt-4 grid gap-3">{ruptureFactions.map((faction) => <div key={faction.id} className="flex flex-col gap-3 border-t border-[#ffb09d]/25 pt-3 sm:flex-row sm:items-center sm:justify-between"><p className="font-serif text-[23px] leading-none text-[#f7dfd6]">{faction.name} <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffb09d]">em Ruptura</span></p><div className="flex gap-2"><button onClick={() => { setActiveFactionId(faction.id); registerRupture(faction.name); }} className="border border-[#ffb09d]/50 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.13em] text-[#ffb09d] hover:bg-[#ffb09d] hover:text-[#3b1d19]">Registrar no diário</button><button onClick={() => changeTension(faction.id, -1)} className="border border-[#ffb09d]/25 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.13em] text-[#f7dfd6] hover:bg-white/10">Voltar a Confronto</button></div></div>)}</div></div>}
              {ruptureFactions.length > 0 && <div className={`mt-4 border border-[#e0523f]/65 bg-[#261615] px-4 py-3 ${alertPreferences.pulse ? "rupture-pulse motion-reduce:animate-none" : ""}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.19em] text-[#ffb09d]">Consequência de Ruptura pronta</p><p className="mt-1 font-serif text-[24px] leading-none text-[#f7dfd6]">{ruptureConsequences[ruptureFactions[0].id].title}</p></div><div className="flex items-center gap-2"><button onClick={() => setAlertPreferences((current) => ({ ...current, sound: !current.sound }))} aria-pressed={alertPreferences.sound} className={`flex h-9 items-center gap-2 border px-3 text-[9px] font-bold uppercase tracking-[0.13em] ${alertPreferences.sound ? "border-[#ffb09d] bg-[#ffb09d] text-[#3b1d19]" : "border-[#ffb09d]/35 text-[#ffb09d]"}`}>{alertPreferences.sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}{alertPreferences.sound ? "Som ativo" : "Som silenciado"}</button><button onClick={() => setAlertPreferences((current) => ({ ...current, pulse: !current.pulse }))} aria-pressed={alertPreferences.pulse} className={`h-9 border px-3 text-[9px] font-bold uppercase tracking-[0.13em] ${alertPreferences.pulse ? "border-[#ffb09d] text-[#ffb09d]" : "border-white/20 text-[#c9c3b8]"}`}>Pulso {alertPreferences.pulse ? "ativo" : "inativo"}</button></div></div><p className="mt-3 text-[12px] leading-5 text-[#d6b4aa]">{ruptureConsequences[ruptureFactions[0].id].detail}</p></div>}
              <div className="mt-7 grid gap-6 md:grid-cols-[190px_1fr] md:items-center">
                <button onClick={() => changeTension(activeFaction.id, 1)} className={`group mx-auto grid h-[166px] w-[166px] place-items-center rounded-full p-2 transition-transform duration-200 hover:scale-[1.03] ${activeTension === 6 ? "ring-2 ring-[#e0523f] ring-offset-4 ring-offset-[#171a18]" : ""}`} style={{ background: `conic-gradient(${activeTension === 6 ? "#e0523f" : "#b55b32"} 0deg ${activeTension * 60}deg, rgba(234,227,213,0.13) ${activeTension * 60}deg 360deg)` }} aria-label={`Avançar tensão de ${activeFaction.name}`}>
                  <span className="grid h-[146px] w-[146px] place-items-center rounded-full bg-[#171a18] text-center"><span><b className="block font-serif text-[46px] leading-none text-[#d27648]">{activeTension}/6</b><span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-[#a6a397]">{tensionStages[activeTension]}</span></span></span>
                </button>
                <div className="grid border-t border-white/10 sm:grid-cols-2">{tensionFactions.map((faction, index) => { const value = tensions[faction.id] ?? 0; const active = faction.id === activeFaction.id; const rupture = value === 6; return <div key={faction.id} className={`group p-4 ${index < 4 ? "border-b border-white/10" : ""} ${index % 2 === 0 ? "sm:border-r" : ""} ${active ? "bg-white/[0.04]" : ""} ${rupture ? "bg-[#4a231c] ring-1 ring-inset ring-[#e0523f]" : ""}`}><button onClick={() => setActiveFactionId(faction.id)} className="w-full text-left"><div className="flex items-start justify-between gap-2"><p className={`font-serif text-[21px] leading-none ${rupture ? "text-[#ffb09d]" : active ? "text-[#eae3d5]" : "text-[#c0bcb0]"}`}>{faction.name}</p>{rupture && <AlertTriangle className="h-4 w-4 shrink-0 text-[#e0523f]" />}</div><p className="mt-2 text-[10px] uppercase tracking-[0.13em] text-[#85897f]">{rupture ? "Ruptura · consequência ativa" : faction.note}</p></button><div className="mt-4 flex items-center justify-between"><div className="flex gap-1">{Array.from({ length: 6 }, (_, mark) => <span key={mark} className={`h-1.5 w-4 ${mark < value ? rupture ? "bg-[#e0523f]" : "bg-[#b55b32]" : "bg-white/10"}`} />)}</div><div className="flex gap-1"><button onClick={() => changeTension(faction.id, -1)} disabled={value === 0} className="grid h-6 w-6 place-items-center border border-white/15 text-[#c9c3b8] disabled:opacity-30"><Minus className="h-3 w-3" /></button><button onClick={() => changeTension(faction.id, 1)} disabled={value === 6} className="grid h-6 w-6 place-items-center border border-[#b55b32]/60 text-[#d27648] disabled:opacity-30"><Plus className="h-3 w-3" /></button></div></div></div>; })}</div>
              </div>
              <p className="mt-6 border-t border-white/10 pt-4 text-[12px] leading-6 text-[#aaa79c]"><strong className={`font-semibold ${activeTension === 6 ? "text-[#ffb09d]" : "text-[#d8d2c6]"}`}>{activeFaction.name}:</strong> {activeTension === 6 ? "Ruptura. A facção exige uma consequência agora; registre a pressão no diário ou recue uma marca após resolver a cena." : `${tensionStages[activeTension]}. Clique no anel para avançar uma marca; use os controles de cada registro para retroceder ou calibrar a pressão.`}</p>
            </article>

            <article className="relative overflow-hidden border border-[#161715]/20 bg-[#ece4d6] p-6 sm:p-8">
              <div className="pointer-events-none absolute inset-0 opacity-50 [background:linear-gradient(90deg,rgba(22,23,21,0.045)_1px,transparent_1px),linear-gradient(rgba(22,23,21,0.035)_1px,transparent_1px)] [background-size:24px_24px]" />
              <div className="relative flex flex-col justify-between gap-5 border-b border-[#161715]/15 pb-5 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#b55b32]"><Clock3 className="h-3.5 w-3.5" /> Linha do tempo de crises</div><h3 className="mt-3 font-serif text-[34px] leading-none">O que já cobrou resposta.</h3></div><div className="flex flex-wrap items-center gap-3"><div className="border border-[#161715]/20 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#65675f]">{activeFilteredCrises} em curso</div><Button onClick={exportCrises} disabled={!crises.length} variant="outline" className="h-9 rounded-none border-[#161715]/30 bg-transparent px-3 text-[9px] font-bold uppercase tracking-[0.13em] text-[#161715] hover:bg-[#161715] hover:text-[#eae3d5] disabled:opacity-35"><Download className="mr-2 h-3.5 w-3.5" /> Exportar .md</Button></div></div>
              <p className="relative mt-4 max-w-[680px] text-[13px] leading-6 text-[#53564f]">Toda facção que atravessa a Ruptura deixa um registro permanente. As consequências pendentes alimentam a próxima cena; resolva-as somente quando a mesa tiver pago o preço ficcional.</p>
              <div className="relative mt-6 grid gap-3 border-y border-[#161715]/15 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#65675f]">Facção<select value={crisisFactionFilter} onChange={(event) => setCrisisFactionFilter(event.target.value)} className="h-10 border border-[#161715]/25 bg-[#f7efe3] px-3 text-[12px] font-semibold normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]"><option value="todas">Todas as facções</option>{tensionFactions.map((faction) => <option key={faction.id} value={faction.id}>{faction.name}</option>)}</select></label><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#65675f]">Sessão<select value={crisisSessionFilter} onChange={(event) => setCrisisSessionFilter(event.target.value)} className="h-10 border border-[#161715]/25 bg-[#f7efe3] px-3 text-[12px] font-semibold normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]"><option value="todas">Todas as sessões</option>{crisisSessions.map((session) => <option key={session} value={session}>{session}</option>)}</select></label><button onClick={clearCrisisFilters} disabled={crisisFactionFilter === "todas" && crisisSessionFilter === "todas"} className="h-10 border border-[#161715]/30 px-4 text-[9px] font-bold uppercase tracking-[0.13em] text-[#161715] hover:bg-[#161715] hover:text-[#eae3d5] disabled:opacity-35">Limpar filtros</button></div>
              <div className="relative mt-7 border-l border-dashed border-[#7a876d]/65 pl-6">{crises.length === 0 ? <div className="border border-[#161715]/15 bg-[#f4eee4]/70 p-5 text-[13px] leading-6 text-[#5e6058]">Nenhuma crise foi registrada. Ao elevar uma facção de Confronto para Ruptura, o painel cria uma entrada com consequência própria, horário e rastro no diário.</div> : filteredCrises.length === 0 ? <div className="border border-dashed border-[#161715]/25 bg-[#f4eee4]/70 p-5 text-[13px] leading-6 text-[#5e6058]">Nenhuma crise corresponde aos filtros atuais. Limpe a consulta para restaurar todo o histórico.</div> : <div className="grid gap-5">{filteredCrises.map((crisis) => <article key={crisis.id} className={`relative border p-5 ${crisis.resolved ? "border-[#7a876d]/25 bg-[#f2ece0]/65 opacity-70" : "border-[#b55b32]/45 bg-[#f7efe3] shadow-[4px_4px_0_rgba(181,91,50,0.14)]"}`}><span className={`absolute -left-[31px] top-6 grid h-3 w-3 place-items-center border-2 border-[#ece4d6] ${crisis.resolved ? "bg-[#83a89a]" : "bg-[#b55b32]"}`} /><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-3"><p className="font-serif text-[27px] leading-none text-[#161715]">{crisis.title}</p><span className="border border-[#b55b32]/35 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-[#8a4630]">{crisis.faction}</span><span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#7a876d]">{crisis.session || "Sessão em curso"}</span></div><p className="mt-3 max-w-[720px] text-[13px] leading-6 text-[#4e5149]">{crisis.consequence}</p></div><div className="shrink-0 text-left sm:text-right"><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#7a876d]">{crisis.timestamp}</p>{crisis.resolved ? <span className="mt-3 inline-block text-[9px] font-bold uppercase tracking-[0.14em] text-[#53776c]">Resolvida</span> : <button onClick={() => resolveCrisis(crisis.id)} className="mt-3 border border-[#161715]/30 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.13em] text-[#161715] hover:bg-[#161715] hover:text-[#eae3d5]">Encerrar crise</button>}</div></div></article>)}</div>}</div>
            </article>

            <article className="border border-[#161715]/20 bg-[#eee7db]/85 p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-5 border-b border-[#161715]/15 pb-5 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#b55b32]"><Dices className="h-3.5 w-3.5" /> Gerador de gancho</div><h3 className="mt-3 font-serif text-[34px] leading-none">Registro de incidente</h3></div><div className="flex items-center gap-4"><CopyRecord text={hookText} /><button onClick={() => toggleFavorite(hookFavorite)} className={`grid h-8 w-8 place-items-center border ${isSaved(hook.code) ? "border-[#b55b32] bg-[#b55b32] text-[#161715]" : "border-[#161715]/25 text-[#b55b32]"}`} aria-label="Salvar gancho nos favoritos"><Heart className={`h-4 w-4 ${isSaved(hook.code) ? "fill-current" : ""}`} /></button></div></div>
              <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#65675f]">Território<select value={territory} onChange={(event) => { const next = event.target.value as Territory; setTerritory(next); generateHook(next, tone); }} className="h-11 border border-[#161715]/25 bg-transparent px-3 text-[13px] font-semibold normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]">{(Object.keys(hooksByTerritory) as Territory[]).map((item) => <option key={item}>{item}</option>)}</select></label><label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#65675f]">Tom da aventura<select value={tone} onChange={(event) => { const next = event.target.value as Tone; setTone(next); generateHook(territory, next); }} className="h-11 border border-[#161715]/25 bg-transparent px-3 text-[13px] font-semibold normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]">{(["Qualquer tom", "Investigação", "Horror", "Intriga", "Sobrevivência"] as Tone[]).map((item) => <option key={item}>{item}</option>)}</select></label><Button onClick={() => generateHook()} className="h-11 rounded-none bg-[#b55b32] px-5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#161715] hover:bg-[#d27648]"><RefreshCw className="mr-2 h-4 w-4" /> Gerar</Button></div>
              <div className="mt-7 border-l-2 border-[#b55b32] pl-5"><div className="flex flex-wrap items-center gap-x-3 gap-y-2"><span className="font-serif text-[31px] leading-none">{hook.title}</span><span className="border border-[#b55b32]/35 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#b55b32]">{hook.code}</span><span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#7a876d]">{tone}</span></div><p className="mt-3 text-[15px] leading-7 text-[#3f423b]">{hook.premise}</p><div className="mt-4 flex items-center gap-2 border-t border-[#161715]/15 pt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6b6e66]"><span className="h-2 w-2 bg-[#b55b32]" /> Vínculo automático: <button onClick={() => setActiveFactionId(hook.factionId)} className="text-[#8a4630] underline decoration-dotted underline-offset-4">{hook.faction}</button> é a facção mais tensa.</div></div>
              <div className="mt-7 grid border-t border-[#161715]/15 sm:grid-cols-2">{[["Pressão", hook.pressure], ["Testemunha", hook.witness], ["Memória em risco", hook.memory], ["Recompensa", hook.reward], ["Escalada", hook.escalation]].map(([label, value], index) => <div key={label} className={`p-4 ${index < 4 ? "border-b border-[#161715]/15" : ""} ${index % 2 === 0 ? "sm:border-r" : ""}`}><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#7a876d]">{label}</p><p className="mt-2 text-[13px] leading-6 text-[#4e5149]">{value}</p></div>)}</div>
            </article>

            <article className="bg-[#171a18] p-6 text-[#eae3d5] sm:p-8">
              <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#83a89a]"><UserRound className="h-3.5 w-3.5" /> Ficha rápida de NPC</div><h3 className="mt-3 font-serif text-[34px] leading-none">Pessoa em foco</h3></div><div className="flex items-center gap-4"><CopyRecord text={npcText} /><button onClick={() => toggleFavorite(npcFavorite)} className={`grid h-8 w-8 place-items-center border ${isSaved(npc.code) ? "border-[#b55b32] bg-[#b55b32] text-[#161715]" : "border-[#eae3d5]/30 text-[#d27648]"}`} aria-label="Salvar NPC nos favoritos"><Heart className={`h-4 w-4 ${isSaved(npc.code) ? "fill-current" : ""}`} /></button></div></div>
              <div className="mt-6 flex justify-end"><Button onClick={() => setNpc(createNpc())} variant="outline" className="h-11 rounded-none border-[#eae3d5]/30 bg-transparent px-5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#eae3d5] hover:bg-[#eae3d5]/10 hover:text-[#f4eee4]"><RefreshCw className="mr-2 h-4 w-4" /> Gerar NPC</Button></div>
              <div className="mt-6 grid gap-6 md:grid-cols-[0.8fr_1.2fr]"><div className="border-l-2 border-[#83a89a] pl-5"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#83a89a]">{npc.code} · {npc.role}</p><h4 className="mt-3 font-serif text-[39px] leading-none">{npc.name}</h4><p className="mt-4 text-[14px] leading-6 text-[#b7b3a9]">{npc.appearance}</p><div className="mt-7 grid grid-cols-3 gap-2"><div><p className="text-[9px] uppercase tracking-[0.12em] text-[#85897f]">Corpo</p><p className="font-serif text-[28px] text-[#d27648]">{npc.profile.body}</p></div><div><p className="text-[9px] uppercase tracking-[0.12em] text-[#85897f]">Coração</p><p className="font-serif text-[28px] text-[#d27648]">{npc.profile.heart}</p></div><div><p className="text-[9px] uppercase tracking-[0.12em] text-[#85897f]">Esp.</p><p className="font-serif text-[28px] text-[#d27648]">{npc.profile.wits}</p></div></div></div><div className="grid gap-0 border-t border-white/10 sm:grid-cols-2">{[["Desejo", npc.desire], ["Medo", npc.fear], ["Segredo", npc.secret], ["Oferta", npc.offer], ["Traição", npc.betrayal]].map(([label, value], index) => <div key={label} className={`p-4 ${index < 4 ? "border-b border-white/10" : ""} ${index % 2 === 0 ? "sm:border-r" : ""}`}><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">{label}</p><p className="mt-2 text-[13px] leading-6 text-[#c9c3b8]">{value}</p></div>)}</div></div>
              <div className="mt-6 flex gap-6 border-t border-white/10 pt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a6a397]"><span>Resistência <strong className="ml-1 text-[#eae3d5]">{npc.profile.resistance}</strong></span><span>Esperança <strong className="ml-1 text-[#eae3d5]">{npc.profile.hope}</strong></span></div>
            </article>

            <article className="border border-[#161715]/20 bg-[#e3dccf]/90 p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 border-b border-[#161715]/15 pb-5 sm:flex-row sm:items-center"><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#b55b32]">Arquivo pessoal</p><h3 className="mt-2 font-serif text-[32px] leading-none">Favoritos da sessão <span className="text-[#b55b32]">{favorites.length}</span></h3></div><Button onClick={exportFavorites} disabled={!favorites.length} variant="outline" className="h-10 rounded-none border-[#161715]/30 bg-transparent px-4 text-[10px] font-bold uppercase tracking-[0.13em] text-[#161715] hover:bg-[#161715] hover:text-[#eae3d5] disabled:opacity-35"><Download className="mr-2 h-3.5 w-3.5" /> Exportar .md</Button></div>{favorites.length === 0 ? <p className="mt-6 text-[14px] leading-6 text-[#5e6058]">Nenhum registro salvo ainda. Use o selo de coração em um gancho ou NPC para mantê-lo disponível nesta sessão e nas próximas visitas neste navegador.</p> : <div className="mt-5 grid gap-3">{favorites.map((favorite) => <div key={favorite.id} className="flex items-start justify-between gap-4 border-l-2 border-[#b55b32] bg-[#eee7db] p-4"><button onClick={() => navigator.clipboard?.writeText(favorite.record)} className="text-left"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#7a876d]">{favorite.kind} · {favorite.summary}</p><p className="mt-2 font-serif text-[23px] leading-none">{favorite.title}</p></button><div className="flex shrink-0 gap-2">{favorite.kind === "NPC" && <button onClick={() => openNpcEditor(favorite)} className="grid h-8 w-8 place-items-center border border-[#b55b32]/45 text-[#8a4630] hover:bg-[#b55b32] hover:text-[#161715]" aria-label={`Editar ${favorite.title} na trilha lateral`}><PencilLine className="h-4 w-4" /></button>}<button onClick={() => setFavorites((current) => current.filter((item) => item.id !== favorite.id))} className="grid h-8 w-8 place-items-center border border-[#161715]/20 text-[#8a4630]" aria-label={`Remover ${favorite.title} dos favoritos`}><Trash2 className="h-4 w-4" /></button></div></div>)}</div>}</article>
            <Sheet open={npcEditorOpen} onOpenChange={setNpcEditorOpen}><SheetContent side="right" className="!w-full !max-w-[560px] !gap-0 !overflow-y-auto !border-l-[#b55b32]/60 !bg-[#171a18] !p-0 !text-[#eae3d5]"><SheetHeader className="border-b border-white/10 px-6 py-7"><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#83a89a]">Trilha lateral · edição de NPC</p><SheetTitle className="mt-2 font-serif text-[35px] font-medium leading-none !text-[#eae3d5]">Ajustar antes de exportar</SheetTitle><SheetDescription className="mt-3 max-w-[420px] text-[13px] leading-6 !text-[#aaa79c]">As alterações atualizam o registro favorito e a exportação em Markdown deste navegador.</SheetDescription></SheetHeader>{editingNpc && <div className="grid gap-5 px-6 py-7"><div className="grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">Nome<input value={editingNpc.name} onChange={(event) => setEditingNpc((current) => current ? { ...current, name: event.target.value } : current)} className="h-11 border border-white/15 bg-white/[0.03] px-3 text-[14px] font-medium normal-case tracking-normal text-[#eae3d5] outline-none focus:border-[#d27648]" /></label><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">Função<input value={editingNpc.role} onChange={(event) => setEditingNpc((current) => current ? { ...current, role: event.target.value } : current)} className="h-11 border border-white/15 bg-white/[0.03] px-3 text-[14px] font-medium normal-case tracking-normal text-[#eae3d5] outline-none focus:border-[#d27648]" /></label></div><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">Aparência<textarea value={editingNpc.appearance} onChange={(event) => setEditingNpc((current) => current ? { ...current, appearance: event.target.value } : current)} className="min-h-[74px] resize-y border border-white/15 bg-white/[0.03] p-3 text-[13px] leading-6 font-normal normal-case tracking-normal text-[#eae3d5] outline-none focus:border-[#d27648]" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">Desejo<textarea value={editingNpc.desire} onChange={(event) => setEditingNpc((current) => current ? { ...current, desire: event.target.value } : current)} className="min-h-[88px] resize-y border border-white/15 bg-white/[0.03] p-3 text-[13px] leading-6 font-normal normal-case tracking-normal text-[#eae3d5] outline-none focus:border-[#d27648]" /></label><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">Medo<textarea value={editingNpc.fear} onChange={(event) => setEditingNpc((current) => current ? { ...current, fear: event.target.value } : current)} className="min-h-[88px] resize-y border border-white/15 bg-white/[0.03] p-3 text-[13px] leading-6 font-normal normal-case tracking-normal text-[#eae3d5] outline-none focus:border-[#d27648]" /></label><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">Segredo<textarea value={editingNpc.secret} onChange={(event) => setEditingNpc((current) => current ? { ...current, secret: event.target.value } : current)} className="min-h-[88px] resize-y border border-white/15 bg-white/[0.03] p-3 text-[13px] leading-6 font-normal normal-case tracking-normal text-[#eae3d5] outline-none focus:border-[#d27648]" /></label><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">Oferta<textarea value={editingNpc.offer} onChange={(event) => setEditingNpc((current) => current ? { ...current, offer: event.target.value } : current)} className="min-h-[88px] resize-y border border-white/15 bg-white/[0.03] p-3 text-[13px] leading-6 font-normal normal-case tracking-normal text-[#eae3d5] outline-none focus:border-[#d27648]" /></label><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a] sm:col-span-2">Possível traição<textarea value={editingNpc.betrayal} onChange={(event) => setEditingNpc((current) => current ? { ...current, betrayal: event.target.value } : current)} className="min-h-[74px] resize-y border border-white/15 bg-white/[0.03] p-3 text-[13px] leading-6 font-normal normal-case tracking-normal text-[#eae3d5] outline-none focus:border-[#d27648]" /></label></div><div className="grid grid-cols-5 gap-2 border-y border-white/10 py-5">{(["body", "heart", "wits", "resistance", "hope"] as const).map((stat) => <label key={stat} className="flex flex-col gap-2 text-[8px] font-bold uppercase tracking-[0.12em] text-[#83a89a]">{stat === "body" ? "Corpo" : stat === "heart" ? "Coração" : stat === "wits" ? "Esperteza" : stat === "resistance" ? "Resist." : "Esperança"}<input type="number" min="0" value={editingNpc.profile[stat]} onChange={(event) => setEditingNpc((current) => current ? { ...current, profile: { ...current.profile, [stat]: Number(event.target.value) || 0 } } : current)} className="h-10 min-w-0 border border-white/15 bg-white/[0.03] px-2 text-center text-[14px] font-serif normal-case tracking-normal text-[#eae3d5] outline-none focus:border-[#d27648]" /></label>)}</div></div>}<SheetFooter className="border-t border-white/10 bg-[#131514] px-6 py-5"><Button onClick={saveNpcEdit} className="h-11 rounded-none bg-[#d27648] px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#171a18] hover:bg-[#e4936d]"><Save className="mr-2 h-4 w-4" /> Salvar no arquivo</Button></SheetFooter></SheetContent></Sheet>
            <article className="bg-[#171a18] p-6 text-[#eae3d5] sm:p-8"><div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#83a89a]"><FileText className="h-3.5 w-3.5" /> Diário da sessão</div><h3 className="mt-3 font-serif text-[34px] leading-none">Resumo em andamento</h3></div><span className="border border-[#83a89a]/45 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#83a89a]">salvo localmente</span></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a6a397] sm:col-span-2">Sessão<input value={sessionSummary.title} onChange={(event) => setSessionSummary((current) => ({ ...current, title: event.target.value }))} placeholder="Ex.: Sessão 04 — O quarto toque" className="h-11 border border-white/15 bg-white/[0.03] px-3 text-[14px] font-medium normal-case tracking-normal text-[#eae3d5] outline-none placeholder:text-[#777a72] focus:border-[#b55b32]" /></label><label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a6a397]">Acontecimentos principais<textarea value={sessionSummary.happenings} onChange={(event) => setSessionSummary((current) => ({ ...current, happenings: event.target.value }))} placeholder="O que mudou na história?" className="min-h-[118px] resize-y border border-white/15 bg-white/[0.03] p-3 text-[13px] leading-6 font-normal normal-case tracking-normal text-[#eae3d5] outline-none placeholder:text-[#777a72] focus:border-[#b55b32]" /></label><label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a6a397]">Decisões dos jogadores<textarea value={sessionSummary.decisions} onChange={(event) => setSessionSummary((current) => ({ ...current, decisions: event.target.value }))} placeholder="Que escolhas abriram ou fecharam rotas?" className="min-h-[118px] resize-y border border-white/15 bg-white/[0.03] p-3 text-[13px] leading-6 font-normal normal-case tracking-normal text-[#eae3d5] outline-none placeholder:text-[#777a72] focus:border-[#b55b32]" /></label><label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a6a397] sm:col-span-2">Próxima cena ou consequência<textarea value={sessionSummary.nextScene} onChange={(event) => setSessionSummary((current) => ({ ...current, nextScene: event.target.value }))} placeholder="O que deve cobrar resposta no próximo encontro?" className="min-h-[88px] resize-y border border-white/15 bg-white/[0.03] p-3 text-[13px] leading-6 font-normal normal-case tracking-normal text-[#eae3d5] outline-none placeholder:text-[#777a72] focus:border-[#b55b32]" /></label></div><div className="mt-5 flex justify-between border-t border-white/10 pt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a6a397]"><span>alterações salvas neste navegador</span><button onClick={() => setSessionSummary(emptySession)} className="text-[#d27648]">Limpar resumo</button></div></article>
          </div>
        </div>
      </div>
      <NpcPrintPreview npc={npc} onDuplicate={duplicateCurrentNpc} />
    </section>
  );
}
