import { getOneRingMagicById, getOneRingMagicReference } from "@shared/one-ring-magic";
import { ScrollText, Sparkles } from "lucide-react";
import React from "react";
import { OneRingMagicPanel } from "./OneRingMagicPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type OneRingMagicTabsProps = {
  selectedIds: string[];
  onChange: (magicIds: string[]) => void;
  favoriteIds?: string[];
  onFavoritesChange?: (magicIds: string[]) => void;
};

export function OneRingMagicTabs({ selectedIds, onChange, favoriteIds, onFavoritesChange }: OneRingMagicTabsProps) {
  const selectedMagics = selectedIds.map(getOneRingMagicById).filter(Boolean);

  return <Tabs defaultValue="ficha" className="border border-[#7d65a3]/45 bg-[#171a18] p-4 sm:p-5">
    <TabsList aria-label="Seções da ficha de O Um Anel" className="h-auto w-full justify-start rounded-none border border-white/10 bg-[#101211] p-1 sm:w-fit">
      <TabsTrigger value="ficha" className="rounded-none px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b8b3a8] data-[state=active]:bg-[#26332e] data-[state=active]:text-[#f4eee4]"><ScrollText className="h-3.5 w-3.5" /> Ficha</TabsTrigger>
      <TabsTrigger value="magias" className="rounded-none px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b8b3a8] data-[state=active]:bg-[#31253d] data-[state=active]:text-[#f4eee4]"><Sparkles className="h-3.5 w-3.5" /> Magias <span className="font-mono text-[9px]">{selectedIds.length}</span></TabsTrigger>
    </TabsList>
    <TabsContent value="ficha" className="mt-4 border border-white/10 bg-[#101211]/70 p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#a9c7bb]">Ritos vinculados à ficha</p>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#c7c1b5]">Os ritos selecionados são preservados junto ao companheiro e aparecem na impressão A4. Abra a aba <strong className="font-semibold text-[#eadcff]">Magias</strong> para consultar o catálogo e arrastar novos efeitos para a ficha.</p>
      {selectedMagics.length ? <ul className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="Ritos atualmente vinculados">{selectedMagics.map((magic) => <li key={magic!.id} className="border border-[#7d65a3]/40 bg-[#171a18] px-3 py-2"><p className="font-serif text-lg leading-none text-[#f4eee4]">{magic!.name}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#c7b6e7]">{magic!.discipline} · {getOneRingMagicReference(magic!)}</p></li>)}</ul> : <p className="mt-4 border border-dashed border-[#7d65a3]/50 px-3 py-3 text-sm text-[#b8b3a8]">Nenhum rito de Veyr foi vinculado a este companheiro.</p>}
    </TabsContent>
    <TabsContent value="magias" className="mt-4">
      <OneRingMagicPanel selectedIds={selectedIds} onChange={onChange} favoriteIds={favoriteIds} onFavoritesChange={onFavoritesChange} />
    </TabsContent>
  </Tabs>;
}
