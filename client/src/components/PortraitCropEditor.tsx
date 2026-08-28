import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, RotateCcw, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type PortraitCropEditorProps = {
  value?: string;
  portraitUrl?: string;
  name?: string;
  onChange: (value: string) => void;
  accent?: "vampire" | "ring" | "one-ring";
  label?: string;
};

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const OUTPUT_SIZE = 640;

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("A imagem selecionada não pôde ser aberta."));
    image.src = src;
  });
}

export function PortraitCropEditor({ value, portraitUrl, name, onChange, accent = "vampire", label }: PortraitCropEditorProps) {
  const currentValue = value ?? portraitUrl ?? "";
  const resolvedLabel = label ?? (name ? `Retrato de ${name}` : "Retrato do personagem");
  const inputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(50);
  const [offsetY, setOffsetY] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const accentClass = accent === "vampire" ? "border-[#b55b32]/60 bg-[#261313] text-[#f2d8d0]" : "border-[#b89462]/70 bg-[#eee0bd] text-[#332b20]";

  useEffect(() => { setSource(null); setZoom(1); setOffsetX(50); setOffsetY(50); }, [currentValue]);

  const openFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Escolha uma imagem JPG, PNG ou WebP.");
    if (file.size > MAX_FILE_BYTES) return toast.error("A imagem precisa ter no máximo 8 MB.");
    try { setSource(await readFile(file)); setZoom(1); setOffsetX(50); setOffsetY(50); } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível abrir a imagem."); }
  };

  const crop = async () => {
    if (!source) return;
    setIsProcessing(true);
    try {
      const image = await loadImage(source);
      const cropSize = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
      const maxX = image.naturalWidth - cropSize;
      const maxY = image.naturalHeight - cropSize;
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE; canvas.height = OUTPUT_SIZE;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("O navegador não disponibilizou o editor de imagem.");
      context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high";
      context.drawImage(image, maxX * (offsetX / 100), maxY * (offsetY / 100), cropSize, cropSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      onChange(canvas.toDataURL("image/jpeg", 0.86));
      setSource(null);
      toast.success("Retrato recortado e pronto para salvar.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível recortar o retrato."); } finally { setIsProcessing(false); }
  };

  return <section className={`border p-4 ${accentClass}`} aria-label={resolvedLabel}>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em]"><ImagePlus className="h-4 w-4" /> {resolvedLabel}</p><p className="mt-1 text-xs opacity-75">Recorte quadrado em 640 × 640 px, armazenado junto à ficha.</p></div><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => inputRef.current?.click()} className="h-9 rounded-none border-current bg-transparent text-[9px] font-bold uppercase tracking-[.1em]"><Upload className="mr-2 h-3.5 w-3.5" /> Escolher imagem</Button>{currentValue ? <Button type="button" variant="outline" onClick={() => onChange("")} className="h-9 rounded-none border-current bg-transparent text-[9px] font-bold uppercase tracking-[.1em]"><Trash2 className="mr-2 h-3.5 w-3.5" /> Remover</Button> : null}</div></div>
    <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { void openFile(event.target.files?.[0]); event.target.value = ""; }} aria-label="Escolher imagem de retrato" />
    {source ? <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
      <div className="overflow-hidden border border-current/30 bg-black/20 p-3"><div className="relative mx-auto aspect-square max-w-md overflow-hidden border-2 border-current/50 bg-black"><img src={source} alt="Pré-visualização do recorte" className="absolute h-full w-full object-cover" style={{ transform: `scale(${zoom})`, objectPosition: `${offsetX}% ${offsetY}%` }} /></div><div className="mt-3 flex items-center gap-3 text-xs"><span>Zoom</span><input aria-label="Zoom do retrato" className="w-full accent-current" type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /><output>{zoom.toFixed(2)}×</output></div></div>
      <div className="space-y-3 text-xs"><label className="block">Posição horizontal<input aria-label="Posição horizontal do retrato" className="mt-1 w-full accent-current" type="range" min="0" max="100" value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} /></label><label className="block">Posição vertical<input aria-label="Posição vertical do retrato" className="mt-1 w-full accent-current" type="range" min="0" max="100" value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} /></label><div className="flex gap-2"><Button type="button" onClick={() => void crop()} disabled={isProcessing} className="h-9 flex-1 rounded-none bg-current text-[9px] font-bold uppercase tracking-[.1em] text-[#161715]">{isProcessing ? "Processando" : "Aplicar recorte"}</Button><Button type="button" variant="outline" onClick={() => setSource(null)} className="h-9 rounded-none border-current bg-transparent" aria-label="Cancelar edição do retrato"><RotateCcw className="h-3.5 w-3.5" /></Button></div></div>
    </div> : <div className="mt-4 flex items-center gap-3">{currentValue ? <img src={currentValue} alt="Retrato atual do personagem" className="h-20 w-20 rounded-sm object-cover ring-1 ring-current/40" /> : <div className="grid h-20 w-20 place-items-center border border-current/30 bg-black/10"><ImagePlus className="h-5 w-5 opacity-60" /></div>}<p className="text-xs opacity-75">{currentValue ? "O retrato atual será preservado ao salvar ou duplicar a ficha." : "Nenhum retrato definido. O símbolo do clã ou a marca da jornada será usado como fallback."}</p></div>}
  </section>;
}
