import React, { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ChevronRight, Compass, Crosshair, Flame, MapPinned, RotateCcw, ShieldAlert, Sparkles, TentTree } from "lucide-react";
import {
  CAMPAIGN_MAP_STORAGE_KEY,
  advanceCampaignTension,
  initialCampaignMapState,
  parseCampaignMapState,
  resetCampaignMap,
  resolveCampaignEncounter,
  selectCampaignRegion,
} from "@shared/campaign-atlas-map";

const STORAGE_KEY = CAMPAIGN_MAP_STORAGE_KEY;

type RegionId = "arys" | "estrada" | "estatua" | "floresta" | "ruinas" | "sinalizador";

type Region = {
  id: RegionId;
  index: string;
  name: string;
  subtitle: string;
  detail: string;
  x: number;
  y: number;
  tone: "cobre" | "sal" | "ouro" | "rosa";
};

type Encounter = {
  id: string;
  region: RegionId;
  title: string;
  event: string;
  difficulty: number;
  threat: "baixo" | "médio" | "alto";
  signal: string;
  response: string;
  consequence: string;
};

const regions: Region[] = [
  { id: "arys", index: "I", name: "Arys", subtitle: "Ponto de partida", detail: "A princesa Quézza reúne provisões e informações antes que a Irmandade conclua o sinalizador.", x: 12, y: 74, tone: "sal" },
  { id: "estrada", index: "II", name: "Estrada da Colina", subtitle: "Rastros recentes", detail: "A estrada sangra sob chuva impossível. Três rotas levam à colina, mas nenhuma permanece segura por muito tempo.", x: 29, y: 58, tone: "cobre" },
  { id: "estatua", index: "III", name: "Estátua Quebrada", subtitle: "A pista sob a pedra", detail: "Uma fita azul, uma ampola vazia e um mapa incompleto apontam para a passagem inferior.", x: 44, y: 41, tone: "ouro" },
  { id: "floresta", index: "IV", name: "Floresta do Miasma", subtitle: "Névoa e fome", detail: "O caminho rápido atravessa enxofre, roedores e vozes que parecem vir de dentro das árvores.", x: 58, y: 31, tone: "sal" },
  { id: "ruinas", index: "V", name: "Ruínas do Templo", subtitle: "Entrada lateral", detail: "Sinos enferrujados guardam o acesso às galerias inferiores e à oficina da Irmandade.", x: 72, y: 43, tone: "rosa" },
  { id: "sinalizador", index: "VI", name: "Câmara do Sinalizador", subtitle: "Clímax do arco", detail: "A lente azul atravessa a Lâmina do Primeiro Alvorecer. O ritual pode ser interrompido, redirecionado ou corrompido.", x: 87, y: 60, tone: "cobre" },
];

const connections: [RegionId, RegionId][] = [["arys", "estrada"], ["estrada", "estatua"], ["estatua", "floresta"], ["floresta", "ruinas"], ["ruinas", "sinalizador"]];

const encounters: Encounter[] = [
  { id: "chuva", region: "estrada", title: "A Estrada que Sangra", event: "Chuva de Sangue", difficulty: 13, threat: "médio", signal: "Gotas quentes caem sem nuvens no céu.", response: "Buscar cobertura, proteger suprimentos ou aceitar a marca demoníaca.", consequence: "O grupo perde tempo ou deixa uma trilha visível para perseguidores." },
  { id: "roedores", region: "estatua", title: "Frestas sob o Santo", event: "Invasão de Roedores", difficulty: 13, threat: "baixo", signal: "A comida se move dentro dos sacos antes que alguém ouça o primeiro ruído.", response: "Usar fogo, bloquear as fendas ou proteger o mapa.", consequence: "Uma unidade de comida ou a corda é perdida; o relógio pode avançar." },
  { id: "miasma", region: "floresta", title: "A Névoa que Escuta", event: "Miasma do Abismo", difficulty: 13, threat: "médio", signal: "A névoa amarela desce contra o vento e apaga as cores da mata.", response: "Teste de Vigor, máscara, fogo, vento ou terreno elevado.", consequence: "Falha causa Doente e 1 Perdição em ataques até o fim da cena." },
  { id: "sinos", region: "ruinas", title: "Sinos de Agonia", event: "Sinos de Agonia", difficulty: 13, threat: "alto", signal: "O sino toca dentro da cabeça dos personagens, sem mover a corda.", response: "Silenciar o mecanismo, usar o símbolo sagrado ou afastar-se.", consequence: "Assustado por uma rodada; três toques atraem uma patrulha." },
  { id: "eclipse", region: "sinalizador", title: "A Câmara sem Sol", event: "Eclipse Profano", difficulty: 15, threat: "alto", signal: "A lente azul apaga o teto e desenha um eclipse sobre a colina.", response: "Personalidade, abrigo, liderança, símbolo sagrado ou destruição da lente.", consequence: "Falha causa Assustado; o ritual avança e reforços se aproximam." },
];

