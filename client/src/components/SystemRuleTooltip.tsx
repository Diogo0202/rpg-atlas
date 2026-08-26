import { CircleHelp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ruleSummaries: Record<string, { label: string; text: string }> = {
  "vampiro-v5": { label: "Regra V5", text: "Testes usam Atributo + Perícia. Dados de Fome substituem parte da reserva e podem gerar falha bestial ou crítico bagunçado." },
  "o-um-anel": { label: "Regra O Um Anel", text: "Testes combinam Atributo e Perícia. Esperança, Sombra e Fadiga interferem na jornada, nos riscos e nas consequências narrativas." },
};

const attributeSummaries: Record<string, Record<string, string>> = {
  "vampiro-v5": {
    "Força": "Potência física bruta: erguer, romper, agarrar e ferir em combate corpo a corpo.", "Destreza": "Coordenação, reflexos e precisão: esquiva, furtividade e ataques à distância.", "Vigor": "Resistência corporal: absorver danos, sustentar esforço e enfrentar privação.", "Carisma": "Presença pessoal e capacidade de inspirar, seduzir ou comandar.", "Manipulação": "Capacidade de conduzir escolhas alheias por estratégia, negociação ou pressão.", "Autocontrole": "Compostura sob pressão: resistir a provocações e dominar impulsos.", "Inteligência": "Conhecimento acumulado, análise e soluções complexas.", "Raciocínio": "Velocidade de pensamento, reação a riscos e improviso.", "Determinação": "Foco e força de vontade contra distração, medo e coerção.",
  },
  "o-um-anel": { "Força": "Vigor físico, resistência e ímpeto para corpo, carga, combate e travessias.", "Coração": "Ânimo, coragem e convicção para presença, liderança e esperança.", "Espírito": "Atenção, prudência e discernimento para observar e decidir sob incerteza." },
};

export function SystemRuleTooltip({ systemId }: { systemId: string }) {
  const rule = ruleSummaries[systemId] ?? { label: "Regra do sistema", text: "Consulte o livro-base e as regras da campanha para conduzir testes e consequências." };
  return <Tooltip><TooltipTrigger asChild><button type="button" aria-label={`Ver regra de ${rule.label}`} className="grid h-8 w-8 shrink-0 place-items-center border border-[#161715]/20 text-[#8a4630] transition-colors hover:border-[#b55b32] hover:bg-[#b55b32]/10"><CircleHelp className="h-4 w-4" /></button></TooltipTrigger><TooltipContent side="top" className="max-w-[290px] border-[#b55b32]/45 bg-[#171a18] p-3 text-[#eae3d5]"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#d27648]">{rule.label}</p><p className="mt-2 text-xs leading-5 text-[#d8d2c6]">{rule.text}</p></TooltipContent></Tooltip>;
}

export function AttributeRuleTooltip({ systemId, attribute }: { systemId: string; attribute: string }) {
  const detail = attributeSummaries[systemId]?.[attribute] ?? "Este atributo representa uma dimensão central do personagem e pode se combinar com perícias conforme o teste narrado.";
  return <Tooltip><TooltipTrigger asChild><button type="button" aria-label={`Explicação de ${attribute}`} className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-current/40 text-current opacity-70 transition-opacity hover:opacity-100"><CircleHelp className="h-2.5 w-2.5" /></button></TooltipTrigger><TooltipContent side="top" className="max-w-[260px] border-[#b55b32]/45 bg-[#171a18] p-3 text-[#eae3d5]"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#d27648]">{attribute}</p><p className="mt-2 text-xs leading-5 text-[#d8d2c6]">{detail}</p></TooltipContent></Tooltip>;
}
