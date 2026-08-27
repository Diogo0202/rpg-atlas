import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { clampMapCoordinate, mapCoordinatePercent, normalizedMapCoordinate } from "@shared/map-tabletop";
import { Crosshair, Grip, ImageUp, MapPinned, Minus, Move, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import React, { PointerEvent, WheelEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type CampaignOption = { id: number; title: string; memberRole?: "narrator" | "player" | "observer" | null };
type MarkerType = "location" | "character" | "threat" | "objective" | "secret";
type Point = { x: number; y: number };

const markerLabels: Record<MarkerType, string> = { location: "Local", character: "Personagem", threat: "Ameaça", objective: "Objetivo", secret: "Segredo" };
const markerColors = ["#b55b32", "#83a89a", "#d6b15d", "#a16b8d", "#7397b5"];
const minimumScale = 0.5;
const maximumScale = 2.5;

function asDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Arquivo de mapa inválido."));
    reader.readAsDataURL(file);
  });
}

function coordinateAtPoint(event: PointerEvent<HTMLDivElement>, stage: HTMLDivElement | null): Point | null {
  if (!stage) return null;
  const rect = stage.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return {
    x: normalizedMapCoordinate((event.clientX - rect.left) / rect.width),
    y: normalizedMapCoordinate((event.clientY - rect.top) / rect.height),
  };
}

