import { Gauge, Zap } from "lucide-react";
import React, { useEffect, useState } from "react";

const ANIMATION_KEY = "rpg-atlas-dice-animations-enabled";

export function useDiceAnimationPreference() {
  const [animationsEnabled, setAnimationsEnabled] = useState(() => typeof window === "undefined" || window.localStorage.getItem(ANIMATION_KEY) !== "false");
  useEffect(() => { window.localStorage.setItem(ANIMATION_KEY, String(animationsEnabled)); }, [animationsEnabled]);
  return { animationsEnabled, setAnimationsEnabled };
}

export function DiceAnimationControl({ animationsEnabled, setAnimationsEnabled }: { animationsEnabled: boolean; setAnimationsEnabled: (enabled: boolean) => void }) {
  return <button type="button" aria-pressed={animationsEnabled} onClick={() => setAnimationsEnabled(!animationsEnabled)} className={`flex h-9 items-center gap-2 border px-3 text-[9px] font-bold uppercase tracking-[0.11em] ${animationsEnabled ? "border-[#d27648]/60 bg-[#d27648]/10 text-[#ffb08e]" : "border-[#83a89a]/50 bg-[#83a89a]/10 text-[#a9c7bb]"}`}>{animationsEnabled ? <Gauge className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}{animationsEnabled ? "Animação ativa" : "Resultado instantâneo"}</button>;
}