const toneClasses: Record<Region["tone"], string> = {
  cobre: "border-[#b55b32] bg-[#b55b32]/15 text-[#ffd2ba]",
  sal: "border-[#83a89a] bg-[#83a89a]/15 text-[#c8e1d7]",
  ouro: "border-[#d6b15d] bg-[#d6b15d]/15 text-[#f4df9b]",
  rosa: "border-[#a16b8d] bg-[#a16b8d]/15 text-[#e2bdd3]",
};

function ArchiveSeal() {
  return <div className="relative grid h-[92px] w-[92px] place-items-center border border-[#b55b32]/75 bg-[#111312]/90" aria-label="Selo de autenticação de Veyr"><span className="absolute left-3 right-3 top-3 h-[40%] rounded-t-full border-x border-t border-[#83a89a]/70" /><span className="absolute inset-[14%] border border-[#eae3d5]/20" /><img src="/manus-storage/veyr-sigil_9fd2f690.png" alt="" className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] object-contain opacity-55" /><span className="relative font-serif text-3xl leading-none text-[#eae3d5]">V</span><span className="absolute bottom-2 left-2 right-2 border-t border-dashed border-[#b55b32]/70" /></div>;
}

function ArchiveRail() {
  return <aside className="dossier-grid fixed bottom-0 left-0 top-0 z-40 hidden w-[208px] flex-col items-center border-r border-[#b55b32]/55 bg-[#0a0c0b] shadow-[16px_0_34px_rgba(0,0,0,0.3)] lg:flex"><div className="flex h-[218px] w-full flex-col items-center justify-center border-b border-[#b55b32]/35"><p className="text-[7px] font-bold uppercase tracking-[0.25em] text-[#83a89a]">Arquivo Central</p><p className="mt-2 font-serif text-[18px] tracking-[0.18em] text-[#eae3d5]">RPG ATLAS</p><ArchiveSeal /><span className="mt-2 bg-[#0a0c0b] px-1 text-[8px] font-bold tracking-[0.22em] text-[#83a89a]">VEY-17 · AUT.</span></div><div className="relative flex w-full flex-1 flex-col items-center py-5"><span className="absolute top-0 h-full border-l border-dashed border-[#83a89a]/35" />{[["01", "Mapa", "mapa"], ["02", "Rotas", "rotas"], ["03", "Encontros", "encontros"], ["04", "Relógio", "relogio"]].map(([number, label, id]) => <a key={id} href={`#${id}`} className="group relative z-10 mb-3 flex h-[56px] w-full flex-col items-center justify-center gap-1 bg-[#0a0c0b] text-center before:absolute before:bottom-1/2 before:right-0 before:h-px before:w-5 before:bg-transparent before:transition-colors hover:before:bg-[#b55b32]/75"><span className="font-serif text-[20px] leading-none text-[#b55b32] transition-transform duration-150 group-hover:-translate-y-1">{number}</span><span className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#9b978c] transition-colors group-hover:text-[#eae3d5]">{label}</span></a>)}</div><div className="w-full border-t border-white/10 px-3 py-4 text-center text-[8px] font-bold uppercase tracking-[0.18em] text-[#83a89a]">trilha<br />autenticada<br /><span className="text-[#b55b32]">registro 06</span></div></aside>;
}

function loadMapState() {
  if (typeof window === "undefined") return initialCampaignMapState();
  return parseCampaignMapState(window.localStorage.getItem(STORAGE_KEY));
}

export default function ShadowlordsCampaignMap() {
  const [state, setState] = useState(loadMapState);
  const selectedRegion = regions.find((region) => region.id === state.selectedRegion) ?? regions[0];
  const regionEncounter = encounters.find((encounter) => encounter.region === selectedRegion.id);
  const activeEncounters = useMemo(() => encounters.filter((encounter) => !state.resolved.includes(encounter.id)), [state.resolved]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const selectRegion = (id: RegionId) => setState((current) => selectCampaignRegion(current, id));
  const advanceTension = () => setState((current) => advanceCampaignTension(current));
  const resolveEncounter = (id: string) => setState((current) => resolveCampaignEncounter(current, id));
  const resetCampaign = () => setState(resetCampaignMap());

  return (
    <main className="min-h-screen bg-[#111312] text-[#eae3d5] selection:bg-[#b55b32] selection:text-[#111312]">
      <ArchiveRail />
      <header className="border-b border-white/10 bg-[#0a0c0b]/95 lg:pl-[208px]">
        <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <Link href="/" className="grid h-10 w-10 place-items-center border border-[#b55b32]/55 text-[#d27648] transition-colors hover:bg-[#b55b32]/10" aria-label="Voltar ao RPG Atlas"><ArrowLeft className="h-4 w-4" /></Link>
            <div><p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#83a89a]">Arquivo de campanha · Shadowlords</p><h1 className="mt-1 font-serif text-2xl tracking-[0.04em] text-[#f4eee4]">O Sinalizador sob a Colina</h1></div>
          </div>
          <div className="hidden text-right sm:block"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#a9c7bb]">Registro cartográfico</p><p className="mt-1 font-mono text-[11px] text-[#b8b3a8]">SLH · 06 MARCOS · 01 RELÓGIO</p></div>
        </div>
      </header>

      <div className="lg:pl-[208px]">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_370px] lg:px-10">
          <section className="min-w-0">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#83a89a]"><MapPinned className="h-4 w-4 text-[#d27648]" /> Mapa de campanha interativo</p><p className="mt-2 max-w-2xl text-sm leading-6 text-[#b8b3a8]">Selecione um marco para consultar a cena, revelar o encontro e acompanhar a pressão do sinalizador.</p></div><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#8f8b82]"><Crosshair className="h-4 w-4 text-[#b55b32]" /> {activeEncounters.length} encontros ativos</div></div>
            <div id="mapa" className="relative min-h-[590px] overflow-hidden border border-[#b55b32]/45 bg-[#171a18] p-3 shadow-[0_20px_70px_rgba(0,0,0,0.22)] sm:p-5">
              <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(131,168,154,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(131,168,154,0.11)_1px,transparent_1px)] [background-size:42px_42px]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_26%,rgba(181,91,50,0.2),transparent_26%),radial-gradient(circle_at_18%_78%,rgba(131,168,154,0.16),transparent_28%)]" />
              <div className="relative min-h-[560px] overflow-hidden border border-white/10 bg-[#111312]/70">
                <div className="pointer-events-none absolute right-5 top-5 z-10 hidden text-right sm:block"><p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#83a89a]">Placa autenticada</p><p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#b55b32]">VEY · 17 · COLINA</p></div>
                <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M 10 74 C 20 68, 20 61, 29 58 S 38 45, 44 41 S 54 34, 58 31 S 69 37, 72 43 S 82 54, 87 60" fill="none" stroke="#b55b32" strokeDasharray="1.2 1.8" strokeWidth="0.35" opacity="0.9" />
                  <path d="M 7 88 C 24 75, 41 84, 52 69 S 73 75, 94 80" fill="none" stroke="#83a89a" strokeDasharray="0.5 2.5" strokeWidth="0.25" opacity="0.55" />
                  <path d="M 13 23 C 28 17, 41 21, 53 11 S 73 20, 90 13" fill="none" stroke="#eae3d5" strokeDasharray="0.3 3" strokeWidth="0.2" opacity="0.35" />
                </svg>
                <div className="absolute left-4 top-4 max-w-[220px] sm:left-7 sm:top-7"><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#83a89a]">Coord. 06 / SINAL</p><p className="mt-2 font-serif text-3xl leading-none text-[#f4eee4]">A colina<br /><em className="font-normal text-[#d27648]">chama.</em></p></div>
                <div className="absolute bottom-5 left-5 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.16em] text-[#8f8b82]"><span className="h-px w-9 border-t border-dashed border-[#83a89a]" /> rotas catalogadas · sem escala</div>
                {regions.map((region) => {
                  const selected = selectedRegion.id === region.id;
                  return <button key={region.id} type="button" onClick={() => selectRegion(region.id)} aria-label={`Consultar ${region.name}`} className={`group absolute -translate-x-1/2 -translate-y-1/2 text-left transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d27648] ${selected ? "z-20 scale-105" : "z-10"}`} style={{ left: `${region.x}%`, top: `${region.y}%` }}><span className={`grid h-11 w-11 place-items-center rounded-full border-2 shadow-[0_0_0_5px_rgba(17,19,18,0.75)] ${toneClasses[region.tone]} ${selected ? "ring-2 ring-[#d27648]/75 ring-offset-2 ring-offset-[#111312]" : ""}`}><span className="font-serif text-lg">{region.index}</span></span><span className={`mt-2 block whitespace-nowrap border bg-[#111312]/95 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${selected ? "border-[#d27648] text-[#f4eee4]" : "border-white/10 text-[#aaa69c]"}`}>{region.name}</span></button>;
                })}
              </div>
            </div>
          </section>

          <aside className="space-y-5">
                        <section id="relogio" className="border border-[#b55b32]/50 bg-[#171a18] p-5">
<div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#83a89a]">Relógio de tensão</p><h2 className="mt-2 font-serif text-3xl text-[#f4eee4]">O sinalizador</h2></div><Flame className="h-7 w-7 text-[#d27648]" /></div><div className="mt-5 grid grid-cols-6 gap-1" aria-label={`Tensão ${state.tension} de 6`}>{Array.from({ length: 6 }, (_, index) => <span key={index} className={`h-10 border ${index < state.tension ? "border-[#b55b32] bg-[#b55b32]/70" : "border-white/15 bg-[#101211]"}`} />)}</div><div className="mt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.12em] text-[#8f8b82]"><span>silêncio</span><span className="text-[#d27648]">{state.tension}/6</span><span>mensagem enviada</span></div><button type="button" onClick={advanceTension} disabled={state.tension >= 6} className="mt-5 flex h-10 w-full items-center justify-center gap-2 border border-[#b55b32]/60 bg-[#b55b32]/10 text-[10px] font-bold uppercase tracking-[0.13em] text-[#f4eee4] transition-colors hover:bg-[#b55b32]/20 disabled:cursor-not-allowed disabled:opacity-45"><Flame className="h-4 w-4" /> Avançar o relógio</button></section>

            <section id="rotas" className="border border-white/10 bg-[#171a18] p-5"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#83a89a]">Marco selecionado · {selectedRegion.index}</p><h2 className="mt-2 font-serif text-3xl leading-none text-[#f4eee4]">{selectedRegion.name}</h2><p className="mt-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#d27648]">{selectedRegion.subtitle}</p><p className="mt-4 text-sm leading-6 text-[#b8b3a8]">{selectedRegion.detail}</p><div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8f8b82]"><Compass className="h-4 w-4 text-[#83a89a]" /> Rota {regions.findIndex((region) => region.id === selectedRegion.id) + 1} de 6</div></section>

                        {regionEncounter ? <section id="encontros" className="border border-[#a16b8d]/55 bg-[#241b22] p-5">
<div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#e2bdd3]"><ShieldAlert className="h-4 w-4" /> Encontro inicial</p><span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#d6b15d]">Dificuldade {regionEncounter.difficulty}</span></div><h3 className="mt-3 font-serif text-2xl leading-none text-[#f4eee4]">{regionEncounter.title}</h3><p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#d6b15d]">Evento · {regionEncounter.event} · ameaça {regionEncounter.threat}</p><dl className="mt-4 space-y-3 text-sm leading-5"><div><dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#e2bdd3]">Sinal</dt><dd className="mt-1 text-[#cfc5c8]">{regionEncounter.signal}</dd></div><div><dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#e2bdd3]">Resposta possível</dt><dd className="mt-1 text-[#cfc5c8]">{regionEncounter.response}</dd></div><div><dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#e2bdd3]">Consequência</dt><dd className="mt-1 text-[#cfc5c8]">{regionEncounter.consequence}</dd></div></dl><button type="button" onClick={() => resolveEncounter(regionEncounter.id)} className="mt-5 flex h-10 w-full items-center justify-center gap-2 border border-[#e2bdd3]/35 bg-[#a16b8d]/10 text-[10px] font-bold uppercase tracking-[0.13em] text-[#f4eee4] transition-colors hover:bg-[#a16b8d]/20"><Sparkles className="h-4 w-4" /> Marcar encontro resolvido</button></section> : <section className="border border-dashed border-white/15 bg-[#171a18] p-5"><p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#83a89a]"><TentTree className="h-4 w-4" /> Nenhum encontro catalogado</p><p className="mt-3 text-sm leading-6 text-[#b8b3a8]">Este marco serve como transição, abrigo ou consequência. Consulte o Mestre para decidir o que ficou fora do registro.</p></section>}

            <section className="border border-white/10 bg-[#171a18] p-5"><div className="flex items-center justify-between gap-3"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#83a89a]">Registro da sessão</p><button type="button" onClick={resetCampaign} className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#b8b3a8] transition-colors hover:text-[#f4eee4]"><RotateCcw className="h-3.5 w-3.5" /> Reiniciar</button></div><div className="mt-4 space-y-2">{encounters.map((encounter) => <button key={encounter.id} type="button" onClick={() => selectRegion(encounter.region)} className="flex w-full items-center justify-between border-b border-white/10 py-2 text-left text-xs text-[#b8b3a8] hover:text-[#f4eee4]"><span className={state.resolved.includes(encounter.id) ? "line-through opacity-50" : ""}>{encounter.title}</span><ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#b55b32]" /></button>)}</div></section>
          </aside>
        </div>
      </div>
    </main>
  );
}
