import React from "react";
import { Dice6 } from "lucide-react";

export type QuickRollOption = { id: string; label: string; detail: string };

export function QuickRollPanel({ title, intro, options, onRoll }: { title: string; intro: string; options: QuickRollOption[]; onRoll: (option: QuickRollOption) => void }) {
  return <article className="border border-[#b55b32]/45 bg-[#171a18] p-5"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]"><Dice6 className="h-4 w-4 text-[#d27648]" /> {title}</div><p className="mt-2 text-xs leading-5 text-[#b8b3a8]">{intro}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{options.map((option) => <button key={option.id} type="button" onClick={() => onRoll(option)} className="border border-white/10 bg-black/10 p-3 text-left transition-colors hover:border-[#b55b32] hover:bg-[#b55b32]/10"><span className="block text-sm font-semibold text-[#f4eee4]">{option.label}</span><span className="mt-1 block text-[10px] leading-4 text-[#a9c7bb]">{option.detail}</span></button>)}</div></article>;
}
