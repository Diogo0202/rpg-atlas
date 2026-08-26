import React from "react";
import { BookOpen, CircleDot, Crown, Droplets, Eye, Flame, Ghost, ImagePlus, Moon, PawPrint, Scale, Skull, Sparkles, Swords, UserRound, Waves, type LucideIcon } from "lucide-react";
import { V5_CLANS } from "@shared/vampire-v5";

const clanIcons: Record<string, LucideIcon> = {
  "banu-haqim": Scale,
  brujah: Flame,
  gangrel: PawPrint,
  hecata: Skull,
  lasombra: Moon,
  malkavian: Eye,
  ministerio: Waves,
  nosferatu: Ghost,
  ravnos: Sparkles,
  salubri: CircleDot,
  toreador: Sparkles,
  tremere: BookOpen,
  tzimisce: Swords,
  ventrue: Crown,
  caitiff: UserRound,
  "sangue-ralo": Droplets,
};

export function V5ClanSigil({ clanId, className = "" }: { clanId?: string; className?: string }) {
  const clan = V5_CLANS.find((entry) => entry.id === clanId);
  const Icon = clanId ? clanIcons[clanId] : undefined;
  if (!clan || !Icon) return null;

  return <div data-testid={`clan-sigil-${clan.id}`} aria-label={`Símbolo do clã ${clan.name}`} className={`grid place-items-center border border-[#b55b32]/70 bg-[#111312] text-[#d27648] shadow-[inset_0_0_0_5px_rgba(181,91,50,0.04)] ${className}`}><Icon className="h-[46%] w-[46%]" strokeWidth={1.35} aria-hidden="true" /></div>;
}

export function V5CharacterPortrait({ clanId, portraitUrl, name }: { clanId?: string; portraitUrl?: string; name?: string }) {
  const clan = V5_CLANS.find((entry) => entry.id === clanId);
  const hasPortrait = Boolean(portraitUrl?.trim());
  return <div className="flex shrink-0 items-center gap-3"><div className="relative grid h-28 w-24 place-items-center overflow-hidden border border-white/15 bg-[#101211]">{hasPortrait ? <img src={portraitUrl} alt={`Retrato de ${name || "personagem"}`} className="h-full w-full object-cover" /> : clan ? <V5ClanSigil clanId={clan.id} className="h-full w-full border-0" /> : <div className="px-3 text-center"><ImagePlus className="mx-auto h-6 w-6 text-[#d27648]" /><p className="mt-2 text-[8px] font-bold uppercase tracking-[0.12em] text-[#a9c7bb]">Sem retrato</p></div>}</div>{hasPortrait && clan ? <div className="flex flex-col items-center gap-2"><V5ClanSigil clanId={clan.id} className="h-16 w-16" /><p className="max-w-20 text-center text-[8px] font-bold uppercase leading-3 tracking-[0.1em] text-[#a9c7bb]">{clan.name}</p></div> : null}</div>;
}