export function CampaignMapTabletop({ campaigns, initialCampaignId }: { campaigns: CampaignOption[]; initialCampaignId: number | null }) {
  const utils = trpc.useUtils();
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(initialCampaignId);
  const [selectedMapId, setSelectedMapId] = useState<number | null>(null);
  const [newMapTitle, setNewMapTitle] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [gridEnabled, setGridEnabled] = useState(true);
  const [gridSize, setGridSize] = useState(50);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ clientX: number; clientY: number; origin: Point; moved: boolean } | null>(null);
  const [pendingPosition, setPendingPosition] = useState<Point | null>(null);
  const [markerDrag, setMarkerDrag] = useState<number | null>(null);
  const [markerPreview, setMarkerPreview] = useState<{ id: number; x: number; y: number; positionX: number; positionY: number } | null>(null);
  const [markerLabel, setMarkerLabel] = useState("");
  const [markerDescription, setMarkerDescription] = useState("");
  const [markerType, setMarkerType] = useState<MarkerType>("location");
  const [markerColor, setMarkerColor] = useState(markerColors[0]);
  const stageRef = useRef<HTMLDivElement>(null);

  const activeCampaign = campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? campaigns[0] ?? null;
  const listInput = useMemo(() => ({ campaignId: activeCampaign?.id ?? -1 }), [activeCampaign?.id]);
  const mapsQuery = trpc.maps.list.useQuery(listInput, { enabled: Boolean(activeCampaign) });
  const maps = mapsQuery.data ?? [];
  const selectedMap = maps.find((map) => map.id === selectedMapId) ?? maps[0] ?? null;
  const isNarrator = activeCampaign?.memberRole === "narrator";

  useEffect(() => {
    if (activeCampaign && activeCampaign.id !== selectedCampaignId) setSelectedCampaignId(activeCampaign.id);
  }, [activeCampaign, selectedCampaignId]);

  useEffect(() => {
    setSelectedMapId((current) => maps.some((map) => map.id === current) ? current : maps[0]?.id ?? null);
  }, [maps]);

  useEffect(() => {
    if (!selectedMap) return;
    setDraftTitle(selectedMap.title);
    setGridEnabled(Boolean(selectedMap.gridEnabled));
    setGridSize(selectedMap.gridSize);
    setPendingPosition(null);
    setMarkerPreview(null);
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [selectedMap?.id]);

  const invalidateMaps = async () => {
    if (activeCampaign) await utils.maps.list.invalidate({ campaignId: activeCampaign.id });
  };
  const createMap = trpc.maps.create.useMutation({ onSuccess: async (map) => { await invalidateMaps(); setSelectedMapId(map?.id ?? null); setNewMapTitle(""); toast.success("Mapa criado no arquivo da campanha."); }, onError: (error) => toast.error(error.message) });
  const updateMap = trpc.maps.update.useMutation({ onSuccess: async () => { await invalidateMaps(); toast.success("Configuração da mesa preservada."); }, onError: (error) => toast.error(error.message) });
  const uploadImage = trpc.maps.uploadImage.useMutation({ onSuccess: async () => { await invalidateMaps(); toast.success("Imagem tática enviada ao arquivo."); }, onError: (error) => toast.error(error.message) });
  const createMarker = trpc.maps.createMarker.useMutation({ onSuccess: async () => { await invalidateMaps(); setPendingPosition(null); setMarkerLabel(""); setMarkerDescription(""); toast.success("Marcador posicionado na mesa."); }, onError: (error) => toast.error(error.message) });
  const moveMarker = trpc.maps.moveMarker.useMutation({ onSuccess: invalidateMaps, onError: (error) => toast.error(error.message) });
  const removeMarker = trpc.maps.removeMarker.useMutation({ onSuccess: async () => { await invalidateMaps(); toast.success("Marcador removido."); }, onError: (error) => toast.error(error.message) });

  const resetView = () => { setScale(1); setPan({ x: 0, y: 0 }); };
  const zoomBy = (increment: number) => setScale((value) => Math.min(maximumScale, Math.max(minimumScale, Number((value + increment).toFixed(2)))));
  const handleWheel = (event: WheelEvent<HTMLDivElement>) => { event.preventDefault(); zoomBy(event.deltaY < 0 ? 0.1 : -0.1); };
  const beginPan = (event: PointerEvent<HTMLDivElement>) => {
    if (markerDrag !== null || event.button !== 0) return;
    setPanStart({ clientX: event.clientX, clientY: event.clientY, origin: pan, moved: false });
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const movePointer = (event: PointerEvent<HTMLDivElement>) => {
    if (markerDrag !== null) {
      const point = coordinateAtPoint(event, stageRef.current);
      if (point) setMarkerPreview({ id: markerDrag, ...point, positionX: point.x, positionY: point.y });
      return;
    }
    if (!panStart) return;
    const dx = event.clientX - panStart.clientX;
    const dy = event.clientY - panStart.clientY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) setPanStart({ ...panStart, moved: true });
    setPan({ x: panStart.origin.x + dx, y: panStart.origin.y + dy });
  };
  const endPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (markerDrag !== null && selectedMap && activeCampaign) {
      const point = coordinateAtPoint(event, stageRef.current);
      if (point) moveMarker.mutate({ campaignId: activeCampaign.id, mapId: selectedMap.id, markerId: markerDrag, positionX: point.x, positionY: point.y });
      setMarkerDrag(null);
      setMarkerPreview(null);
      return;
    }
    if (panStart && !panStart.moved && isNarrator) {
      const point = coordinateAtPoint(event, stageRef.current);
      if (point) setPendingPosition(point);
    }
    setPanStart(null);
  };
  const createNewMap = () => {
    if (!activeCampaign) return;
    const title = newMapTitle.trim();
    if (title.length < 3) { toast.error("Dê ao mapa um título de pelo menos três caracteres."); return; }
    createMap.mutate({ campaignId: activeCampaign.id, title });
  };
  const saveSettings = () => {
    if (!activeCampaign || !selectedMap) return;
    const title = draftTitle.trim();
    if (title.length < 3) { toast.error("Dê ao mapa um título de pelo menos três caracteres."); return; }
    updateMap.mutate({ campaignId: activeCampaign.id, mapId: selectedMap.id, title, gridEnabled, gridSize });
  };
  const onImageChosen = async (file?: File) => {
    if (!file || !activeCampaign || !selectedMap) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) { toast.error("Use uma imagem PNG, JPEG ou WebP."); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error("A imagem deve ter no máximo 4 MB."); return; }
    try { uploadImage.mutate({ campaignId: activeCampaign.id, mapId: selectedMap.id, imageData: await asDataUrl(file) }); } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível ler a imagem."); }
  };
  const submitMarker = () => {
    if (!activeCampaign || !selectedMap || !pendingPosition) return;
    const label = markerLabel.trim();
    if (!label) { toast.error("Nomeie o marcador antes de posicioná-lo."); return; }
    createMarker.mutate({ campaignId: activeCampaign.id, mapId: selectedMap.id, label, description: markerDescription.trim() || undefined, markerType, color: markerColor, positionX: pendingPosition.x, positionY: pendingPosition.y });
  };

  return <section className="mt-8 border border-[#b55b32]/45 bg-[#171a18] p-5 sm:p-6"><header className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a9c7bb]"><MapPinned className="h-4 w-4 text-[#d27648]" /> Mesa virtual · mapas táticos</p><h2 className="mt-3 font-serif text-4xl leading-none text-[#f4eee4]">Terreno sob vigília.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#b8b3a8]">Imagens, grade e marcadores ficam associados à campanha. Apenas narradores alteram a mesa; integrantes podem consultá-la.</p></div><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#a9c7bb]">Campanha de mesa<select value={activeCampaign?.id ?? ""} onChange={(event) => setSelectedCampaignId(Number(event.target.value))} className="h-10 min-w-52 border border-white/15 bg-[#101211] px-3 text-sm font-medium normal-case tracking-normal text-[#eae3d5] outline-none focus:border-[#b55b32]"><option value="" disabled>Selecione uma campanha</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}</select></label></header>
    {!activeCampaign ? <p className="mt-5 border border-dashed border-white/15 p-5 text-sm leading-6 text-[#b8b3a8]">Registre ou carregue uma campanha no Santuário para preparar a primeira mesa virtual.</p> : mapsQuery.isLoading ? <p className="mt-5 text-sm text-[#b8b3a8]">Abrindo o arquivo cartográfico…</p> : mapsQuery.error ? <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-[#b55b32]/60 bg-[#3b1d19]/55 p-4 text-sm text-[#ffb09d]"><span>Não foi possível consultar os mapas da campanha. {mapsQuery.error.message}</span><Button variant="outline" onClick={() => mapsQuery.refetch()} className="h-9 rounded-none border-[#ffb08e]/55 text-[9px] uppercase tracking-[0.13em] text-[#ffded1]">Tentar novamente</Button></div> : !selectedMap ? <div className="mt-5 grid gap-4 border border-dashed border-white/15 p-5 md:grid-cols-[1fr_auto] md:items-end"><div><Label htmlFor="new-map-title" className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#a9c7bb]">Primeiro mapa da campanha</Label><Input id="new-map-title" value={newMapTitle} onChange={(event) => setNewMapTitle(event.target.value)} placeholder="Ex.: Ruínas sob a chuva" className="mt-2 h-11 rounded-none border-white/15 bg-[#101211] text-[#eae3d5] placeholder:text-[#6f746c]" disabled={!isNarrator} /></div>{isNarrator ? <Button onClick={createNewMap} disabled={createMap.isPending} className="h-11 rounded-none bg-[#b55b32] text-[10px] font-bold uppercase tracking-[0.14em] text-[#101211] hover:bg-[#d27648]"><Plus className="mr-2 h-4 w-4" />{createMap.isPending ? "Criando" : "Criar mapa"}</Button> : <p className="text-sm leading-6 text-[#b8b3a8]">Somente o narrador pode abrir uma mesa nova.</p>}</div> : <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]"><div className="min-w-0"><div className="flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-[#101211] px-3 py-2"><div className="flex min-w-0 items-center gap-2"><Grip className="h-4 w-4 shrink-0 text-[#83a89a]" /><select value={selectedMap.id} onChange={(event) => setSelectedMapId(Number(event.target.value))} className="min-w-0 bg-transparent text-sm font-semibold text-[#f4eee4] outline-none">{maps.map((map) => <option key={map.id} value={map.id} className="bg-[#101211]">{map.title}</option>)}</select></div><div className="flex items-center gap-1"><Button variant="outline" size="icon" onClick={() => zoomBy(-0.1)} aria-label="Diminuir zoom" className="h-8 w-8 rounded-none border-white/15 text-[#eae3d5]"><Minus className="h-3.5 w-3.5" /></Button><span className="w-12 text-center text-[10px] font-bold tabular-nums text-[#a9c7bb]">{Math.round(scale * 100)}%</span><Button variant="outline" size="icon" onClick={() => zoomBy(0.1)} aria-label="Aumentar zoom" className="h-8 w-8 rounded-none border-white/15 text-[#eae3d5]"><Plus className="h-3.5 w-3.5" /></Button><Button variant="outline" size="icon" onClick={resetView} aria-label="Redefinir visualização" className="ml-1 h-8 w-8 rounded-none border-white/15 text-[#eae3d5]"><RotateCcw className="h-3.5 w-3.5" /></Button></div></div>
      <div className="relative mt-3 aspect-video touch-none overflow-hidden border border-[#b55b32]/45 bg-[#0b0d0c]" onWheel={handleWheel} onPointerDown={beginPan} onPointerMove={movePointer} onPointerUp={endPointer} onPointerCancel={() => { setPanStart(null); setMarkerDrag(null); setMarkerPreview(null); }}><div ref={stageRef} className="absolute inset-0 origin-center select-none" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, cursor: markerDrag !== null ? "grabbing" : panStart ? "grabbing" : isNarrator ? "crosshair" : "grab", backgroundImage: gridEnabled ? "linear-gradient(rgba(131,168,154,.32) 1px, transparent 1px), linear-gradient(90deg, rgba(131,168,154,.32) 1px, transparent 1px)" : undefined, backgroundSize: gridEnabled ? `${gridSize}px ${gridSize}px` : undefined }}>{selectedMap.imageUrl ? <img src={selectedMap.imageUrl} alt={`Mapa tático: ${selectedMap.title}`} draggable={false} className="pointer-events-none h-full w-full object-cover opacity-90" /> : <div className="pointer-events-none flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_45%,#28302c_0%,#121513_48%,#080908_100%)] p-8 text-center"><div><MapPinned className="mx-auto h-8 w-8 text-[#d27648]" /><p className="mt-4 font-serif text-2xl text-[#f4eee4]">Mapa sem imagem</p><p className="mt-2 max-w-xs text-sm leading-6 text-[#b8b3a8]">O tabuleiro já aceita grade e marcadores. Envie uma imagem tática quando estiver pronta.</p></div></div>}{selectedMap.markers.map((marker) => { const preview = markerPreview?.id === marker.id ? markerPreview : marker; return <button key={marker.id} type="button" onPointerDown={(event) => { if (!isNarrator) return; event.stopPropagation(); setMarkerDrag(marker.id); event.currentTarget.setPointerCapture(event.pointerId); }} className="absolute z-10 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-[#101211] text-[#101211] shadow-[0_0_0_1px_rgba(244,238,228,.75)] focus:outline-none focus:ring-2 focus:ring-[#f4eee4]" style={{ left: `${mapCoordinatePercent(preview.positionX)}%`, top: `${mapCoordinatePercent(preview.positionY)}%`, backgroundColor: marker.color, cursor: isNarrator ? "grab" : "default" }} aria-label={`${markerLabels[marker.markerType as MarkerType]}: ${marker.label}`} title={marker.label}><Crosshair className="h-3.5 w-3.5" /></button>; })}</div></div>
      <p className="mt-3 flex items-center gap-2 text-[10px] leading-5 text-[#a9c7bb]"><Move className="h-3.5 w-3.5 shrink-0 text-[#d27648]" /> Arraste para panorâmica; use os controles ou a roda do mouse para zoom.{isNarrator ? " Clique no terreno para preparar um marcador; arraste um marcador para reposicioná-lo." : " Esta campanha está em modo de leitura para seu papel."}</p></div>
      <aside className="space-y-4"><div className="border border-white/10 bg-[#101211] p-4"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]">Configurar tabuleiro</p>{isNarrator ? <><Label htmlFor="map-title" className="mt-4 block text-[9px] font-bold uppercase tracking-[0.13em] text-[#a9c7bb]">Título</Label><Input id="map-title" value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} className="mt-2 h-10 rounded-none border-white/15 bg-[#171a18] text-[#eae3d5]" /><label className="mt-4 flex cursor-pointer items-center justify-between gap-3 text-sm text-[#eae3d5]"><span>Exibir grade</span><input type="checkbox" checked={gridEnabled} onChange={(event) => setGridEnabled(event.target.checked)} className="h-4 w-4 accent-[#b55b32]" /></label><div className="mt-4"><div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.13em] text-[#a9c7bb]"><span>Passo da grade</span><span>{gridSize}px</span></div><Slider value={[gridSize]} onValueChange={([value]) => setGridSize(value)} min={20} max={240} step={5} className="mt-3" /></div><Button variant="outline" onClick={saveSettings} disabled={updateMap.isPending} className="mt-5 h-10 w-full rounded-none border-[#83a89a]/55 text-[9px] font-bold uppercase tracking-[0.13em] text-[#d4ece2] hover:bg-[#83a89a]/15"><Save className="mr-2 h-3.5 w-3.5" />{updateMap.isPending ? "Salvando" : "Salvar mesa"}</Button><Label htmlFor="map-image" className="mt-3 flex h-10 cursor-pointer items-center justify-center border border-[#b55b32]/60 text-[9px] font-bold uppercase tracking-[0.13em] text-[#ffc1a5] hover:bg-[#b55b32]/15"><ImageUp className="mr-2 h-3.5 w-3.5" />{uploadImage.isPending ? "Enviando" : "Enviar imagem"}</Label><input id="map-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onImageChosen(event.target.files?.[0])} className="sr-only" disabled={uploadImage.isPending} /><p className="mt-2 text-[10px] leading-5 text-[#777d73]">PNG, JPEG ou WebP, até 4 MB.</p></> : <p className="mt-3 text-sm leading-6 text-[#b8b3a8]">As configurações são preservadas pelo narrador. Você pode navegar e consultar os marcadores.</p>}</div>
        {isNarrator && pendingPosition ? <div className="border border-[#b55b32]/55 bg-[#241714] p-4"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#ffc1a5]">Novo marcador · {mapCoordinatePercent(pendingPosition.x)}% / {mapCoordinatePercent(pendingPosition.y)}%</p><Label htmlFor="marker-label" className="mt-4 block text-[9px] font-bold uppercase tracking-[0.13em] text-[#a9c7bb]">Identificação</Label><Input id="marker-label" value={markerLabel} onChange={(event) => setMarkerLabel(event.target.value)} placeholder="Ex.: Vigia do portão" className="mt-2 h-10 rounded-none border-white/15 bg-[#101211] text-[#eae3d5] placeholder:text-[#6f746c]" /><Label htmlFor="marker-type" className="mt-3 block text-[9px] font-bold uppercase tracking-[0.13em] text-[#a9c7bb]">Tipo</Label><select id="marker-type" value={markerType} onChange={(event) => setMarkerType(event.target.value as MarkerType)} className="mt-2 h-10 w-full border border-white/15 bg-[#101211] px-3 text-sm text-[#eae3d5] outline-none focus:border-[#b55b32]">{Object.entries(markerLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><Label htmlFor="marker-description" className="mt-3 block text-[9px] font-bold uppercase tracking-[0.13em] text-[#a9c7bb]">Nota opcional</Label><Textarea id="marker-description" value={markerDescription} onChange={(event) => setMarkerDescription(event.target.value)} className="mt-2 min-h-20 rounded-none border-white/15 bg-[#101211] text-sm text-[#eae3d5]" /><div className="mt-3 flex items-center gap-2">{markerColors.map((color) => <button key={color} type="button" onClick={() => setMarkerColor(color)} aria-label={`Selecionar cor ${color}`} className={`h-6 w-6 rounded-full border-2 ${markerColor === color ? "border-[#f4eee4]" : "border-transparent"}`} style={{ backgroundColor: color }} />)}</div><div className="mt-4 flex gap-2"><Button onClick={submitMarker} disabled={createMarker.isPending} className="h-10 flex-1 rounded-none bg-[#b55b32] text-[9px] font-bold uppercase tracking-[0.13em] text-[#101211] hover:bg-[#d27648]">{createMarker.isPending ? "Posicionando" : "Posicionar"}</Button><Button variant="outline" onClick={() => setPendingPosition(null)} className="h-10 rounded-none border-white/15 text-[9px] font-bold uppercase tracking-[0.13em] text-[#eae3d5]">Cancelar</Button></div></div> : null}
        <div className="border border-white/10 bg-[#101211] p-4"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]">Marcadores · {selectedMap.markers.length}</p>{selectedMap.markers.length ? <div className="mt-3 space-y-2">{selectedMap.markers.map((marker) => <div key={marker.id} className="flex items-start justify-between gap-3 border-t border-white/10 pt-2"><div className="min-w-0"><p className="flex items-center gap-2 text-sm font-medium text-[#eae3d5]"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: marker.color }} />{marker.label}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#83a89a]">{markerLabels[marker.markerType as MarkerType]}</p>{marker.description ? <p className="mt-1 text-xs leading-5 text-[#b8b3a8]">{marker.description}</p> : null}</div>{isNarrator ? <Button variant="ghost" size="icon" onClick={() => removeMarker.mutate({ campaignId: activeCampaign.id, mapId: selectedMap.id, markerId: marker.id })} aria-label={`Remover ${marker.label}`} className="h-7 w-7 shrink-0 rounded-none text-[#ffad98] hover:bg-[#b55b32]/15 hover:text-[#ffd9cd]"><Trash2 className="h-3.5 w-3.5" /></Button> : null}</div>)}</div> : <p className="mt-3 text-sm leading-6 text-[#777d73]">Nenhum marcador nesta mesa.</p>}</div></aside></div>}
  </section>;
}
