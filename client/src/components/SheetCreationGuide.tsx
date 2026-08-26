import React from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function SheetCreationGuide({ system, intro, steps }: { system: string; intro: string; steps: string[] }) {
  return <Collapsible className="border border-[#83a89a]/35 bg-[#171a18]"><CollapsibleTrigger asChild><button type="button" className="flex w-full items-center justify-between gap-4 p-4 text-left"><span><span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#a9c7bb]"><BookOpen className="h-3.5 w-3.5 text-[#d27648]" /> Guia de criação · {system}</span><span className="mt-1 block text-sm text-[#f4eee4]">Um roteiro curto para começar sem travar.</span></span><ChevronDown className="h-4 w-4 shrink-0 text-[#83a89a]" /></button></CollapsibleTrigger><CollapsibleContent className="border-t border-white/10 px-4 pb-4"><p className="pt-3 text-xs leading-5 text-[#b8b3a8]">{intro}</p><ol className="mt-3 grid gap-2 md:grid-cols-2">{steps.map((step, index) => <li key={step} className="flex gap-3 border-l-2 border-[#b55b32]/60 bg-black/10 px-3 py-2 text-xs leading-5 text-[#d8d2c6]"><span className="font-serif text-xl leading-none text-[#d27648]">0{index + 1}</span><span>{step}</span></li>)}</ol></CollapsibleContent></Collapsible>;
}
