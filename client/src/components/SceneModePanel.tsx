import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { downloadJsonFile, slugifyFilename } from "@/lib/sheetJson";
import { ArrowRight, Clock3, Crosshair, Dice6, Download, FileText, Flag, History, Pause, Play, Plus, RotateCcw, Sparkles, Target, Timer, Trash2, UserRound, X } from "lucide-react";

type SceneSystem = "Vampiro V5" | "Caçador" | "O Um Anel" | "Lobisomem";
type Participant = { id: string; name: string; kind: "personagem" | "ameaça"; status: string };
type SceneEvent = { id: number; actor: string; text: string; tone: "neutral" | "danger" | "success" };
type ConditionSeverity = "leve" | "moderada" | "grave";
type SceneCondition = { id: string; name: string; severity: ConditionSeverity; appliedAt: string };
type TemporaryEffect = { id: string; name: string; source: string; remainingRounds: number; modifier: number; createdAt: string };

const baseParticipants: Participant[] = [
  { id: "livia", name: "Lívia Vesper", kind: "personagem", status: "ativa" },
  { id: "vigia", name: "Vigia do Sino", kind: "ameaça", status: "alerta" },
  { id: "rafael", name: "Rafael", kind: "personagem", status: "aguardando" },
  { id: "sombra", name: "Sombra na ponte", kind: "ameaça", status: "oculta" },
];

const quickActions = [
  { id: "roll", label: "Rolar teste", icon: Dice6 },
  { id: "event", label: "Registrar evento", icon: FileText },
  { id: "condition", label: "Aplicar condição", icon: Target },
  { id: "resource", label: "Alterar recurso", icon: Sparkles },
];

function rollDice(pool: number) {
  return Array.from({ length: Math.max(1, pool) }, () => Math.floor(Math.random() * 10) + 1);
}

const severityClass: Record<ConditionSeverity, string> = {
  leve: "border-[#83a89a]/60 bg-[#83a89a]/10 text-[#d8efe2]",
  moderada: "border-[#d27648]/70 bg-[#d27648]/10 text-[#ffb08e]",
  grave: "border-[#b55b32] bg-[#3b1d19]/60 text-[#ffb09d]",
};

