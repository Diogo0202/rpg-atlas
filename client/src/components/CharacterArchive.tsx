/**
 * Arquivo de Personagens — ficha local para crônicas V5 homebrew do RPG Atlas.
 * Dados e retratos permanecem no armazenamento deste navegador.
 */
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { BookOpen, Dices, ImagePlus, RefreshCw, Save, ShieldAlert, Sparkles, UserRound } from "lucide-react";
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
};

type RollDie = { value: number; hunger: boolean };

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

export default function CharacterArchive() {
  const [sheet, setSheet] = useState<CharacterSheet>(() => safeLoad<CharacterSheet>("rpg-atlas-v5-sheet-v1", createDefaultSheet()));
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeKey>("manipulacao");
  const [selectedSkill, setSelectedSkill] = useState<SkillKey>("subterfugio");
  const [isRolling, setIsRolling] = useState(false);
  const [roll, setRoll] = useState<RollDie[]>([]);
  const [portraitNotice, setPortraitNotice] = useState("Retrato local · permanece neste navegador");

  useEffect(() => {
    try {
      window.localStorage.setItem("rpg-atlas-v5-sheet-v1", JSON.stringify(sheet));
    } catch {
      setPortraitNotice("O retrato ficou grande demais para salvar localmente; reduza a imagem e tente novamente.");
    }
  }, [sheet]);

  const clan = homebrewClans.find((item) => item.id === sheet.clanId) ?? homebrewClans[0];
  const pool = Math.max(1, sheet.attributes[selectedAttribute] + sheet.skills[selectedSkill]);
  const hungerDice = Math.min(pool, sheet.hunger);
  const regularDice = Math.max(0, pool - hungerDice);
  const selectedAttributeLabel = attributeDefinitions.find((attribute) => attribute.key === selectedAttribute)?.label ?? "Atributo";
  const selectedSkillLabel = skillDefinitions.find((skill) => skill.key === selectedSkill)?.label ?? "Perícia";
  const successes = useMemo(() => roll.reduce((total, die) => total + (die.value >= 6 ? 1 : 0), 0), [roll]);
  const tens = useMemo(() => roll.filter((die) => die.value === 10).length, [roll]);
  const totalSuccesses = successes + Math.floor(tens / 2) * 2;
  const bestialFailure = roll.some((die) => die.hunger && die.value === 1) && totalSuccesses === 0;
  const messyCritical = roll.some((die) => die.hunger && die.value === 10) && tens >= 2;

  const updateAttribute = (key: AttributeKey, value: number) => setSheet((current) => ({ ...current, attributes: { ...current.attributes, [key]: clamp(value, 1, 5) } }));
  const updateSkill = (key: SkillKey, value: number) => setSheet((current) => ({ ...current, skills: { ...current.skills, [key]: clamp(value, 0, 5) } }));
  const changeClan = (clanId: string) => setSheet((current) => ({ ...current, clanId, selectedPowerIds: [] }));
  const togglePower = (powerId: string) => setSheet((current) => ({ ...current, selectedPowerIds: current.selectedPowerIds.includes(powerId) ? current.selectedPowerIds.filter((id) => id !== powerId) : [...current.selectedPowerIds, powerId] }));

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

  const rollDice = () => {
    setIsRolling(true);
    setRoll([]);
    window.setTimeout(() => {
      const nextRoll = Array.from({ length: pool }, (_, index) => ({ value: Math.floor(Math.random() * 10) + 1, hunger: index < hungerDice }));
      setRoll(nextRoll);
      setIsRolling(false);
    }, 620);
  };

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
          </article>

          <article className="archive-paper relative overflow-hidden border border-[#161715]/20 p-6 text-[#161715] shadow-[8px_8px_0_rgba(22,23,21,0.11)] sm:p-8">
            <div className="flex flex-col justify-between gap-4 border-b border-[#161715]/15 pb-5 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#b55b32]"><Dices className="h-3.5 w-3.5" /> Reserva automática</div><h3 className="mt-3 font-serif text-[36px] leading-none">Declare o teste.</h3></div><div className="border border-[#b55b32]/45 px-3 py-2 text-center"><p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#8a4630]">dados na mão</p><p className="mt-1 font-serif text-[34px] leading-none text-[#b55b32]">{pool}</p></div></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#65675f]">Atributo<select value={selectedAttribute} onChange={(event) => setSelectedAttribute(event.target.value as AttributeKey)} className="h-11 border border-[#161715]/25 bg-[#f7efe3] px-3 text-[13px] font-semibold normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]">{attributeDefinitions.map((attribute) => <option key={attribute.key} value={attribute.key}>{attribute.label} · {sheet.attributes[attribute.key]}</option>)}</select></label><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#65675f]">Perícia<select value={selectedSkill} onChange={(event) => setSelectedSkill(event.target.value as SkillKey)} className="h-11 border border-[#161715]/25 bg-[#f7efe3] px-3 text-[13px] font-semibold normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]">{skillDefinitions.map((skill) => <option key={skill.key} value={skill.key}>{skill.label} · {sheet.skills[skill.key]}</option>)}</select></label></div>
            <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-[#161715]/15 py-4 text-[12px] leading-5 text-[#4e5149]"><span className="font-semibold text-[#161715]">{selectedAttributeLabel} {sheet.attributes[selectedAttribute]}</span><span className="text-[#b55b32]">+</span><span className="font-semibold text-[#161715]">{selectedSkillLabel} {sheet.skills[selectedSkill]}</span><span className="text-[#b55b32]">=</span><strong className="font-serif text-[26px] leading-none text-[#8a4630]">{pool} dados</strong><span className="ml-auto border-l border-dashed border-[#161715]/25 pl-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7a876d]">{regularDice} normais · {hungerDice} de Fome</span></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">{attributeDefinitions.map((attribute) => <label key={attribute.key} className="flex items-center justify-between gap-3 border-b border-[#161715]/15 pb-2 text-[11px] font-bold uppercase tracking-[0.11em] text-[#4d514a]"><span>{attribute.label}</span><input type="number" min="1" max="5" value={sheet.attributes[attribute.key]} onChange={(event) => updateAttribute(attribute.key, Number(event.target.value))} className="h-8 w-10 border border-[#161715]/25 bg-[#f7efe3] text-center font-serif text-[19px] normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]" /></label>)}</div>
            <div className="mt-8 border-t border-[#161715]/15 pt-5"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#7a876d]">Perícias</p><div className="mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">{skillDefinitions.map((skill) => <label key={skill.key} className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#4d514a]"><span>{skill.label}</span><input type="number" min="0" max="5" value={sheet.skills[skill.key]} onChange={(event) => updateSkill(skill.key, Number(event.target.value))} className="h-7 w-9 border border-[#161715]/20 bg-[#f7efe3] text-center font-serif text-[17px] normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]" /></label>)}</div></div>
          </article>
        </div>

        <div className="mt-7 grid gap-7 xl:grid-cols-[0.82fr_1.18fr]">
          <article className="border border-[#161715]/20 bg-[#eee7db] p-6 text-[#161715] sm:p-8"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#b55b32]"><BookOpen className="h-3.5 w-3.5" /> Protocolo de criação</div><h3 className="mt-3 font-serif text-[36px] leading-none">Antes do primeiro gole.</h3><div className="mt-7 grid gap-4">{[["01", "Escreva o conceito", "Escolha uma frase que descreva o que o personagem protegia antes da noite."], ["02", "Escolha um clã", "Os clãs homebrew do atlas definem uma maldição, afinidades e três poderes de consulta."], ["03", "Distribua os traços", "Ajuste Atributos e Perícias. Ao declarar um teste, a reserva é calculada automaticamente."], ["04", "Marque a Fome", "A Fome substitui parte da reserva por dados vermelhos. Ela não é decoração: ela muda a leitura do resultado."], ["05", "Anote o vínculo", "Registre uma dívida, testemunha ou memória em risco antes de abrir a primeira cena."]].map(([index, title, text]) => <div key={index} className="grid grid-cols-[34px_1fr] gap-3 border-t border-[#161715]/15 pt-4"><span className="font-serif text-[23px] leading-none text-[#b55b32]">{index}</span><div><h4 className="font-serif text-[23px] leading-none">{title}</h4><p className="mt-2 text-[13px] leading-6 text-[#53564f]">{text}</p></div></div>)}</div></article>

          <article className="relative overflow-hidden border border-white/10 bg-[#171a18] p-6 text-[#eae3d5] sm:p-8"><div className="absolute right-5 top-5 text-[8px] font-bold uppercase tracking-[0.17em] text-[#83a89a]/70">homebrew do atlas</div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#83a89a]"><Sparkles className="h-3.5 w-3.5" /> Linhagem e poderes</div><h3 className="mt-3 font-serif text-[36px] leading-none">{clan.name}</h3><p className="mt-2 text-[12px] font-bold uppercase tracking-[0.15em] text-[#d27648]">{clan.epithet}</p><div className="mt-6 grid gap-4 border-y border-white/10 py-5 sm:grid-cols-2"><div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">Maldição</p><p className="mt-2 text-[13px] leading-6 text-[#c9c3b8]">{clan.bane}</p></div><div className="border-t border-white/10 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">Afinidades</p><p className="mt-2 font-serif text-[25px] leading-none text-[#d8d2c6]">{clan.discipline}</p></div></div><div className="mt-6 grid gap-3">{clan.powers.map((power) => { const selected = sheet.selectedPowerIds.includes(power.id); return <button key={power.id} onClick={() => togglePower(power.id)} className={`group border p-5 text-left transition-colors duration-150 ${selected ? "border-[#b55b32] bg-[#b55b32]/12" : "border-white/10 hover:border-[#83a89a]/50"}`}><div className="flex flex-wrap items-center justify-between gap-3"><span className="font-serif text-[27px] leading-none text-[#f4eee4]">{power.name}</span><span className={`border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] ${selected ? "border-[#d27648] text-[#d27648]" : "border-white/15 text-[#a6a397]"}`}>{selected ? "Preparado" : "Registrar"}</span></div><p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a9c7bb]">{power.cost} · {power.pool}</p><p className="mt-3 text-[13px] leading-6 text-[#c9c3b8]">{power.text}</p></button>; })}</div><p className="mt-5 text-[10px] leading-5 text-[#85897f]">Conteúdo homebrew para esta campanha. Ajuste nomes, custos e efeitos conforme o contrato da sua mesa.</p></article>
        </div>

        <article className="relative mt-7 overflow-hidden border border-[#b55b32]/55 bg-[#0e100f] p-6 text-[#eae3d5] shadow-[10px_10px_0_rgba(181,91,50,0.12)] sm:p-8"><div className="absolute inset-0 dossier-grid opacity-20" /><div className="relative grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#a9c7bb]"><Dices className="h-3.5 w-3.5" /> rolagem V5 · dados e Fome</div><h3 className="mt-4 font-serif text-[46px] leading-[0.88] text-[#f4eee4]">A Fome também<br />rola com você.</h3><div className="mt-7 flex flex-wrap gap-3"><Button onClick={rollDice} disabled={isRolling} className="h-11 rounded-none bg-[#b55b32] px-5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#111312] hover:bg-[#d27648] disabled:opacity-70">{isRolling ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Dices className="mr-2 h-4 w-4" />}{isRolling ? "Rolando" : `Rolar ${pool} dados`}</Button><div className="flex items-center gap-2 border border-white/15 px-4 text-[10px] font-bold uppercase tracking-[0.13em] text-[#a6a397]"><span className="h-2.5 w-2.5 bg-[#eae3d5]" />{regularDice} normais <span className="ml-2 h-2.5 w-2.5 bg-[#b55b32]" />{hungerDice} Fome</div></div><label className="mt-7 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a6a397]">Fome <input type="range" min="0" max="5" value={sheet.hunger} onChange={(event) => setSheet((current) => ({ ...current, hunger: Number(event.target.value) }))} className="mx-4 flex-1 accent-[#b55b32]" /><span className="font-serif text-[28px] leading-none text-[#d27648]">{sheet.hunger}</span></label></div><div className="relative min-h-[260px] border border-white/10 bg-[#171a18]/80 p-6"><div className="flex items-center justify-between border-b border-white/10 pb-4"><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#a9c7bb]">{selectedAttributeLabel} + {selectedSkillLabel}</p><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#85897f]">Sucesso em 6+</p></div><div className="mt-7 flex flex-wrap gap-3">{isRolling ? Array.from({ length: pool }, (_, index) => <span key={index} className={`vtm-die-rolling grid h-12 w-12 place-items-center border font-serif text-[28px] ${index < hungerDice ? "border-[#b55b32] bg-[#3b1d19] text-[#ffb09d]" : "border-[#eae3d5]/40 bg-[#111312] text-[#eae3d5]"}`}>?</span>) : roll.length > 0 ? roll.map((die, index) => <span key={`${die.value}-${index}`} className={`vtm-die-result grid h-12 w-12 place-items-center border font-serif text-[28px] ${die.hunger ? "border-[#b55b32] bg-[#3b1d19] text-[#ffb09d]" : "border-[#eae3d5]/40 bg-[#111312] text-[#eae3d5]"} ${die.value >= 6 ? "ring-1 ring-[#83a89a]" : ""}`}>{die.value}</span>) : <div className="flex min-h-[96px] items-center text-[14px] leading-6 text-[#aaa79c]">Declare Atributo e Perícia, ajuste a Fome e abra o registro. Os dados vermelhos são separados automaticamente da reserva normal.</div>}</div>{roll.length > 0 && !isRolling && <div className="mt-7 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3"><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#85897f]">Sucessos</p><p className="mt-1 font-serif text-[33px] leading-none text-[#f4eee4]">{totalSuccesses}</p></div><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#85897f]">Leitura</p><p className={`mt-1 font-serif text-[23px] leading-none ${messyCritical || bestialFailure ? "text-[#d27648]" : "text-[#a9c7bb]"}`}>{messyCritical ? "Crítico bagunçado" : bestialFailure ? "Falha bestial" : totalSuccesses > 0 ? "Êxito registrado" : "Falha"}</p></div><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#85897f]">Dado de Fome</p><p className="mt-1 text-[12px] leading-5 text-[#c9c3b8]">{hungerDice ? "Pode alterar o preço da vitória." : "Nenhum dado de Fome nesta rolagem."}</p></div></div>}</div></div></article>
      </div>
    </section>
  );
}
