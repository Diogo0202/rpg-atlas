import React from "react";
import { Link } from "wouter";

type SystemId = "vampiro-v5" | "o-um-anel";

export function SheetSystemSwitcher({ active }: { active: SystemId }) {
  const options: Array<{ id: SystemId; label: string; href: string }> = [{ id: "vampiro-v5", label: "Vampiro: A Máscara V5", href: "/ficha-v5" }, { id: "o-um-anel", label: "O Um Anel", href: "/ficha-um-anel" }];
  return <nav aria-label="Alternar sistema de ficha" className="flex border border-white/15 bg-black/10 p-1">{options.map((option) => <Link key={option.id} href={option.href} aria-current={active === option.id ? "page" : undefined} className={`px-3 py-2 text-[9px] font-bold uppercase tracking-[0.11em] transition-colors ${active === option.id ? "bg-[#b55b32] text-[#161715]" : "text-[#c7c1b5] hover:bg-white/10 hover:text-[#f4eee4]"}`}>{option.label}</Link>)}</nav>;
}