export function SceneModePanel() {
  const [system, setSystem] = useState<SceneSystem>("Vampiro V5");
  const [participants, setParticipants] = useState(baseParticipants);
  const [activeId, setActiveId] = useState("livia");
  const [sceneStatus, setSceneStatus] = useState<"Em andamento" | "Pausada">("Em andamento");
  const [round, setRound] = useState(3);
  const [pool, setPool] = useState(6);
  const [difficulty, setDifficulty] = useState(3);
  const [events, setEvents] = useState<SceneEvent[]>([
    { id: 1, actor: "18:42 · Lívia Vesper", text: "investigou o sino · 3 sucessos", tone: "success" },
    { id: 2, actor: "18:45 · Vigia do Sino", text: "recebeu a condição “Marcado”", tone: "danger" },
    { id: 3, actor: "18:47 · Cena", text: "a pista “cera preta” foi descoberta", tone: "neutral" },
  ]);
  const [lastRoll, setLastRoll] = useState<number[] | null>(null);
  const [conditions, setConditions] = useState<Record<string, SceneCondition[]>>({ vigia: [{ id: "seed-marked", name: "Marcado", severity: "moderada", appliedAt: new Date().toISOString() }] });
  const [effects, setEffects] = useState<Record<string, TemporaryEffect[]>>({});
  const [conditionName, setConditionName] = useState("");
  const [conditionSeverity, setConditionSeverity] = useState<ConditionSeverity>("moderada");
  const [effectName, setEffectName] = useState("");
  const [effectSource, setEffectSource] = useState("");
  const [effectDuration, setEffectDuration] = useState(2);
  const [effectModifier, setEffectModifier] = useState(0);
  const active = useMemo(() => participants.find((participant) => participant.id === activeId) || participants[0], [activeId, participants]);
  const resourceLabel = system === "Vampiro V5" ? "Fome" : system === "Caçador" ? "Desespero" : system === "O Um Anel" ? "Sombra" : "Fúria";
  const activeConditions = active ? conditions[active.id] || [] : [];
  const activeEffects = active ? effects[active.id] || [] : [];
  const totalConditions = Object.values(conditions).reduce((total, list) => total + list.length, 0);
  const totalEffects = Object.values(effects).reduce((total, list) => total + list.length, 0);

  const addEvent = (text: string, tone: SceneEvent["tone"] = "neutral") => setEvents((current) => [...current, { id: Date.now() + current.length, actor: `agora · ${active?.name || "Cena"}`, text, tone }]);
  const roll = () => { const dice = rollDice(pool); setLastRoll(dice); const successes = dice.filter((die) => die >= difficulty).length; addEvent(`rolou ${pool} dados contra dificuldade ${difficulty} · ${successes} sucesso(s)`, successes ? "success" : "danger"); };
  const advanceTurn = () => {
    const index = participants.findIndex((participant) => participant.id === activeId);
    const nextIndex = index < 0 ? 0 : (index + 1) % participants.length;
    if (nextIndex === 0) setRound((current) => current + 1);
    const expiring = Object.values(effects).flatMap((list) => list.filter((effect) => effect.remainingRounds <= 1).map((effect) => effect.name));
    setEffects((current) => Object.fromEntries(Object.entries(current).map(([participantId, list]) => [participantId, list.map((effect) => ({ ...effect, remainingRounds: effect.remainingRounds - 1 })).filter((effect) => effect.remainingRounds > 0)])));
    setActiveId(participants[nextIndex].id);
    addEvent(expiring.length ? `avançou o foco da cena · efeito(s) expirado(s): ${expiring.join(", ")}` : "avançou o foco da cena", "neutral");
  };
  const resetScene = () => { setEvents([]); setLastRoll(null); setRound(1); setActiveId(participants[0].id); setConditions({}); setEffects({}); };

  const applyCondition = (name = conditionName, severity = conditionSeverity) => {
    const normalized = name.trim();
    if (!active || normalized.length < 2) return;
    const condition: SceneCondition = { id: `condition-${Date.now()}`, name: normalized, severity, appliedAt: new Date().toISOString() };
    setConditions((current) => ({ ...current, [active.id]: [...(current[active.id] || []), condition] }));
    setConditionName("");
    addEvent(`recebeu a condição “${normalized}” · ${severity}`, severity === "grave" ? "danger" : "neutral");
  };
  const removeCondition = (conditionId: string) => {
    if (!active) return;
    const condition = activeConditions.find((entry) => entry.id === conditionId);
    setConditions((current) => ({ ...current, [active.id]: (current[active.id] || []).filter((entry) => entry.id !== conditionId) }));
    if (condition) addEvent(`teve a condição “${condition.name}” removida`, "success");
  };
  const addEffect = () => {
    const normalized = effectName.trim();
    if (!active || normalized.length < 2) return;
    const effect: TemporaryEffect = { id: `effect-${Date.now()}`, name: normalized, source: effectSource.trim() || "Cena", remainingRounds: Math.max(1, effectDuration), modifier: Math.max(-5, Math.min(5, effectModifier)), createdAt: new Date().toISOString() };
    setEffects((current) => ({ ...current, [active.id]: [...(current[active.id] || []), effect] }));
    setEffectName("");
    setEffectSource("");
    setEffectDuration(2);
    setEffectModifier(0);
    addEvent(`recebeu o efeito temporário “${normalized}” por ${effect.remainingRounds} rodada(s)`, "success");
  };
  const removeEffect = (effectId: string) => {
    if (!active) return;
    const effect = activeEffects.find((entry) => entry.id === effectId);
    setEffects((current) => ({ ...current, [active.id]: (current[active.id] || []).filter((entry) => entry.id !== effectId) }));
    if (effect) addEvent(`teve o efeito “${effect.name}” encerrado`, "neutral");
  };
  const exportSession = () => {
    const exportEvent: SceneEvent = { id: Date.now(), actor: `agora · ${active?.name || "Cena"}`, text: "exportou o histórico completo da sessão", tone: "success" };
    const nextEvents = [...events, exportEvent];
    setEvents(nextEvents);
    downloadJsonFile({ format: "rpg-atlas-scene-session-v1", version: 1, exportedAt: new Date().toISOString(), session: { title: "O Sino de Namar", system, status: sceneStatus, round, participants, conditions, effects, events: nextEvents, lastRoll } }, `historico-cena-${slugifyFilename(system)}.json`);
  };

  return <div className="min-h-screen bg-[#101211] text-[#eae3d5]"><div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8"><header className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#83a89a]">Modo de Cena · Sessão 04</p><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="font-serif text-4xl text-[#f4eee4]">O Sino de Namar</h1><span className="border border-[#83a89a]/50 bg-[#83a89a]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#a9c7bb]">{sceneStatus}</span></div><p className="mt-2 text-xs text-[#8f958c]">A Coroa Partida · rodada {round} · objetivo: descobrir quem chama os nomes dos mortos.</p></div><div className="flex flex-wrap items-center gap-2"><label className="sr-only" htmlFor="scene-system">Sistema da cena</label><select id="scene-system" value={system} onChange={(event) => setSystem(event.target.value as SceneSystem)} className="h-10 border border-white/15 bg-[#171a18] px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#eae3d5]"><option>Vampiro V5</option><option>Caçador</option><option>O Um Anel</option><option>Lobisomem</option></select><Button type="button" variant="outline" onClick={() => setSceneStatus((status) => status === "Em andamento" ? "Pausada" : "Em andamento")} className="h-10 rounded-none border-white/15 bg-[#171a18] text-[10px] font-bold uppercase tracking-[0.12em] text-[#eae3d5]">{sceneStatus === "Em andamento" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}{sceneStatus === "Em andamento" ? "Pausar" : "Retomar"}</Button><Button type="button" variant="outline" onClick={exportSession} className="h-10 rounded-none border-white/15 bg-[#171a18] text-[10px] font-bold uppercase tracking-[0.12em] text-[#eae3d5]"><Download className="mr-2 h-4 w-4" /> Exportar histórico</Button><Button type="button" variant="outline" onClick={resetScene} className="h-10 rounded-none border-white/15 bg-[#171a18] text-[10px] font-bold uppercase tracking-[0.12em] text-[#eae3d5]"><RotateCcw className="mr-2 h-4 w-4" /> Reiniciar</Button></div></header>

    <div className="mt-5 grid gap-5 xl:grid-cols-[230px_minmax(0,1fr)_390px]"><aside className="border border-white/10 bg-[#171a18] p-4"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]">Ordem da cena</p><button type="button" aria-label="Adicionar participante" onClick={() => setParticipants((current) => [...current, { id: `extra-${Date.now()}`, name: "Novo participante", kind: "ameaça", status: "novo" }])} className="text-[#d27648] hover:text-[#ffb08e]"><Plus className="h-4 w-4" /></button></div><div className="mt-4 space-y-2">{participants.map((participant, index) => <button key={participant.id} type="button" onClick={() => setActiveId(participant.id)} className={`flex w-full items-center gap-3 border p-3 text-left transition-colors ${participant.id === activeId ? "border-[#b55b32] bg-[#b55b32]/10" : "border-white/10 bg-black/10 hover:border-[#83a89a]/50"}`}><span className={`grid h-6 w-6 shrink-0 place-items-center text-[10px] font-bold ${participant.kind === "ameaça" ? "border border-[#b55b32]/60 text-[#d27648]" : "border border-[#83a89a]/50 text-[#a9c7bb]"}`}>{String(index + 1).padStart(2, "0")}</span><span className="min-w-0"><strong className="block truncate text-sm text-[#eae3d5]">{participant.name}</strong><small className="flex flex-wrap gap-2 text-[9px] uppercase tracking-[0.1em] text-[#8f958c]"><span>{participant.status}</span>{conditions[participant.id]?.length ? <span className="text-[#ffb08e]">{conditions[participant.id].length} condição(ões)</span> : null}{effects[participant.id]?.length ? <span className="text-[#a9c7bb]">{effects[participant.id].length} efeito(s)</span> : null}</small></span></button>)}</div><Button type="button" onClick={advanceTurn} className="mt-4 h-10 w-full rounded-none bg-[#b55b32] text-[10px] font-bold uppercase tracking-[0.12em] text-[#161715] hover:bg-[#d27648]">Avançar turno <ArrowRight className="ml-2 h-4 w-4" /></Button></aside>

      <main className="space-y-5"><section className="border border-[#b55b32]/45 bg-[#171a18] p-5"><div className="flex items-start justify-between gap-5"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]"><Flag className="h-4 w-4 text-[#d27648]" /> Objetivo atual</p><h2 className="mt-3 font-serif text-3xl text-[#f4eee4]">Descobrir quem está chamando os nomes dos mortos.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#b8b3a8]">O rio parou de refletir a cidade. A cera preta marca cada sino, mas nenhum sino está onde deveria estar.</p></div><Clock3 className="hidden h-6 w-6 text-[#d27648] sm:block" /></div><div className="mt-5 grid gap-3 sm:grid-cols-4"><div className="border border-white/10 bg-black/10 p-3"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8f958c]">Participantes</p><strong className="mt-2 block font-serif text-2xl text-[#f4eee4]">{participants.length}</strong></div><div className="border border-white/10 bg-black/10 p-3"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8f958c]">Ameaças ativas</p><strong className="mt-2 block font-serif text-2xl text-[#d27648]">{participants.filter((participant) => participant.kind === "ameaça").length}</strong></div><div className="border border-white/10 bg-black/10 p-3"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8f958c]">Condições</p><strong className="mt-2 block font-serif text-2xl text-[#ffb08e]">{totalConditions}</strong></div><div className="border border-white/10 bg-black/10 p-3"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8f958c]">Efeitos ativos</p><strong className="mt-2 block font-serif text-2xl text-[#a9c7bb]">{totalEffects}</strong></div></div></section><section className="border border-white/10 bg-[#171a18] p-5"><div className="flex items-center justify-between border-b border-white/10 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]">Linha de acontecimentos</p><h2 className="mt-2 font-serif text-3xl text-[#f4eee4]">O que a mesa já sabe.</h2></div><History className="h-5 w-5 text-[#d27648]" /></div><div className="mt-4 space-y-3" aria-live="polite">{events.length ? events.map((event) => <div key={event.id} className="flex gap-3 border-l-2 border-white/10 pl-3 text-sm"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${event.tone === "danger" ? "bg-[#b55b32]" : event.tone === "success" ? "bg-[#83a89a]" : "bg-[#777b73]"}`} /><p><strong className="font-medium text-[#a9c7bb]">{event.actor}</strong><span className="ml-2 text-[#c7c1b5]">{event.text}</span></p></div>) : <p className="text-sm text-[#8f958c]">Nenhum acontecimento registrado nesta reinicialização.</p>}</div></section></main>

      <aside className="space-y-5"><section className="border border-[#83a89a]/45 bg-[#171a18] p-5"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]"><UserRound className="h-4 w-4 text-[#d27648]" /> Foco selecionado</div><h2 className="mt-3 font-serif text-3xl text-[#f4eee4]">{active?.name}</h2><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#8f958c]">{active?.kind} · {active?.status}</p><div className="mt-5 grid grid-cols-2 gap-2"><div className="border border-white/10 bg-black/10 p-3"><p className="text-[9px] uppercase tracking-[0.1em] text-[#8f958c]">Vitalidade</p><p className="mt-2 text-[#eae3d5]">● ● ● ○ ○</p></div><div className="border border-white/10 bg-black/10 p-3"><p className="text-[9px] uppercase tracking-[0.1em] text-[#8f958c]">{resourceLabel}</p><p className="mt-2 text-[#d27648]">● ● ○ ○ ○</p></div></div><div className="mt-5 border-t border-white/10 pt-4"><div className="flex items-center justify-between"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#ffb08e]"><Target className="h-4 w-4" /> Condições</p><span className="text-[9px] uppercase tracking-[.1em] text-[#8f958c]">{activeConditions.length} ativas</span></div><div className="mt-3 space-y-2">{activeConditions.length ? activeConditions.map((condition) => <div key={condition.id} className={`flex items-center justify-between gap-2 border px-2 py-2 text-xs ${severityClass[condition.severity]}`}><span><strong>{condition.name}</strong><small className="ml-2 uppercase tracking-[.1em] opacity-75">{condition.severity}</small></span><button type="button" aria-label={`Remover condição ${condition.name}`} onClick={() => removeCondition(condition.id)}><X className="h-4 w-4" /></button></div>) : <p className="text-xs text-[#8f958c]">Nenhuma condição sobre este foco.</p>}</div><form className="mt-3 grid gap-2" onSubmit={(event) => { event.preventDefault(); applyCondition(); }}><label className="sr-only" htmlFor="condition-name">Nome da condição</label><input id="condition-name" value={conditionName} onChange={(event) => setConditionName(event.target.value)} placeholder="Ex.: Ferido, Marcado, Exposto" className="h-9 border border-white/15 bg-[#101211] px-3 text-xs text-[#eae3d5]" /><div className="flex gap-2"><label className="sr-only" htmlFor="condition-severity">Gravidade da condição</label><select id="condition-severity" value={conditionSeverity} onChange={(event) => setConditionSeverity(event.target.value as ConditionSeverity)} className="h-9 min-w-0 flex-1 border border-white/15 bg-[#101211] px-2 text-[10px] uppercase tracking-[.08em] text-[#eae3d5]"><option value="leve">Leve</option><option value="moderada">Moderada</option><option value="grave">Grave</option></select><Button type="submit" className="h-9 rounded-none bg-[#b55b32] px-3 text-[9px] font-bold uppercase text-[#161715]">Aplicar</Button></div></form></div></section>

      <section className="border border-[#83a89a]/45 bg-[#171a18] p-5"><div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#a9c7bb]"><Timer className="h-4 w-4 text-[#d27648]" /> Efeitos temporários</p><span className="text-[9px] uppercase tracking-[.1em] text-[#8f958c]">reduzem ao avançar turno</span></div><div className="mt-3 space-y-2">{activeEffects.length ? activeEffects.map((effect) => <div key={effect.id} className="border border-white/10 bg-black/10 p-3"><div className="flex items-start justify-between gap-2"><div><strong className="text-sm text-[#f4eee4]">{effect.name}</strong><p className="mt-1 text-[10px] uppercase tracking-[.08em] text-[#8f958c]">{effect.source} · {effect.remainingRounds} rodada(s) restante(s)</p></div><button type="button" aria-label={`Encerrar efeito ${effect.name}`} onClick={() => removeEffect(effect.id)} className="text-[#a9c7bb] hover:text-[#ffb08e]"><Trash2 className="h-4 w-4" /></button></div>{effect.modifier ? <span className="mt-2 inline-block text-xs font-bold text-[#d27648]">{effect.modifier > 0 ? "+" : ""}{effect.modifier} no teste</span> : null}</div>) : <p className="text-xs text-[#8f958c]">Nenhum efeito temporário sobre este foco.</p>}</div><div className="mt-4 grid gap-2 sm:grid-cols-2"><label className="text-[9px] font-bold uppercase tracking-[.1em] text-[#a9c7bb]">Efeito<input aria-label="Nome do efeito temporário" value={effectName} onChange={(event) => setEffectName(event.target.value)} placeholder="Ex.: Cobertura" className="mt-1 h-9 w-full border border-white/15 bg-[#101211] px-3 text-xs font-normal normal-case tracking-normal text-[#eae3d5]" /></label><label className="text-[9px] font-bold uppercase tracking-[.1em] text-[#a9c7bb]">Origem<input aria-label="Origem do efeito temporário" value={effectSource} onChange={(event) => setEffectSource(event.target.value)} placeholder="Ex.: Ritual" className="mt-1 h-9 w-full border border-white/15 bg-[#101211] px-3 text-xs font-normal normal-case tracking-normal text-[#eae3d5]" /></label><label className="text-[9px] font-bold uppercase tracking-[.1em] text-[#a9c7bb]">Duração<input aria-label="Duração do efeito temporário" type="number" min={1} max={20} value={effectDuration} onChange={(event) => setEffectDuration(Math.min(20, Math.max(1, Number(event.target.value) || 1)))} className="mt-1 h-9 w-full border border-white/15 bg-[#101211] px-3 text-xs font-normal normal-case tracking-normal text-[#eae3d5]" /></label><label className="text-[9px] font-bold uppercase tracking-[.1em] text-[#a9c7bb]">Modificador<input aria-label="Modificador do efeito temporário" type="number" min={-5} max={5} value={effectModifier} onChange={(event) => setEffectModifier(Math.min(5, Math.max(-5, Number(event.target.value) || 0)))} className="mt-1 h-9 w-full border border-white/15 bg-[#101211] px-3 text-xs font-normal normal-case tracking-normal text-[#eae3d5]" /></label></div><Button type="button" onClick={addEffect} className="mt-3 h-9 w-full rounded-none border border-[#83a89a]/45 bg-transparent text-[9px] font-bold uppercase tracking-[.1em] text-[#d8efe2] hover:bg-[#83a89a]/10"><Plus className="mr-2 h-4 w-4" /> Adicionar efeito</Button></section>

      <section className="border border-[#b55b32]/45 bg-[#171a18] p-5"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffb08e]"><Dice6 className="h-4 w-4" /> Painel de rolagem</div><p className="mt-2 text-xs leading-5 text-[#b8b3a8]">A rolagem é registrada na linha da cena e usa o sistema selecionado como contexto.</p><div className="mt-4 grid grid-cols-2 gap-3"><label className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#a9c7bb]">Dados<input aria-label="Quantidade de dados" type="number" min={1} max={20} value={pool} onChange={(event) => setPool(Math.min(20, Math.max(1, Number(event.target.value))))} className="mt-2 h-10 w-full border border-white/15 bg-[#101211] px-3 text-sm text-[#eae3d5]" /></label><label className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#a9c7bb]">Dificuldade<input aria-label="Dificuldade da rolagem" type="number" min={2} max={10} value={difficulty} onChange={(event) => setDifficulty(Math.min(10, Math.max(2, Number(event.target.value))))} className="mt-2 h-10 w-full border border-white/15 bg-[#101211] px-3 text-sm text-[#eae3d5]" /></label></div><Button type="button" onClick={roll} className="mt-4 h-11 w-full rounded-none bg-[#b55b32] text-[10px] font-bold uppercase tracking-[0.14em] text-[#161715] hover:bg-[#d27648]"><Dice6 className="mr-2 h-4 w-4" /> Rolar para {active?.name}</Button>{lastRoll ? <div className="mt-4 border-t border-white/10 pt-4"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#a9c7bb]">Último resultado</p><div className="mt-2 flex flex-wrap gap-2">{lastRoll.map((die, index) => <span key={`${die}-${index}`} className={`grid h-9 w-9 place-items-center border font-mono text-sm font-bold ${die >= difficulty ? "border-[#83a89a] bg-[#83a89a]/10 text-[#d8efe2]" : "border-[#b55b32]/70 bg-[#b55b32]/10 text-[#ffb08e]"}`}>{die}</span>)}</div></div> : null}</section></aside></div>

    <div className="sticky bottom-3 z-10 mt-5 flex flex-wrap items-center gap-2 border border-white/10 bg-[#171a18]/95 p-3 shadow-2xl backdrop-blur"><p className="mr-2 hidden text-[9px] font-bold uppercase tracking-[0.13em] text-[#8f958c] sm:block">Ações rápidas</p>{quickActions.map((action) => { const Icon = action.icon; return <Button key={action.id} type="button" variant="outline" onClick={() => action.id === "roll" ? roll() : action.id === "event" ? addEvent("registrou uma nota de cena") : action.id === "condition" ? applyCondition("Marcado", "moderada") : addEvent(`alterou ${resourceLabel}`, "neutral")} className="h-10 rounded-none border-white/15 bg-[#101211] text-[10px] font-bold uppercase tracking-[0.1em] text-[#eae3d5] hover:border-[#d27648]"><Icon className="mr-2 h-4 w-4 text-[#d27648]" /> {action.label}</Button>})}<Button type="button" onClick={advanceTurn} className="ml-auto h-10 rounded-none bg-[#b55b32] text-[10px] font-bold uppercase tracking-[0.12em] text-[#161715] hover:bg-[#d27648]">Próximo turno <ArrowRight className="ml-2 h-4 w-4" /></Button></div></div></div>;
}
