import { trpc } from "@/lib/trpc";
import { V5_STORE } from "@shared/vampire-v5";
import { Link2, PackageCheck } from "lucide-react";
import React from "react";
import { useRoute } from "wouter";

export default function SharedShoppingList() {
  const [, params] = useRoute("/compartilhar/lista/:token");
  const shared = trpc.shoppingLists.sharedByToken.useQuery({ token: params?.token || "" }, { enabled: Boolean(params?.token) });
  if (shared.isLoading) return <main className="min-h-screen bg-[#101211] p-10 text-[#eae3d5]">Abrindo lista compartilhada…</main>;
  if (!shared.data) return <main className="min-h-screen bg-[#101211] p-10 text-[#eae3d5]">Esta lista não está disponível.</main>;
  const items = shared.data.items.map((entry) => ({ ...entry, catalog: V5_STORE.find((item) => item.id === entry.itemId) })).filter((entry) => entry.catalog);
  const total = items.reduce((sum, entry) => sum + entry.catalog!.resources, 0);
  const acquired = items.filter((entry) => entry.isAcquired).reduce((sum, entry) => sum + entry.catalog!.resources, 0);
  return <main className="min-h-screen bg-[#101211] px-5 py-10 text-[#eae3d5]"><article className="mx-auto max-w-3xl border border-[#b55b32]/45 bg-[#171a18] p-6 sm:p-9"><p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.16em] text-[#ffb08e]"><Link2 className="h-4 w-4" /> Lista compartilhada com o narrador</p><h1 className="mt-3 font-serif text-5xl leading-none text-[#f4eee4]">{shared.data.title}</h1><p className="mt-3 text-sm text-[#a9c7bb]">Campanha · {shared.data.campaignTitle}</p><div className="mt-6 grid gap-3 border-y border-white/10 py-4 sm:grid-cols-3"><p><small className="block text-[9px] uppercase tracking-[.12em] text-[#a9c7bb]">Planejado</small>{total} Recursos</p><p><small className="block text-[9px] uppercase tracking-[.12em] text-[#a9c7bb]">Adquirido</small>{acquired} Recursos</p><p><small className="block text-[9px] uppercase tracking-[.12em] text-[#a9c7bb]">Pendente</small>{total - acquired} Recursos</p></div><div className="mt-6 space-y-2">{items.map(({ itemId, isAcquired, catalog }) => <div key={itemId} className="flex items-center justify-between border border-white/10 p-3"><div><p className="font-serif text-xl text-[#f4eee4]">{catalog!.name}</p><p className="text-xs text-[#b8b3a8]">Recursos {catalog!.resources} · {catalog!.specification}</p></div>{isAcquired ? <span className="flex items-center gap-1 text-xs text-[#a9c7bb]"><PackageCheck className="h-4 w-4" /> Adquirido</span> : <span className="text-xs text-[#ffb08e]">Pendente</span>}</div>)}</div></article></main>;
}
