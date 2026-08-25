/**
 * Design philosophy: Arquivo Obsidiano — session tools behave as indexed records,
 * not generic dashboard widgets. State remains private to the browser.
 */
import { useEffect, useState } from "react";
import { Check, Clock3, Copy, Dices, Heart, Minus, Plus, RefreshCw, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

type Territory = "Véspera do Vau" | "Ermo de Karzath" | "Velas Mortas";
type Tone = "Qualquer tom" | "Investigação" | "Horror" | "Intriga" | "Sobrevivência";
type FavoriteKind = "Gancho" | "NPC";

type Hook = {
  code: string;
  title: string;
  territory: Territory;
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

type Favorite = { id: string; kind: FavoriteKind; title: string; summary: string; record: string };

const hooksByTerritory: Record<Territory, Omit<Hook, "code" | "territory">[]> = {
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

const tensionStages = ["Calma aparente", "Sussurros", "Pressão aberta", "Pânico", "Ruptura", "Confronto", "Consequência irreversível"];
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

function createHook(territory: Territory, tone: Tone): Hook {
  const candidates = hooksByTerritory[territory].filter((item) => tone === "Qualquer tom" || hookTones[item.title]?.includes(tone));
  const base = pick(candidates.length > 0 ? candidates : hooksByTerritory[territory]);
  return { ...base, territory, code: `G-${territory.slice(0, 2).toUpperCase()}-${number(11, 99)}` };
}

function createNpc(): Npc {
  const heart = number(1, 4);
  return { code: `NPC-${number(100, 999)}`, name: pick(npcNames), role: pick(npcRoles), appearance: pick(npcAppearances), desire: pick(npcDesires), fear: pick(npcFears), secret: pick(npcSecrets), offer: pick(npcOffers), betrayal: pick(npcBetrayals), profile: { body: number(1, 5), heart, wits: number(1, 5), resistance: 20 + heart, hope: 8 + heart } };
}

function CopyRecord({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard?.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1500); };
  return <button onClick={copy} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#83a89a] transition-colors hover:text-[#eae3d5]">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copiado" : "Copiar registro"}</button>;
}

export default function NarratorTools() {
  const [territory, setTerritory] = useState<Territory>("Véspera do Vau");
  const [tone, setTone] = useState<Tone>("Qualquer tom");
  const [hook, setHook] = useState<Hook>(() => createHook("Véspera do Vau", "Qualquer tom"));
  const [npc, setNpc] = useState<Npc>(() => createNpc());
  const [favorites, setFavorites] = useState<Favorite[]>(() => safeLoad<Favorite[]>("rpg-atlas-favorites-v1", []));
  const [tensions, setTensions] = useState<Record<string, number>>(() => safeLoad<Record<string, number>>("rpg-atlas-tension-v1", { conselho: 1, lanterna: 1, companhia: 2, vidreiros: 1, velas: 1 }));
  const [activeFactionId, setActiveFactionId] = useState("companhia");

  useEffect(() => { window.localStorage.setItem("rpg-atlas-favorites-v1", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { window.localStorage.setItem("rpg-atlas-tension-v1", JSON.stringify(tensions)); }, [tensions]);

  const hookText = `${hook.title}\n${hook.territory} · ${hook.code}\nTom: ${tone}\nPremissa: ${hook.premise}\nPressão: ${hook.pressure}\nTestemunha: ${hook.witness}\nMemória em risco: ${hook.memory}\nRecompensa: ${hook.reward}\nEscalada: ${hook.escalation}`;
  const npcText = `${npc.name} · ${npc.role} · ${npc.code}\nAparência: ${npc.appearance}\nDesejo: ${npc.desire}\nMedo: ${npc.fear}\nSegredo: ${npc.secret}\nOferta: ${npc.offer}\nTraição possível: ${npc.betrayal}\nCorpo ${npc.profile.body} · Coração ${npc.profile.heart} · Esperteza ${npc.profile.wits} · Resistência ${npc.profile.resistance} · Esperança ${npc.profile.hope}`;
  const activeFaction = tensionFactions.find((faction) => faction.id === activeFactionId) ?? tensionFactions[0];
  const activeTension = tensions[activeFaction.id] ?? 0;
  const isSaved = (id: string) => favorites.some((favorite) => favorite.id === id);
  const toggleFavorite = (favorite: Favorite) => setFavorites((current) => current.some((item) => item.id === favorite.id) ? current.filter((item) => item.id !== favorite.id) : [favorite, ...current].slice(0, 16));
  const changeTension = (id: string, delta: number) => setTensions((current) => ({ ...current, [id]: clamp((current[id] ?? 0) + delta, 0, 6) }));

  const hookFavorite: Favorite = { id: hook.code, kind: "Gancho", title: hook.title, summary: `${hook.territory} · ${tone}`, record: hookText };
  const npcFavorite: Favorite = { id: npc.code, kind: "NPC", title: npc.name, summary: npc.role, record: npcText };

  return (
    <section id="narrador" className="archive-paper relative text-[#161715]">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <div>
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a876d]"><span className="grid h-7 w-7 place-items-center border border-[#b55b32] font-serif text-[15px] text-[#b55b32]">N</span> 05 · estação do narrador · uso ao vivo</div>
            <h2 className="mt-5 font-serif text-[58px] leading-[0.88] tracking-[-0.05em] sm:text-[76px]">Ganchos, rostos<br />e consequências.</h2>
            <p className="mt-8 max-w-[420px] text-[17px] leading-8 text-[#484b45]">Ferramentas prontas para abrir uma cena quando a mesa toma um desvio inesperado. Todo resultado preserva o princípio de Veyr: ambiente, testemunha e memória em risco.</p>
            <div className="mt-10 border-y border-[#161715]/15 py-6 text-[13px] leading-6 text-[#585b53]"><strong className="font-semibold text-[#161715]">Procedimento:</strong> ajuste a tensão da facção, escolha o tom, gere o registro e salve apenas o que a sessão vai recuperar depois. Os dados ficam no armazenamento local deste navegador.</div>
          </div>

          <div className="grid gap-7">
            <article className="bg-[#171a18] p-6 text-[#eae3d5] sm:p-8">
              <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#83a89a]"><Clock3 className="h-3.5 w-3.5" /> Relógio de consequências</div><h3 className="mt-3 font-serif text-[34px] leading-none">Tensão das facções</h3></div><span className="border border-[#b55b32]/45 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#d27648]">persistente</span></div>
              <div className="mt-7 grid gap-6 md:grid-cols-[190px_1fr] md:items-center">
                <button onClick={() => changeTension(activeFaction.id, 1)} className="group mx-auto grid h-[166px] w-[166px] place-items-center rounded-full p-2 transition-transform duration-200 hover:scale-[1.03]" style={{ background: `conic-gradient(#b55b32 0deg ${activeTension * 60}deg, rgba(234,227,213,0.13) ${activeTension * 60}deg 360deg)` }} aria-label={`Avançar tensão de ${activeFaction.name}`}>
                  <span className="grid h-[146px] w-[146px] place-items-center rounded-full bg-[#171a18] text-center"><span><b className="block font-serif text-[46px] leading-none text-[#d27648]">{activeTension}/6</b><span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-[#a6a397]">{tensionStages[activeTension]}</span></span></span>
                </button>
                <div className="grid border-t border-white/10 sm:grid-cols-2">{tensionFactions.map((faction, index) => { const value = tensions[faction.id] ?? 0; const active = faction.id === activeFaction.id; return <div key={faction.id} className={`group p-4 ${index < 4 ? "border-b border-white/10" : ""} ${index % 2 === 0 ? "sm:border-r" : ""} ${active ? "bg-white/[0.04]" : ""}`}><button onClick={() => setActiveFactionId(faction.id)} className="w-full text-left"><p className={`font-serif text-[21px] leading-none ${active ? "text-[#eae3d5]" : "text-[#c0bcb0]"}`}>{faction.name}</p><p className="mt-2 text-[10px] uppercase tracking-[0.13em] text-[#85897f]">{faction.note}</p></button><div className="mt-4 flex items-center justify-between"><div className="flex gap-1">{Array.from({ length: 6 }, (_, mark) => <span key={mark} className={`h-1.5 w-4 ${mark < value ? "bg-[#b55b32]" : "bg-white/10"}`} />)}</div><div className="flex gap-1"><button onClick={() => changeTension(faction.id, -1)} disabled={value === 0} className="grid h-6 w-6 place-items-center border border-white/15 text-[#c9c3b8] disabled:opacity-30"><Minus className="h-3 w-3" /></button><button onClick={() => changeTension(faction.id, 1)} disabled={value === 6} className="grid h-6 w-6 place-items-center border border-[#b55b32]/60 text-[#d27648] disabled:opacity-30"><Plus className="h-3 w-3" /></button></div></div></div>; })}</div>
              </div>
              <p className="mt-6 border-t border-white/10 pt-4 text-[12px] leading-6 text-[#aaa79c]"><strong className="font-semibold text-[#d8d2c6]">{activeFaction.name}:</strong> {tensionStages[activeTension]}. Clique no anel para avançar uma marca; use os controles de cada registro para retroceder ou calibrar a pressão.</p>
            </article>

            <article className="border border-[#161715]/20 bg-[#eee7db]/85 p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-5 border-b border-[#161715]/15 pb-5 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#b55b32]"><Dices className="h-3.5 w-3.5" /> Gerador de gancho</div><h3 className="mt-3 font-serif text-[34px] leading-none">Registro de incidente</h3></div><div className="flex items-center gap-4"><CopyRecord text={hookText} /><button onClick={() => toggleFavorite(hookFavorite)} className={`grid h-8 w-8 place-items-center border ${isSaved(hook.code) ? "border-[#b55b32] bg-[#b55b32] text-[#161715]" : "border-[#161715]/25 text-[#b55b32]"}`} aria-label="Salvar gancho nos favoritos"><Heart className={`h-4 w-4 ${isSaved(hook.code) ? "fill-current" : ""}`} /></button></div></div>
              <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#65675f]">Território<select value={territory} onChange={(event) => { const next = event.target.value as Territory; setTerritory(next); setHook(createHook(next, tone)); }} className="h-11 border border-[#161715]/25 bg-transparent px-3 text-[13px] font-semibold normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]">{(Object.keys(hooksByTerritory) as Territory[]).map((item) => <option key={item}>{item}</option>)}</select></label><label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#65675f]">Tom da aventura<select value={tone} onChange={(event) => { const next = event.target.value as Tone; setTone(next); setHook(createHook(territory, next)); }} className="h-11 border border-[#161715]/25 bg-transparent px-3 text-[13px] font-semibold normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]">{(["Qualquer tom", "Investigação", "Horror", "Intriga", "Sobrevivência"] as Tone[]).map((item) => <option key={item}>{item}</option>)}</select></label><Button onClick={() => setHook(createHook(territory, tone))} className="h-11 rounded-none bg-[#b55b32] px-5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#161715] hover:bg-[#d27648]"><RefreshCw className="mr-2 h-4 w-4" /> Gerar</Button></div>
              <div className="mt-7 border-l-2 border-[#b55b32] pl-5"><div className="flex flex-wrap items-center gap-x-3 gap-y-2"><span className="font-serif text-[31px] leading-none">{hook.title}</span><span className="border border-[#b55b32]/35 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#b55b32]">{hook.code}</span><span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#7a876d]">{tone}</span></div><p className="mt-3 text-[15px] leading-7 text-[#3f423b]">{hook.premise}</p></div>
              <div className="mt-7 grid border-t border-[#161715]/15 sm:grid-cols-2">{[["Pressão", hook.pressure], ["Testemunha", hook.witness], ["Memória em risco", hook.memory], ["Recompensa", hook.reward], ["Escalada", hook.escalation]].map(([label, value], index) => <div key={label} className={`p-4 ${index < 4 ? "border-b border-[#161715]/15" : ""} ${index % 2 === 0 ? "sm:border-r" : ""}`}><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#7a876d]">{label}</p><p className="mt-2 text-[13px] leading-6 text-[#4e5149]">{value}</p></div>)}</div>
            </article>

            <article className="bg-[#171a18] p-6 text-[#eae3d5] sm:p-8">
              <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#83a89a]"><UserRound className="h-3.5 w-3.5" /> Ficha rápida de NPC</div><h3 className="mt-3 font-serif text-[34px] leading-none">Pessoa em foco</h3></div><div className="flex items-center gap-4"><CopyRecord text={npcText} /><button onClick={() => toggleFavorite(npcFavorite)} className={`grid h-8 w-8 place-items-center border ${isSaved(npc.code) ? "border-[#b55b32] bg-[#b55b32] text-[#161715]" : "border-[#eae3d5]/30 text-[#d27648]"}`} aria-label="Salvar NPC nos favoritos"><Heart className={`h-4 w-4 ${isSaved(npc.code) ? "fill-current" : ""}`} /></button></div></div>
              <div className="mt-6 flex justify-end"><Button onClick={() => setNpc(createNpc())} variant="outline" className="h-11 rounded-none border-[#eae3d5]/30 bg-transparent px-5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#eae3d5] hover:bg-[#eae3d5]/10 hover:text-[#f4eee4]"><RefreshCw className="mr-2 h-4 w-4" /> Gerar NPC</Button></div>
              <div className="mt-6 grid gap-6 md:grid-cols-[0.8fr_1.2fr]"><div className="border-l-2 border-[#83a89a] pl-5"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#83a89a]">{npc.code} · {npc.role}</p><h4 className="mt-3 font-serif text-[39px] leading-none">{npc.name}</h4><p className="mt-4 text-[14px] leading-6 text-[#b7b3a9]">{npc.appearance}</p><div className="mt-7 grid grid-cols-3 gap-2"><div><p className="text-[9px] uppercase tracking-[0.12em] text-[#85897f]">Corpo</p><p className="font-serif text-[28px] text-[#d27648]">{npc.profile.body}</p></div><div><p className="text-[9px] uppercase tracking-[0.12em] text-[#85897f]">Coração</p><p className="font-serif text-[28px] text-[#d27648]">{npc.profile.heart}</p></div><div><p className="text-[9px] uppercase tracking-[0.12em] text-[#85897f]">Esp.</p><p className="font-serif text-[28px] text-[#d27648]">{npc.profile.wits}</p></div></div></div><div className="grid gap-0 border-t border-white/10 sm:grid-cols-2">{[["Desejo", npc.desire], ["Medo", npc.fear], ["Segredo", npc.secret], ["Oferta", npc.offer], ["Traição", npc.betrayal]].map(([label, value], index) => <div key={label} className={`p-4 ${index < 4 ? "border-b border-white/10" : ""} ${index % 2 === 0 ? "sm:border-r" : ""}`}><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">{label}</p><p className="mt-2 text-[13px] leading-6 text-[#c9c3b8]">{value}</p></div>)}</div></div>
              <div className="mt-6 flex gap-6 border-t border-white/10 pt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a6a397]"><span>Resistência <strong className="ml-1 text-[#eae3d5]">{npc.profile.resistance}</strong></span><span>Esperança <strong className="ml-1 text-[#eae3d5]">{npc.profile.hope}</strong></span></div>
            </article>

            <article className="border border-[#161715]/20 bg-[#e3dccf]/90 p-6 sm:p-8"><div className="flex items-center justify-between border-b border-[#161715]/15 pb-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#b55b32]">Arquivo pessoal</p><h3 className="mt-2 font-serif text-[32px] leading-none">Favoritos da sessão <span className="text-[#b55b32]">{favorites.length}</span></h3></div><Heart className="h-5 w-5 text-[#b55b32]" /></div>{favorites.length === 0 ? <p className="mt-6 text-[14px] leading-6 text-[#5e6058]">Nenhum registro salvo ainda. Use o selo de coração em um gancho ou NPC para mantê-lo disponível nesta sessão e nas próximas visitas neste navegador.</p> : <div className="mt-5 grid gap-3">{favorites.map((favorite) => <div key={favorite.id} className="flex items-start justify-between gap-4 border-l-2 border-[#b55b32] bg-[#eee7db] p-4"><button onClick={() => navigator.clipboard?.writeText(favorite.record)} className="text-left"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#7a876d]">{favorite.kind} · {favorite.summary}</p><p className="mt-2 font-serif text-[23px] leading-none">{favorite.title}</p></button><button onClick={() => setFavorites((current) => current.filter((item) => item.id !== favorite.id))} className="grid h-8 w-8 place-items-center border border-[#161715]/20 text-[#8a4630]" aria-label={`Remover ${favorite.title} dos favoritos`}><Trash2 className="h-4 w-4" /></button></div>)}</div>}</article>
          </div>
        </div>
      </div>
    </section>
  );
}
