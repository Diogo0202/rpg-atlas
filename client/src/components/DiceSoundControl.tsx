import { Volume2, VolumeX } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

const ENABLED_KEY = "rpg-atlas-dice-sound-enabled";
const VOLUME_KEY = "rpg-atlas-dice-sound-volume";

export function useDiceRollSound() {
  const [enabled, setEnabled] = useState(() => typeof window !== "undefined" && window.localStorage.getItem(ENABLED_KEY) === "true");
  const [volume, setVolume] = useState(() => typeof window === "undefined" ? 45 : Number(window.localStorage.getItem(VOLUME_KEY) || 45));
  const contextRef = useRef<AudioContext | null>(null);
  useEffect(() => { window.localStorage.setItem(ENABLED_KEY, String(enabled)); }, [enabled]);
  useEffect(() => { window.localStorage.setItem(VOLUME_KEY, String(volume)); }, [volume]);
  const playDiceSound = useCallback(() => { if (!enabled || typeof window === "undefined" || !window.AudioContext) return; const context = contextRef.current || new window.AudioContext(); contextRef.current = context; if (context.state === "suspended") void context.resume(); const start = context.currentTime; [0, 0.08, 0.16].forEach((offset, index) => { const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.type = "triangle"; oscillator.frequency.setValueAtTime(180 + index * 75, start + offset); gain.gain.setValueAtTime(Math.max(0.001, volume / 1000), start + offset); gain.gain.exponentialRampToValueAtTime(0.001, start + offset + 0.07); oscillator.connect(gain); gain.connect(context.destination); oscillator.start(start + offset); oscillator.stop(start + offset + 0.08); }); }, [enabled, volume]);
  return { enabled, setEnabled, volume, setVolume, playDiceSound };
}

export function DiceSoundControl({ enabled, setEnabled, volume, setVolume }: { enabled: boolean; setEnabled: (enabled: boolean) => void; volume: number; setVolume: (volume: number) => void }) {
  return <div className="flex flex-wrap items-center justify-end gap-2 border border-white/10 bg-black/10 p-2"><button type="button" aria-pressed={enabled} onClick={() => setEnabled(!enabled)} className={`flex h-9 items-center gap-2 border px-3 text-[9px] font-bold uppercase tracking-[0.11em] ${enabled ? "border-[#83a89a]/60 bg-[#83a89a]/10 text-[#a9c7bb]" : "border-white/15 text-[#b8b3a8]"}`}>{enabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}{enabled ? "Som dos dados" : "Som desligado"}</button><label className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.1em] text-[#a9c7bb]">Volume<input aria-label="Volume dos dados" type="range" min="0" max="100" value={volume} disabled={!enabled} onChange={(event) => setVolume(Number(event.target.value))} className="w-20 accent-[#d27648] disabled:opacity-35" /><span className="w-7 text-right">{volume}%</span></label></div>;
}
