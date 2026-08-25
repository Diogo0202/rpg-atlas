/**
 * Arquivo de Personagens — ficha local para crônicas V5 homebrew do RPG Atlas.
 * Dados e retratos permanecem no armazenamento deste navegador.
 */
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { BookOpen, Dices, Download, FolderOpen, History, ImagePlus, Plus, RefreshCw, Save, ShieldAlert, Sparkles, Trash2, Upload, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const attributeDefinitions = [
  { key: "forca", label: "Força" }, { key: "destreza", label: "Destreza" }, { key: "vigor", label: "Vigor" },
  { key: "carisma", label: "Carisma" }, { key: "manipulacao", label: "Manipulação" }, { key: "autocontrole", label: "Autocontrole" },
  { key: "inteligencia", label: "Inteligência" }, { key: "raciocinio", label: "Raciocínio" }, { key: "determinacao", label: "Determinação" },
] as const;

const skillDefinitions = [
  { key: "atletismo", label: "Atletismo" }, { key: "briga", label: "Briga" }, { key: "furtividade", label: "Furtividade" },
  { key: "conducao", label: "Condução" }, { key: "persuasao", label: "Persuasão" }, { key: "intimidacao", label: "Intimidação" },
  { key: "subterfugio", label: "Subterfúgio" }, { key: "empatia", label: "Empatia" }, { key: "investigacao", label: "Investigação" },
  { key: "ocultismo", label: "Ocultismo" }, { key: "tecnologia", label: "Tecnologia" }, { key: "sobrevivencia", label: "Sobrevivência" },
] as const;

type AttributeKey = (typeof attributeDefinitions)[number]["key"];
type SkillKey = (typeof skillDefinitions)[number]["key"];

type CharacterSheet = {
  id: string;
  name: string;
  concept: string;
  chronicle: string;
  clanId: string;
  hunger: number;
  portrait: string;
  notes: string;
  attributes: Record<AttributeKey, number>;
  skills: Record<SkillKey, number>;
  selectedPowerIds: string[];
  healthDamage: DamageMark[];
  willpowerDamage: DamageMark[];
};

type RollDie = { value: number; hunger: boolean };
type DamageMark = "clear" | "superficial" | "aggravated";
type RollHistoryEntry = { id: string; characterId: string; timestamp: string; action: string; basePool: number; penalty: number; finalPool: number; hungerDice: number; dice: RollDie[]; successes: number; verdict: string };

const homebrewClans = [
  {
    id: "sanguelume",
    name: "Sanguelume",
    epithet: "Cartógrafos do eclipse",
    bane: "Quando a Fome supera a Composição, cada reflexo revela uma rota que você jurou nunca percorrer.",
    discipline: "Voz de Sal · Bruma · Presságio",
    powers: [
      { id: "sal-da-passagem", name: "Sal da Passagem", cost: "1 de Fome", pool: "Manipulação + Ocultismo", text: "Marca uma porta, ponte ou soleira. Quem a atravessa deixa uma emoção recente como rastro no local." },
      { id: "mapa-velado", name: "Mapa Velado", cost: "Teste de Fome", pool: "Raciocínio + Investigação", text: "Revela a rota segura para uma pessoa, mas a rota exige que algo igualmente importante fique para trás." },
      { id: "eclipse-menor", name: "Eclipse Menor", cost: "2 de Fome", pool: "Carisma + Subterfúgio", text: "Apaga a lembrança de um encontro recente por uma cena, deixando uma lacuna que todos reconhecem, mas ninguém explica." },
    ],
  },
  {
    id: "ferrovelho",
    name: "Ferrovelho",
    epithet: "Herdeiros das fornalhas silenciosas",
    bane: "O cheiro de metal queimado denuncia a presença do clã sempre que uma promessa é quebrada perto de você.",
    discipline: "Ferro · Comando · Cinza",
    powers: [
      { id: "juramento-temperado", name: "Juramento Temperado", cost: "1 de Fome", pool: "Determinação + Intimidação", text: "Transforma uma promessa verbal em marca visível de cobre. A quebra cobra uma complicação narrativa imediata." },
      { id: "manto-de-escoria", name: "Manto de Escória", cost: "Teste de Fome", pool: "Vigor + Sobrevivência", text: "Seu corpo ganha proteção mineral até o fim da cena, mas a Fome passa a ser vista em sua pele." },
      { id: "voz-da-fornalha", name: "Voz da Fornalha", cost: "2 de Fome", pool: "Carisma + Persuasão", text: "Um objeto metálico responde a uma pergunta sobre quem o tocou por último e qual medo essa pessoa escondia." },
    ],
  },
  {
    id: "orvalhonegro",
    name: "Orvalho Negro",
    epithet: "Devotos das velas sem nome",
    bane: "Ao falhar em um teste envolvendo empatia, você herda por uma noite a memória mais dolorosa da pessoa observada.",
    discipline: "Luto · Véu · Vigília",
    powers: [
      { id: "vela-de-retorno", name: "Vela de Retorno", cost: "1 de Fome", pool: "Autocontrole + Ocultismo", text: "Acende uma chama que aponta para a perda que move uma cena. Ela não revela nomes, apenas a direção da ausência." },
      { id: "vigilia-partilhada", name: "Vigília Partilhada", cost: "Teste de Fome", pool: "Carisma + Empatia", text: "Divide uma condição de medo ou Fadiga entre os presentes que aceitarem encarar a mesma lembrança." },
      { id: "nome-no-lodo", name: "Nome no Lodo", cost: "2 de Fome", pool: "Manipulação + Subterfúgio", text: "Faz uma identidade recente desaparecer dos registros de uma comunidade até o próximo amanhecer." },
    ],
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function createDefaultSheet(): CharacterSheet {
  return {
    id: `pc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "Lia Vesper",
    concept: "Escrivã que coleciona promessas quebradas",
    chronicle: "A Coroa Partida",
    clanId: "sanguelume",
    hunger: 2,
    portrait: "",
    notes: "O Sino de Namar já chamou meu nome uma vez. Não pretendo atender de novo.",
    attributes: { forca: 2, destreza: 3, vigor: 2, carisma: 3, manipulacao: 2, autocontrole: 3, inteligencia: 3, raciocinio: 2, determinacao: 2 },
    skills: { atletismo: 1, briga: 1, furtividade: 2, conducao: 0, persuasao: 2, intimidacao: 1, subterfugio: 3, empatia: 2, investigacao: 3, ocultismo: 2, tecnologia: 1, sobrevivencia: 0 },
    selectedPowerIds: ["sal-da-passagem"],
    healthDamage: Array.from({ length: 7 }, () => "clear"),
    willpowerDamage: Array.from({ length: 6 }, () => "clear"),
  };
}

function safeLoad<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeSheet(candidate: Partial<CharacterSheet>): CharacterSheet {
  const fallback = createDefaultSheet();
  return {
    ...fallback,
    ...candidate,
    id: candidate.id || fallback.id,
    attributes: { ...fallback.attributes, ...(candidate.attributes ?? {}) },
    skills: { ...fallback.skills, ...(candidate.skills ?? {}) },
    healthDamage: candidate.healthDamage?.length ? candidate.healthDamage : fallback.healthDamage,
    willpowerDamage: candidate.willpowerDamage?.length ? candidate.willpowerDamage : fallback.willpowerDamage,
  };
}

function summarizeDice(dice: RollDie[]) {
  const successes = dice.reduce((total, die) => total + (die.value >= 6 ? 1 : 0), 0);
  const tens = dice.filter((die) => die.value === 10).length;
  const totalSuccesses = successes + Math.floor(tens / 2) * 2;
  const bestialFailure = dice.some((die) => die.hunger && die.value === 1) && totalSuccesses === 0;
  const messyCritical = dice.some((die) => die.hunger && die.value === 10) && tens >= 2;
  return { totalSuccesses, bestialFailure, messyCritical, verdict: messyCritical ? "Crítico bagunçado" : bestialFailure ? "Falha bestial" : totalSuccesses > 0 ? "Êxito registrado" : "Falha" };
}

function DamageTracker({ title, subtitle, marks, onCycle }: { title: string; subtitle: string; marks: DamageMark[]; onCycle: (index: number) => void }) {
  const superficial = marks.filter((mark) => mark === "superficial").length;
  const aggravated = marks.filter((mark) => mark === "aggravated").length;
  return <div className="relative overflow-hidden border border-white/10 bg-[#111312]/70 p-5"><span className="absolute right-4 top-4 text-[8px] font-bold uppercase tracking-[0.18em] text-[#83a89a]/65">registro clínico</span><div className="flex items-start justify-between gap-4"><div><p className="font-serif text-[27px] leading-none text-[#f4eee4]">{title}</p><p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#a6a397]">{subtitle}</p></div><div className="mr-16 text-right text-[9px] font-bold uppercase tracking-[0.13em]"><p className="text-[#d8d2c6]">{superficial} superficial</p><p className="mt-1 text-[#d27648]">{aggravated} agravado</p></div></div><div className="mt-5 border-y border-white/10 py-4"><div className="flex flex-wrap gap-2">{marks.map((mark, index) => <button key={index} onClick={() => onCycle(index)} aria-label={`${title}, caixa ${index + 1}: ${mark === "clear" ? "vazia" : mark === "superficial" ? "dano superficial" : "dano agravado"}. Clique para alterar.`} className={`grid h-9 w-9 place-items-center border font-serif text-[22px] transition-colors duration-150 ${mark === "aggravated" ? "border-[#b55b32] bg-[#3b1d19] text-[#ffb09d]" : mark === "superficial" ? "border-[#83a89a] bg-[#83a89a]/15 text-[#d8d2c6]" : "border-white/20 text-[#6e7169] hover:border-[#d8d2c6]"}`}>{mark === "aggravated" ? "X" : mark === "superficial" ? "/" : "·"}</button>)}</div></div><p className="mt-4 text-[10px] leading-5 text-[#85897f]">Clique nas caixas para alternar: vazia → superficial → agravado → vazia.</p></div>;
}

export default function CharacterArchive() {
  const [sheet, setSheet] = useState<CharacterSheet>(() => normalizeSheet(safeLoad<Partial<CharacterSheet>>("rpg-atlas-v5-sheet-v1", createDefaultSheet())));
  const [savedSheets, setSavedSheets] = useState<CharacterSheet[]>(() => safeLoad<Partial<CharacterSheet>[]>("rpg-atlas-v5-sheets-v1", []).map(normalizeSheet));
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeKey>("manipulacao");
  const [selectedSkill, setSelectedSkill] = useState<SkillKey>("subterfugio");
  const [isRolling, setIsRolling] = useState(false);
  const [roll, setRoll] = useState<RollDie[]>([]);
  const [rollHistory, setRollHistory] = useState<RollHistoryEntry[]>(() => safeLoad<RollHistoryEntry[]>("rpg-atlas-v5-roll-history-v1", []));
  const [portraitNotice, setPortraitNotice] = useState("Retrato local · permanece neste navegador");

  useEffect(() => {
    try {
      window.localStorage.setItem("rpg-atlas-v5-sheet-v1", JSON.stringify(sheet));
    } catch {
      setPortraitNotice("O retrato ficou grande demais para salvar localmente; reduza a imagem e tente novamente.");
    }
  }, [sheet]);

  useEffect(() => {
    try {
      window.localStorage.setItem("rpg-atlas-v5-sheets-v1", JSON.stringify(savedSheets));
    } catch {
      setPortraitNotice("Não foi possível atualizar o cofre local. Reduza o tamanho dos retratos salvos.");
    }
  }, [savedSheets]);

  useEffect(() => {
    window.localStorage.setItem("rpg-atlas-v5-roll-history-v1", JSON.stringify(rollHistory));
  }, [rollHistory]);

  const clan = homebrewClans.find((item) => item.id === sheet.clanId) ?? homebrewClans[0];
  const markedHealth = sheet.healthDamage.filter((mark) => mark !== "clear").length;
  const markedWillpower = sheet.willpowerDamage.filter((mark) => mark !== "clear").length;
  const healthPenalty = markedHealth >= 5 ? (markedHealth === sheet.healthDamage.length ? 2 : 1) : 0;
  const willpowerPenalty = markedWillpower >= 4 ? (markedWillpower === sheet.willpowerDamage.length ? 2 : 1) : 0;
  const damagePenalty = Math.min(3, healthPenalty + willpowerPenalty);
  const basePool = sheet.attributes[selectedAttribute] + sheet.skills[selectedSkill];
  const pool = Math.max(1, basePool - damagePenalty);
  const hungerDice = Math.min(pool, sheet.hunger);
  const regularDice = Math.max(0, pool - hungerDice);
  const selectedAttributeLabel = attributeDefinitions.find((attribute) => attribute.key === selectedAttribute)?.label ?? "Atributo";
  const selectedSkillLabel = skillDefinitions.find((skill) => skill.key === selectedSkill)?.label ?? "Perícia";
  const { totalSuccesses, bestialFailure, messyCritical } = useMemo(() => summarizeDice(roll), [roll]);
  const characterHistory = rollHistory.filter((entry) => entry.characterId === sheet.id).slice(0, 12);

  const updateAttribute = (key: AttributeKey, value: number) => setSheet((current) => ({ ...current, attributes: { ...current.attributes, [key]: clamp(value, 1, 5) } }));
  const updateSkill = (key: SkillKey, value: number) => setSheet((current) => ({ ...current, skills: { ...current.skills, [key]: clamp(value, 0, 5) } }));
  const changeClan = (clanId: string) => setSheet((current) => ({ ...current, clanId, selectedPowerIds: [] }));
  const togglePower = (powerId: string) => setSheet((current) => ({ ...current, selectedPowerIds: current.selectedPowerIds.includes(powerId) ? current.selectedPowerIds.filter((id) => id !== powerId) : [...current.selectedPowerIds, powerId] }));
  const createNewSheet = () => { setSheet({ ...createDefaultSheet(), name: "Novo personagem", concept: "Conceito em aberto", notes: "" }); setRoll([]); setPortraitNotice("Nova ficha aberta · salve no cofre quando estiver pronta"); };
  const saveSheet = () => {
    const savedCopy = normalizeSheet(sheet);
    setSavedSheets((current) => [savedCopy, ...current.filter((item) => item.id !== savedCopy.id)].slice(0, 16));
    setPortraitNotice(`${savedCopy.name || "Ficha sem nome"} · registro salvo no cofre local`);
  };
  const loadSheet = (id: string) => {
    const selected = savedSheets.find((item) => item.id === id);
    if (!selected) return;
    setSheet(normalizeSheet(selected));
    setRoll([]);
    setPortraitNotice(`${selected.name || "Ficha sem nome"} · registro carregado`);
  };
  const deleteSheet = (id: string) => setSavedSheets((current) => current.filter((item) => item.id !== id));
  const downloadJson = (payload: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const exportSheet = () => downloadJson({ format: "rpg-atlas-v5-character", version: 1, exportedAt: new Date().toISOString(), character: sheet }, `${(sheet.name || "personagem").trim().toLowerCase().replace(/\s+/g, "-") || "personagem"}-rpg-atlas.json`);
  const exportVault = () => downloadJson({ format: "rpg-atlas-v5-vault", version: 1, exportedAt: new Date().toISOString(), characters: [sheet, ...savedSheets.filter((item) => item.id !== sheet.id)] }, "rpg-atlas-cofre-de-personagens.json");
  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) { setPortraitNotice("O arquivo JSON excede 1,5 MB. Revise os retratos embutidos antes de importar."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result ?? "{}")) as { character?: Partial<CharacterSheet>; characters?: Partial<CharacterSheet>[] } | Partial<CharacterSheet>;
        const candidates = Array.isArray((payload as { characters?: Partial<CharacterSheet>[] }).characters) ? (payload as { characters: Partial<CharacterSheet>[] }).characters : (payload as { character?: Partial<CharacterSheet> }).character ? [(payload as { character: Partial<CharacterSheet> }).character] : [payload as Partial<CharacterSheet>];
        const imported = candidates.filter((candidate) => candidate && typeof candidate === "object" && candidate.attributes && candidate.skills).map((candidate) => ({ ...normalizeSheet(candidate), id: `pc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }));
        if (!imported.length) { setPortraitNotice("Nenhuma ficha V5 reconhecida foi encontrada neste arquivo JSON."); return; }
        setSavedSheets((current) => [...imported, ...current].slice(0, 16));
        setSheet(imported[0]);
        setRoll([]);
        setPortraitNotice(`${imported.length} ficha${imported.length > 1 ? "s" : ""} importada${imported.length > 1 ? "s" : ""} para o cofre local`);
      } catch {
        setPortraitNotice("Não foi possível ler este JSON. Verifique se ele foi exportado pelo RPG Atlas.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handlePortrait = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 850_000) {
      setPortraitNotice("Use uma imagem de até 850 KB para que o retrato possa permanecer salvo neste navegador.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSheet((current) => ({ ...current, portrait: String(reader.result ?? "") }));
      setPortraitNotice(`${file.name} · retrato local salvo`);
    };
    reader.readAsDataURL(file);
  };

  const rollPool = (attribute: AttributeKey, skill: SkillKey) => {
    const quickBasePool = sheet.attributes[attribute] + sheet.skills[skill];
    const quickPool = Math.max(1, quickBasePool - damagePenalty);
    const quickHungerDice = Math.min(quickPool, sheet.hunger);
    setSelectedAttribute(attribute);
    setSelectedSkill(skill);
    setIsRolling(true);
    setRoll([]);
    window.setTimeout(() => {
      const nextRoll = Array.from({ length: quickPool }, (_, index) => ({ value: Math.floor(Math.random() * 10) + 1, hunger: index < quickHungerDice }));
      setRoll(nextRoll);
      const outcome = summarizeDice(nextRoll);
      setRollHistory((current) => [{ id: `roll-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, characterId: sheet.id, timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), action: `${attributeDefinitions.find((item) => item.key === attribute)?.label ?? "Atributo"} + ${skillDefinitions.find((item) => item.key === skill)?.label ?? "Perícia"}`, basePool: quickBasePool, penalty: damagePenalty, finalPool: quickPool, hungerDice: quickHungerDice, dice: nextRoll, successes: outcome.totalSuccesses, verdict: outcome.verdict }, ...current].slice(0, 120));
      setIsRolling(false);
    }, 620);
  };
  const rollDice = () => rollPool(selectedAttribute, selectedSkill);
  const cycleDamage = (track: "healthDamage" | "willpowerDamage", index: number) => setSheet((current) => {
    const nextMarks = [...current[track]];
    nextMarks[index] = nextMarks[index] === "clear" ? "superficial" : nextMarks[index] === "superficial" ? "aggravated" : "clear";
    return { ...current, [track]: nextMarks };
  });

  return (
    <section id="fichas" className="relative overflow-hidden bg-[#111312] text-[#eae3d5]">
      <div className="pointer-events-none absolute inset-0 dossier-grid opacity-25" />
      <div className="relative mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#83a89a]"><span className="grid h-7 w-7 place-items-center border border-[#b55b32] font-serif text-[15px] text-[#d27648]">V</span> 06 · arquivo de personagens · V5</div>
            <h2 className="mt-5 font-serif text-[54px] leading-[0.88] tracking-[-0.05em] text-[#f4eee4] sm:text-[76px]">Um nome,<br />uma Fome,<br />um dossiê.</h2>
          </div>
          <p className="max-w-[620px] text-[17px] leading-8 text-[#b8b3a8]">Crie um personagem, consulte o material homebrew do atlas e registre retrato, escolhas e poderes no mesmo arquivo. A reserva de dados acompanha o teste escolhido e separa automaticamente os dados de Fome.</p>
        </div>

        <div className="mt-12 grid gap-7 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="dossier-grid relative overflow-hidden border border-white/10 bg-[#171a18] p-6 sm:p-8">
            <div className="absolute right-5 top-5 text-[8px] font-bold uppercase tracking-[0.17em] text-[#83a89a]/70">registro particular</div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#83a89a]"><UserRound className="h-3.5 w-3.5" /> Identidade e retrato</div>
            <div className="mt-7 grid gap-6 sm:grid-cols-[160px_1fr]">
              <div>
                <label className="group relative grid aspect-square w-full place-items-center overflow-hidden border border-dashed border-[#83a89a]/55 bg-[#0f1110] text-center">
                  <input className="sr-only" type="file" accept="image/*" onChange={handlePortrait} />
                  {sheet.portrait ? <img src={sheet.portrait} alt={`Retrato de ${sheet.name || "personagem"}`} className="h-full w-full object-cover" /> : <div className="px-5"><ImagePlus className="mx-auto h-7 w-7 text-[#d27648]" /><p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#d8d2c6]">Carregar retrato</p></div>}
                  <span className="absolute inset-x-0 bottom-0 bg-[#111312]/90 px-2 py-2 text-[8px] font-bold uppercase tracking-[0.13em] text-[#a9c7bb] opacity-0 transition-opacity duration-150 group-hover:opacity-100">trocar imagem</span>
                </label>
                <p className="mt-3 text-[9px] leading-4 text-[#85897f]">{portraitNotice}</p>
              </div>
              <div className="grid gap-4">
                <label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#a6a397]">Nome<input value={sheet.name} onChange={(event) => setSheet((current) => ({ ...current, name: event.target.value }))} className="h-11 border border-white/15 bg-white/[0.03] px-3 text-[15px] font-serif normal-case tracking-normal text-[#f4eee4] outline-none focus:border-[#b55b32]" /></label>
                <label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#a6a397]">Conceito<input value={sheet.concept} onChange={(event) => setSheet((current) => ({ ...current, concept: event.target.value }))} className="h-11 border border-white/15 bg-white/[0.03] px-3 text-[13px] normal-case tracking-normal text-[#eae3d5] outline-none focus:border-[#b55b32]" /></label>
                <div className="grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#a6a397]">Crônica<input value={sheet.chronicle} onChange={(event) => setSheet((current) => ({ ...current, chronicle: event.target.value }))} className="h-11 border border-white/15 bg-white/[0.03] px-3 text-[13px] normal-case tracking-normal text-[#eae3d5] outline-none focus:border-[#b55b32]" /></label><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#a6a397]">Clã<select value={sheet.clanId} onChange={(event) => changeClan(event.target.value)} className="h-11 border border-white/15 bg-[#171a18] px-3 text-[13px] font-semibold normal-case tracking-normal text-[#eae3d5] outline-none focus:border-[#b55b32]">{homebrewClans.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
              </div>
            </div>
            <div className="mt-7 border-t border-white/10 pt-5"><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#a6a397]">Registro privado<textarea value={sheet.notes} onChange={(event) => setSheet((current) => ({ ...current, notes: event.target.value }))} className="min-h-[92px] resize-y border border-white/15 bg-white/[0.03] p-3 text-[13px] leading-6 font-normal normal-case tracking-normal text-[#d8d2c6] outline-none focus:border-[#b55b32]" /></label></div>
            <div className="mt-7 border-t border-white/10 pt-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#a9c7bb]"><FolderOpen className="h-3.5 w-3.5" /> Cofre local de fichas <span className="border border-[#83a89a]/40 px-1.5 py-0.5 text-[8px] text-[#83a89a]">{String(savedSheets.length).padStart(2, "0")} REG.</span></div><p className="mt-2 text-[11px] leading-5 text-[#a6a397]">Os personagens salvos ficam neste navegador e podem ser reabertos em sessões futuras.</p></div><div className="flex shrink-0 gap-2"><Button onClick={createNewSheet} variant="outline" className="h-9 rounded-none border-white/20 bg-transparent px-3 text-[9px] font-bold uppercase tracking-[0.13em] text-[#eae3d5] hover:bg-white/10"><Plus className="mr-2 h-3.5 w-3.5" /> Nova</Button><Button onClick={saveSheet} className="h-9 rounded-none bg-[#b55b32] px-3 text-[9px] font-bold uppercase tracking-[0.13em] text-[#111312] hover:bg-[#d27648]"><Save className="mr-2 h-3.5 w-3.5" /> Autenticar</Button></div></div><div className="mt-4 flex flex-wrap gap-2 border-y border-white/10 py-3"><Button onClick={exportSheet} variant="outline" className="h-8 rounded-none border-white/15 bg-transparent px-3 text-[8px] font-bold uppercase tracking-[0.13em] text-[#d8d2c6] hover:bg-white/10"><Download className="mr-2 h-3.5 w-3.5 text-[#83a89a]" /> Exportar ficha</Button><Button onClick={exportVault} variant="outline" className="h-8 rounded-none border-white/15 bg-transparent px-3 text-[8px] font-bold uppercase tracking-[0.13em] text-[#d8d2c6] hover:bg-white/10"><Download className="mr-2 h-3.5 w-3.5 text-[#83a89a]" /> Backup do cofre</Button><label className="inline-flex h-8 items-center border border-white/15 px-3 text-[8px] font-bold uppercase tracking-[0.13em] text-[#d8d2c6] hover:bg-white/10"><Upload className="mr-2 h-3.5 w-3.5 text-[#83a89a]" /> Importar JSON<input className="sr-only" type="file" accept="application/json,.json" onChange={handleImport} /></label></div>{savedSheets.length === 0 ? <p className="mt-5 border border-dashed border-white/15 p-4 text-[11px] leading-5 text-[#a6a397]">O cofre ainda está vazio. Use “Autenticar” para manter este personagem acessível depois que a sessão terminar.</p> : <div className="mt-5 grid gap-2">{savedSheets.map((saved, index) => <div key={saved.id} className={`flex items-center justify-between gap-3 border p-3 ${saved.id === sheet.id ? "border-[#b55b32]/65 bg-[#b55b32]/10" : "border-white/10 bg-white/[0.02]"}`}><button onClick={() => loadSheet(saved.id)} className="min-w-0 text-left"><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">Registro {String(index + 1).padStart(2, "0")} · arquivo V5</p><p className="mt-1 font-serif text-[20px] leading-none text-[#f4eee4]">{saved.name || "Ficha sem nome"}</p><p className="mt-1 truncate text-[9px] font-bold uppercase tracking-[0.13em] text-[#a9c7bb]">{saved.concept || "Conceito em aberto"} · {homebrewClans.find((item) => item.id === saved.clanId)?.name ?? "Clã desconhecido"}</p></button><button onClick={() => deleteSheet(saved.id)} className="grid h-8 w-8 shrink-0 place-items-center border border-white/15 text-[#d27648] hover:bg-[#3b1d19]" aria-label={`Excluir ${saved.name || "ficha"} do cofre`}><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div>}</div>
          </article>

          <article className="archive-paper relative overflow-hidden border border-[#161715]/20 p-6 text-[#161715] shadow-[8px_8px_0_rgba(22,23,21,0.11)] sm:p-8">
            <div className="flex flex-col justify-between gap-4 border-b border-[#161715]/15 pb-5 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#b55b32]"><Dices className="h-3.5 w-3.5" /> Reserva automática</div><h3 className="mt-3 font-serif text-[36px] leading-none">Declare o teste.</h3></div><div className="border border-[#b55b32]/45 px-3 py-2 text-center"><p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#8a4630]">dados na mão</p><p className="mt-1 font-serif text-[34px] leading-none text-[#b55b32]">{pool}</p></div></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#65675f]">Atributo<select value={selectedAttribute} onChange={(event) => setSelectedAttribute(event.target.value as AttributeKey)} className="h-11 border border-[#161715]/25 bg-[#f7efe3] px-3 text-[13px] font-semibold normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]">{attributeDefinitions.map((attribute) => <option key={attribute.key} value={attribute.key}>{attribute.label} · {sheet.attributes[attribute.key]}</option>)}</select></label><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#65675f]">Perícia<select value={selectedSkill} onChange={(event) => setSelectedSkill(event.target.value as SkillKey)} className="h-11 border border-[#161715]/25 bg-[#f7efe3] px-3 text-[13px] font-semibold normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]">{skillDefinitions.map((skill) => <option key={skill.key} value={skill.key}>{skill.label} · {sheet.skills[skill.key]}</option>)}</select></label></div>
            <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-[#161715]/15 py-4 text-[12px] leading-5 text-[#4e5149]"><span className="font-semibold text-[#161715]">{selectedAttributeLabel} {sheet.attributes[selectedAttribute]}</span><span className="text-[#b55b32]">+</span><span className="font-semibold text-[#161715]">{selectedSkillLabel} {sheet.skills[selectedSkill]}</span>{damagePenalty > 0 && <><span className="text-[#b55b32]">−</span><span className="border border-[#b55b32]/45 bg-[#b55b32]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#8a4630]">{damagePenalty} dano crítico</span></>}<span className="text-[#b55b32]">=</span><strong className="font-serif text-[26px] leading-none text-[#8a4630]">{pool} dados</strong><span className="ml-auto border-l border-dashed border-[#161715]/25 pl-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7a876d]">{regularDice} normais · {hungerDice} de Fome</span></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">{attributeDefinitions.map((attribute) => <div key={attribute.key} className="flex items-center justify-between gap-2 border-b border-[#161715]/15 pb-2 text-[11px] font-bold uppercase tracking-[0.11em] text-[#4d514a]"><button onClick={() => rollPool(attribute.key, selectedSkill)} title={`Rolar ${attribute.label} + ${selectedSkillLabel}`} className="flex min-w-0 items-center gap-2 text-left hover:text-[#8a4630]"><Dices className="h-3.5 w-3.5 shrink-0 text-[#b55b32]" /><span>{attribute.label}</span></button><input type="number" min="1" max="5" value={sheet.attributes[attribute.key]} onChange={(event) => updateAttribute(attribute.key, Number(event.target.value))} className="h-8 w-10 border border-[#161715]/25 bg-[#f7efe3] text-center font-serif text-[19px] normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]" /></div>)}</div>
            <div className="mt-8 border-t border-[#161715]/15 pt-5"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#7a876d]">Perícias · clique no dado para rolar com o Atributo selecionado</p><div className="mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">{skillDefinitions.map((skill) => <div key={skill.key} className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#4d514a]"><button onClick={() => rollPool(selectedAttribute, skill.key)} title={`Rolar ${selectedAttributeLabel} + ${skill.label}`} className="flex min-w-0 items-center gap-2 text-left hover:text-[#8a4630]"><Dices className="h-3.5 w-3.5 shrink-0 text-[#b55b32]" /><span>{skill.label}</span></button><input type="number" min="0" max="5" value={sheet.skills[skill.key]} onChange={(event) => updateSkill(skill.key, Number(event.target.value))} className="h-7 w-9 border border-[#161715]/20 bg-[#f7efe3] text-center font-serif text-[17px] normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]" /></div>)}</div></div>
          </article>
        </div>

        <article className="relative mt-7 overflow-hidden border border-[#b55b32]/45 bg-[#171a18] p-6 text-[#eae3d5] sm:p-8"><div className="absolute inset-0 dossier-grid opacity-20" /><div className="relative flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start"><div><div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.17em] text-[#a9c7bb]"><span className="grid h-7 w-7 place-items-center border border-[#b55b32]/75 font-serif text-[16px] text-[#d27648]">V</span><span><ShieldAlert className="mr-1 inline h-3.5 w-3.5" /> Integridade da ficha · I-05</span></div><h3 className="mt-3 font-serif text-[36px] leading-none">O corpo cobra registro.</h3></div><div className="max-w-[360px]"><p className="text-[12px] leading-6 text-[#a6a397]">Marque cada caixa diretamente na ficha. As trilhas também são preservadas no cofre local do personagem.</p><p className={`mt-3 border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.13em] ${damagePenalty ? "border-[#b55b32]/60 bg-[#3b1d19] text-[#ffb09d]" : "border-[#83a89a]/35 text-[#a9c7bb]"}`}>{damagePenalty ? `Penalidade ativa: −${damagePenalty} dado${damagePenalty > 1 ? "s" : ""} · mínimo 1` : "Sem penalidade crítica registrada"}</p></div></div><div className="relative mt-6 grid gap-5 lg:grid-cols-2"><DamageTracker title="Vitalidade" subtitle="Dano físico e pressão da cena" marks={sheet.healthDamage} onCycle={(index) => cycleDamage("healthDamage", index)} /><DamageTracker title="Força de Vontade" subtitle="Tensão mental e integridade" marks={sheet.willpowerDamage} onCycle={(index) => cycleDamage("willpowerDamage", index)} /></div></article>

        <div className="mt-7 grid gap-7 xl:grid-cols-[0.82fr_1.18fr]">
          <article className="border border-[#161715]/20 bg-[#eee7db] p-6 text-[#161715] sm:p-8"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#b55b32]"><BookOpen className="h-3.5 w-3.5" /> Protocolo de criação</div><h3 className="mt-3 font-serif text-[36px] leading-none">Antes do primeiro gole.</h3><div className="mt-7 grid gap-4">{[["01", "Escreva o conceito", "Escolha uma frase que descreva o que o personagem protegia antes da noite."], ["02", "Escolha um clã", "Os clãs homebrew do atlas definem uma maldição, afinidades e três poderes de consulta."], ["03", "Distribua os traços", "Ajuste Atributos e Perícias. Ao declarar um teste, a reserva é calculada automaticamente."], ["04", "Marque a Fome", "A Fome substitui parte da reserva por dados vermelhos. Ela não é decoração: ela muda a leitura do resultado."], ["05", "Anote o vínculo", "Registre uma dívida, testemunha ou memória em risco antes de abrir a primeira cena."]].map(([index, title, text]) => <div key={index} className="grid grid-cols-[34px_1fr] gap-3 border-t border-[#161715]/15 pt-4"><span className="font-serif text-[23px] leading-none text-[#b55b32]">{index}</span><div><h4 className="font-serif text-[23px] leading-none">{title}</h4><p className="mt-2 text-[13px] leading-6 text-[#53564f]">{text}</p></div></div>)}</div></article>

          <article className="relative overflow-hidden border border-white/10 bg-[#171a18] p-6 text-[#eae3d5] sm:p-8"><div className="absolute right-5 top-5 text-[8px] font-bold uppercase tracking-[0.17em] text-[#83a89a]/70">homebrew do atlas</div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#83a89a]"><Sparkles className="h-3.5 w-3.5" /> Linhagem e poderes</div><h3 className="mt-3 font-serif text-[36px] leading-none">{clan.name}</h3><p className="mt-2 text-[12px] font-bold uppercase tracking-[0.15em] text-[#d27648]">{clan.epithet}</p><div className="mt-6 grid gap-4 border-y border-white/10 py-5 sm:grid-cols-2"><div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">Maldição</p><p className="mt-2 text-[13px] leading-6 text-[#c9c3b8]">{clan.bane}</p></div><div className="border-t border-white/10 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">Afinidades</p><p className="mt-2 font-serif text-[25px] leading-none text-[#d8d2c6]">{clan.discipline}</p></div></div><div className="mt-6 grid gap-3">{clan.powers.map((power) => { const selected = sheet.selectedPowerIds.includes(power.id); return <button key={power.id} onClick={() => togglePower(power.id)} className={`group border p-5 text-left transition-colors duration-150 ${selected ? "border-[#b55b32] bg-[#b55b32]/12" : "border-white/10 hover:border-[#83a89a]/50"}`}><div className="flex flex-wrap items-center justify-between gap-3"><span className="font-serif text-[27px] leading-none text-[#f4eee4]">{power.name}</span><span className={`border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] ${selected ? "border-[#d27648] text-[#d27648]" : "border-white/15 text-[#a6a397]"}`}>{selected ? "Preparado" : "Registrar"}</span></div><p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a9c7bb]">{power.cost} · {power.pool}</p><p className="mt-3 text-[13px] leading-6 text-[#c9c3b8]">{power.text}</p></button>; })}</div><p className="mt-5 text-[10px] leading-5 text-[#85897f]">Conteúdo homebrew para esta campanha. Ajuste nomes, custos e efeitos conforme o contrato da sua mesa.</p></article>
        </div>

        <article className="relative mt-7 overflow-hidden border border-[#b55b32]/55 bg-[#0e100f] p-6 text-[#eae3d5] shadow-[10px_10px_0_rgba(181,91,50,0.12)] sm:p-8"><div className="absolute inset-0 dossier-grid opacity-20" /><div className="relative grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#a9c7bb]"><Dices className="h-3.5 w-3.5" /> rolagem V5 · dados e Fome</div><h3 className="mt-4 font-serif text-[46px] leading-[0.88] text-[#f4eee4]">A Fome também<br />rola com você.</h3><div className="mt-7 flex flex-wrap gap-3"><Button onClick={rollDice} disabled={isRolling} className="h-11 rounded-none bg-[#b55b32] px-5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#111312] hover:bg-[#d27648] disabled:opacity-70">{isRolling ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Dices className="mr-2 h-4 w-4" />}{isRolling ? "Rolando" : `Rolar ${pool} dados`}</Button><div className="flex items-center gap-2 border border-white/15 px-4 text-[10px] font-bold uppercase tracking-[0.13em] text-[#a6a397]"><span className="h-2.5 w-2.5 bg-[#eae3d5]" />{regularDice} normais <span className="ml-2 h-2.5 w-2.5 bg-[#b55b32]" />{hungerDice} Fome</div></div>{damagePenalty > 0 && <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.13em] text-[#ffb09d]">Reserva base {basePool} · −{damagePenalty} por dano crítico</p>}<label className="mt-7 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a6a397]">Fome <input type="range" min="0" max="5" value={sheet.hunger} onChange={(event) => setSheet((current) => ({ ...current, hunger: Number(event.target.value) }))} className="mx-4 flex-1 accent-[#b55b32]" /><span className="font-serif text-[28px] leading-none text-[#d27648]">{sheet.hunger}</span></label></div><div className="relative min-h-[260px] border border-white/10 bg-[#171a18]/80 p-6"><div className="flex items-center justify-between border-b border-white/10 pb-4"><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#a9c7bb]">{selectedAttributeLabel} + {selectedSkillLabel}</p><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#85897f]">Sucesso em 6+</p></div><div className="mt-7 flex flex-wrap gap-3">{isRolling ? Array.from({ length: pool }, (_, index) => <span key={index} className={`vtm-die-rolling grid h-12 w-12 place-items-center border font-serif text-[28px] ${index < hungerDice ? "border-[#b55b32] bg-[#3b1d19] text-[#ffb09d]" : "border-[#eae3d5]/40 bg-[#111312] text-[#eae3d5]"}`}>?</span>) : roll.length > 0 ? roll.map((die, index) => <span key={`${die.value}-${index}`} className={`vtm-die-result grid h-12 w-12 place-items-center border font-serif text-[28px] ${die.hunger ? "border-[#b55b32] bg-[#3b1d19] text-[#ffb09d]" : "border-[#eae3d5]/40 bg-[#111312] text-[#eae3d5]"} ${die.value >= 6 ? "ring-1 ring-[#83a89a]" : ""}`}>{die.value}</span>) : <div className="flex min-h-[96px] items-center text-[14px] leading-6 text-[#aaa79c]">Declare Atributo e Perícia, ajuste a Fome e abra o registro. Os dados vermelhos são separados automaticamente da reserva normal.</div>}</div>{roll.length > 0 && !isRolling && <div className="mt-7 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3"><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#85897f]">Sucessos</p><p className="mt-1 font-serif text-[33px] leading-none text-[#f4eee4]">{totalSuccesses}</p></div><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#85897f]">Leitura</p><p className={`mt-1 font-serif text-[23px] leading-none ${messyCritical || bestialFailure ? "text-[#d27648]" : "text-[#a9c7bb]"}`}>{messyCritical ? "Crítico bagunçado" : bestialFailure ? "Falha bestial" : totalSuccesses > 0 ? "Êxito registrado" : "Falha"}</p></div><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#85897f]">Dado de Fome</p><p className="mt-1 text-[12px] leading-5 text-[#c9c3b8]">{hungerDice ? "Pode alterar o preço da vitória." : "Nenhum dado de Fome nesta rolagem."}</p></div></div>}</div></div></article>
        <article className="relative mt-7 overflow-hidden border border-white/10 bg-[#171a18] p-6 text-[#eae3d5] sm:p-8"><div className="absolute inset-0 dossier-grid opacity-15" /><div className="relative flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start"><div><div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.17em] text-[#a9c7bb]"><span className="grid h-7 w-7 place-items-center border border-[#83a89a]/70 font-serif text-[16px] text-[#a9c7bb]">V</span><span><History className="mr-1 inline h-3.5 w-3.5" /> Memória de rolagens · M-06</span></div><h3 className="mt-3 font-serif text-[36px] leading-none">O que os dados revelaram.</h3></div><p className="max-w-[310px] text-[12px] leading-6 text-[#a6a397]">Os doze últimos registros deste personagem permanecem na ficha enquanto você consulta a sessão.</p></div><div className="relative mt-6 grid gap-3">{characterHistory.length ? characterHistory.map((entry) => <div key={entry.id} className="grid gap-4 border border-white/10 bg-[#111312]/65 p-4 sm:grid-cols-[80px_1fr_auto] sm:items-center"><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#83a89a]">{entry.timestamp}<br /><span className="text-[#85897f]">{entry.finalPool} dados</span></div><div><p className="font-serif text-[24px] leading-none text-[#f4eee4]">{entry.action}</p><p className="mt-2 text-[10px] leading-5 text-[#a6a397]">{entry.basePool} base{entry.penalty ? ` − ${entry.penalty} dano` : ""} · {entry.hungerDice} de Fome · [{entry.dice.map((die) => die.value).join(" · ")}]</p></div><div className="border-l border-dashed border-white/15 pl-4 text-left sm:text-right"><p className="font-serif text-[31px] leading-none text-[#d27648]">{entry.successes}</p><p className="mt-1 text-[8px] font-bold uppercase tracking-[0.13em] text-[#a9c7bb]">{entry.verdict}</p></div></div>) : <div className="border border-dashed border-white/15 p-5 text-[12px] leading-6 text-[#a6a397]">Nenhuma rolagem registrada. Use os dados ao lado dos atributos, perícias ou do teste declarado para abrir o primeiro registro.</div>}</div></article>
      </div>
    </section>
  );
}
