import { Button } from "@/components/ui/button";
import { cropPortraitToDataUrl, defaultPortraitCrop, fileToDataUrl, portraitSizes, type PortraitCropSettings } from "@/lib/portraitCrop";
import { Crop, ImagePlus, LoaderCircle, Move, RotateCcw, ZoomIn } from "lucide-react";
import React, { type ChangeEvent, useState } from "react";
import { toast } from "sonner";

type PortraitCropEditorProps = {
  portraitUrl?: string;
  name?: string;
  onChange: (portraitUrl: string) => void;
};

export function PortraitCropEditor({ portraitUrl, name, onChange }: PortraitCropEditorProps) {
  const [source, setSource] = useState("");
  const [settings, setSettings] = useState<PortraitCropSettings>(defaultPortraitCrop);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateSetting = <Key extends keyof PortraitCropSettings>(key: Key, value: PortraitCropSettings[Key]) => setSettings((current) => ({ ...current, [key]: value }));
  const reset = () => setSettings(defaultPortraitCrop);
  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Escolha um arquivo de imagem para o retrato."); return; }
    if (file.size > 4_000_000) { toast.error("Use uma imagem de até 4 MB para editar o retrato."); return; }
    try {
      setSource(await fileToDataUrl(file));
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível abrir esta imagem.");
    }
  };
  const applyCrop = async () => {
    if (!source) return;
    setIsProcessing(true);
    try {
      onChange(await cropPortraitToDataUrl(source, settings));
      setSource("");
      toast.success("Retrato ajustado e aplicado à ficha. Salve para preservá-lo no arquivo.");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível preparar o retrato agora.");
    } finally {
      setIsProcessing(false);
    }
  };

  const previewPosition = `${settings.focusX}% ${settings.focusY}%`;
  return <section aria-label="Editor de retrato" className="border border-white/10 bg-[#101211]/70 p-4"><div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.14em] text-[#a9c7bb]"><Crop className="h-3.5 w-3.5 text-[#d27648]" /> Retrato da ficha</p><p className="mt-1 text-xs leading-5 text-[#b8b3a8]">Envie uma imagem, ajuste o enquadramento e aplique a cópia otimizada antes de salvar.</p></div><label className="inline-flex h-9 shrink-0 items-center justify-center border border-[#b55b32]/65 bg-[#b55b32]/10 px-3 text-[9px] font-bold uppercase tracking-[.12em] text-[#f4eee4] hover:bg-[#b55b32]/20"><ImagePlus className="mr-2 h-3.5 w-3.5" /> Escolher imagem<input aria-label="Escolher imagem de retrato" type="file" accept="image/*" className="sr-only" onChange={onFileChange} /></label></div>{source ? <div className="mt-4 grid gap-5 lg:grid-cols-[220px_1fr]"><div className="mx-auto w-full max-w-[220px]"><div className="relative aspect-square overflow-hidden border border-[#b55b32]/60 bg-[#0a0c0b]"><img src={source} alt="Prévia do corte de retrato" className="h-full w-full object-cover" style={{ objectPosition: previewPosition, transform: `scale(${settings.zoom})` }} /></div><p className="mt-2 text-center text-[8px] font-bold uppercase tracking-[.12em] text-[#a9c7bb]">Prévia quadrada</p></div><div className="space-y-4"><label className="block text-[9px] font-bold uppercase tracking-[.14em] text-[#a9c7bb]"><span className="flex items-center justify-between"><span className="flex items-center gap-2"><ZoomIn className="h-3.5 w-3.5" /> Zoom</span><strong className="text-[#f4eee4]">{settings.zoom.toFixed(1)}×</strong></span><input aria-label="Zoom do retrato" type="range" min="1" max="2.5" step="0.1" value={settings.zoom} onChange={(event) => updateSetting("zoom", Number(event.target.value))} className="mt-2 w-full accent-[#b55b32]" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-[9px] font-bold uppercase tracking-[.14em] text-[#a9c7bb]"><span className="flex items-center gap-2"><Move className="h-3.5 w-3.5" /> Posição horizontal</span><input aria-label="Posição horizontal do retrato" type="range" min="0" max="100" value={settings.focusX} onChange={(event) => updateSetting("focusX", Number(event.target.value))} className="mt-2 w-full accent-[#83a89a]" /></label><label className="block text-[9px] font-bold uppercase tracking-[.14em] text-[#a9c7bb]"><span className="flex items-center gap-2"><Move className="h-3.5 w-3.5" /> Posição vertical</span><input aria-label="Posição vertical do retrato" type="range" min="0" max="100" value={settings.focusY} onChange={(event) => updateSetting("focusY", Number(event.target.value))} className="mt-2 w-full accent-[#83a89a]" /></label></div><label className="block text-[9px] font-bold uppercase tracking-[.14em] text-[#a9c7bb]">Tamanho de saída<select aria-label="Tamanho do retrato" value={settings.outputSize} onChange={(event) => updateSetting("outputSize", Number(event.target.value))} className="mt-2 h-9 w-full border border-white/15 bg-[#171a18] px-3 text-sm normal-case tracking-normal text-[#f4eee4]">{portraitSizes.map((size) => <option key={size} value={size}>{size} × {size} px</option>)}</select></label><div className="flex flex-wrap gap-2 pt-1"><Button type="button" variant="outline" onClick={reset} disabled={isProcessing} className="h-9 rounded-none border-white/15 text-[9px] font-bold uppercase tracking-[.12em] text-[#f4eee4]"><RotateCcw className="mr-2 h-3.5 w-3.5" /> Restaurar</Button><Button type="button" onClick={applyCrop} disabled={isProcessing} className="h-9 rounded-none bg-[#b55b32] text-[9px] font-bold uppercase tracking-[.12em] text-[#101211] hover:bg-[#d27648]">{isProcessing ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Crop className="mr-2 h-3.5 w-3.5" />}{isProcessing ? "Ajustando" : "Aplicar retrato"}</Button></div></div></div> : <div className="mt-4 flex items-center gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden border border-dashed border-[#83a89a]/50 bg-black/10">{portraitUrl ? <img src={portraitUrl} alt={`Retrato atual de ${name || "personagem"}`} className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5 text-[#83a89a]" />}</div><p className="text-xs leading-5 text-[#b8b3a8]">{portraitUrl ? "O retrato atual será mantido até você aplicar uma nova versão." : "Nenhum retrato aplicado. O arquivo final será um JPEG quadrado otimizado."}</p></div>}</section>;
}
