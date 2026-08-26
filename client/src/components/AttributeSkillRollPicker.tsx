import React, { useMemo, useState } from "react";
import { Dice6 } from "lucide-react";

export function AttributeSkillRollPicker({ attributes, skills, onRoll }: { attributes: Record<string, number>; skills: Record<string, number>; onRoll: (attribute: string, skill: string) => void }) {
  const attributeNames = useMemo(() => Object.keys(attributes), [attributes]);
  const skillNames = useMemo(() => Object.keys(skills), [skills]);
  const [attribute, setAttribute] = useState(attributeNames[0] || "");
  const [skill, setSkill] = useState(skillNames[0] || "");
  return <article className="border border-[#b55b32]/45 bg-[#171a18] p-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a9c7bb]">Rolagem guiada</p><p className="mt-2 text-xs text-[#b8b3a8]">Escolha o atributo e a habilidade que a ação exige.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs">Atributo<select value={attribute} onChange={e => setAttribute(e.target.value)} className="mt-1 h-10 w-full border border-white/15 bg-[#101211] px-2">{attributeNames.map(item => <option key={item}>{item}</option>)}</select></label><label className="text-xs">Habilidade<select value={skill} onChange={e => setSkill(e.target.value)} className="mt-1 h-10 w-full border border-white/15 bg-[#101211] px-2">{skillNames.map(item => <option key={item}>{item}</option>)}</select></label></div><button type="button" onClick={() => onRoll(attribute, skill)} className="mt-4 flex h-10 w-full items-center justify-center gap-2 border border-[#b55b32] bg-[#b55b32]/10 text-xs font-bold uppercase tracking-[.12em] text-[#f4eee4]"><Dice6 className="h-4 w-4"/> Rolar {attribute} + {skill}</button></article>;
}
