import { Palette } from "lucide-react";
import React, { useEffect, useState } from "react";

export type DiceStyle = "obsidiana" | "brasa" | "lunar" | "pergaminho";
const STYLE_KEY = "rpg-atlas-dice-style";
const styles: { id: DiceStyle; label: string; swatch: string }[] = [
  { id: "obsidiana", label: "Obsidiana", swatch: "bg-[#17211d] border-[#83a89a]" },
  { id: "brasa", label: "Brasa", swatch: "bg-[#3b1d19] border-[#d27648]" },
  { id: "lunar", label: "Lunar", swatch: "bg-[#182033] border-[#8eb8e8]" },
  { id: "pergaminho", label: "Pergaminho", swatch: "bg-[#e9dec4] border-[#b58a45]" },
];

export const diceStyleClasses: Record<DiceStyle, string> = {
  obsidiana: "border-[#83a89a]/60 bg-[#17211d] text-[#f4eee4]",
  brasa: "border-[#d27648]/75 bg-[#3b1d19] text-[#ffb08e] shadow-[inset_0_0_0_1px_rgba(210,118,72,0.18)]",
  lunar: "border-[#8eb8e8]/70 bg-[#182033] text-[#d9ebff] shadow-[inset_0_0_0_1px_rgba(142,184,232,0.2)]",
  pergaminho: "border-[#b58a45]/75 bg-[#e9dec4] text-[#2d251b] shadow-[inset_0_0_0_1px_rgba(181,138,69,0.18)]",
};

export function useDiceStyle() {
  const [diceStyle, setDiceStyle] = useState<DiceStyle>(() => { if (typeof window === "undefined") return "obsidiana"; const saved = window.localStorage.getItem(STYLE_KEY); return styles.some((style) => style.id === saved) ? saved as DiceStyle : "obsidiana"; });
  useEffect(() => { window.localStorage.setItem(STYLE_KEY, diceStyle); }, [diceStyle]);
  return { diceStyle, setDiceStyle };
}

export function DiceStyleControl({ diceStyle, setDiceStyle }: { diceStyle: DiceStyle; setDiceStyle: (style: DiceStyle) => void }) {
  return <div className="flex flex-wrap items-center justify-end gap-1 border border-white/10 bg-black/10 p-2"><span className="mr-1 flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#a9c7bb]"><Palette className="h-3.5 w-3.5" />Dados</span>{styles.map((style) => <button key={style.id} type="button" aria-label={`Estilo ${style.label}`} aria-pressed={diceStyle === style.id} onClick={() => setDiceStyle(style.id)} className={`grid h-7 w-7 place-items-center border ${style.swatch} ${diceStyle === style.id ? "ring-1 ring-[#f4eee4]" : "opacity-65 hover:opacity-100"}`}><span className="h-2 w-2 border border-current" /></button>)}</div>;
}
