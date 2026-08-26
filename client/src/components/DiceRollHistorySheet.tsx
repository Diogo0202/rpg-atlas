import React, { useState } from "react";
import { History, LoaderCircle, RefreshCw, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc";

function formatResult(value: unknown) {
  const result = (value || {}) as Record<string, unknown>;
  const successes = typeof result.successes === "number" ? `${result.successes} sucesso(s)` : null;
  const pool = typeof result.pool === "number" ? `reserva ${result.pool}` : null;
  const target = typeof result.target === "number" ? `dificuldade ${result.target}` : null;
  const verdict = typeof result.verdict === "string" ? result.verdict : null;
  return [verdict, successes, pool, target].filter(Boolean).join(" · ") || "Resultado registrado";
}

export function DiceRollHistorySheet({ characterId, characterName }: { characterId: number | null; characterName?: string }) {
  const [open, setOpen] = useState(false);
  const { data: rolls = [], isLoading, error, refetch } = trpc.characters.rollHistory.useQuery(characterId ? { characterId } : undefined, { enabled: Boolean(characterId) });
  return <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button disabled={!characterId} variant="outline" className="h-11 rounded-none border-[#83a89a]/60 bg-[#83a89a]/10 text-[10px] font-bold uppercase tracking-[0.13em] text-[#f4eee4] hover:bg-[#83a89a]/20"><ScrollText className="mr-2 h-4 w-4" /> Histórico de rolagens</Button></SheetTrigger><SheetContent side="right" className="w-full overflow-y-auto border-l border-[#83a89a]/35 bg-[#101211] p-0 text-[#eae3d5] sm:max-w-lg"><SheetHeader className="border-b border-white/10 bg-[#171a18] p-6 text-left"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]"><History className="h-4 w-4 text-[#d27648]" /> Arquivo de sorte</div><SheetTitle className="font-serif text-3xl text-[#f4eee4]">{characterName || "Ficha selecionada"}</SheetTitle><SheetDescription className="text-sm leading-6 text-[#b8b3a8]">Todas as rolagens registradas por esta ficha, da mais recente para a mais antiga.</SheetDescription></SheetHeader><div className="p-6">{isLoading ? <div className="flex items-center gap-2 text-sm text-[#a9c7bb]"><LoaderCircle className="h-4 w-4 animate-spin" /> Consultando registros…</div> : error ? <div className="border border-[#b55b32]/55 bg-[#3b1d19]/45 p-4 text-sm text-[#ffb09d]"><p>Não foi possível carregar as rolagens agora.</p><Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3 h-8 rounded-none border-[#ffb08e]/40 text-[9px] font-bold uppercase tracking-[0.1em] text-[#ffb08e]"><RefreshCw className="mr-2 h-3.5 w-3.5" /> Tentar novamente</Button></div> : rolls.length ? <ol className="space-y-3">{rolls.map((roll) => <li key={roll.id} className="border-l-2 border-[#83a89a]/55 bg-[#171a18] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-serif text-xl text-[#f4eee4]">{roll.context || "Rolagem sem contexto"}</p><span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#a9c7bb]">{new Date(roll.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span></div><p className="mt-2 text-xs leading-5 text-[#b8b3a8]">{formatResult(roll.resultData)}</p></li>)}</ol> : <p className="border border-dashed border-white/15 p-5 text-sm leading-6 text-[#b8b3a8]">Ainda não há rolagens registradas para esta ficha. Use um atalho de rolagem rápida ou o ataque equipado para iniciar o arquivo.</p>}</div></SheetContent></Sheet>;
}
