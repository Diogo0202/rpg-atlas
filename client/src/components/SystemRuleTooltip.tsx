import { CircleHelp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ruleSummaries: Record<string, { label: string; text: string }> = {
  "vampiro-v5": { label: "Regra V5", text: "Testes usam Atributo + Perícia. Dados de Fome substituem parte da reserva e podem gerar falha bestial ou crítico bagunçado." },
  "o-um-anel": { label: "Regra O Um Anel", text: "Testes combinam Atributo e Perícia. Esperança, Sombra e Fadiga interferem na jornada, nos riscos e nas consequências narrativas." },
};

export function SystemRuleTooltip({ systemId }: { systemId: string }) {
  const rule = ruleSummaries[systemId] ?? { label: "Regra do sistema", text: "Consulte o livro-base e as regras da campanha para conduzir testes e consequências." };
  return <Tooltip><TooltipTrigger asChild><button type="button" aria-label={`Ver regra de ${rule.label}`} className="grid h-8 w-8 shrink-0 place-items-center border border-[#161715]/20 text-[#8a4630] transition-colors hover:border-[#b55b32] hover:bg-[#b55b32]/10"><CircleHelp className="h-4 w-4" /></button></TooltipTrigger><TooltipContent side="top" className="max-w-[290px] border-[#b55b32]/45 bg-[#171a18] p-3 text-[#eae3d5]"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#d27648]">{rule.label}</p><p className="mt-2 text-xs leading-5 text-[#d8d2c6]">{rule.text}</p></TooltipContent></Tooltip>;
}
