import { Link2, LoaderCircle, Unlink } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function CharacterShareLinkButton({ characterId }: { characterId: number | null }) {
  const createLink = trpc.characters.createShareLink.useMutation({ onSuccess: async ({ token }) => { const link = `${window.location.origin}/compartilhar/ficha/${token}`; try { await navigator.clipboard.writeText(link); toast.success("Link exclusivo copiado. Gere outro a qualquer momento para substituir este."); } catch { window.prompt("Copie o link exclusivo da ficha:", link); } }, onError: (error) => toast.error(error.message) });
  const revokeLink = trpc.characters.revokeShareLink.useMutation({ onSuccess: () => toast.success("Link exclusivo revogado."), onError: (error) => toast.error(error.message) });
  const create = () => { if (!characterId) { toast.error("Salve a ficha antes de gerar um link exclusivo."); return; } createLink.mutate({ characterId }); };
  return <div className="flex gap-2"><Button onClick={create} disabled={createLink.isPending} variant="outline" className="h-11 rounded-none border-[#83a89a]/60 bg-[#83a89a]/10 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f4eee4] hover:bg-[#83a89a]/20">{createLink.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}{createLink.isPending ? "Gerando link" : "Link da ficha"}</Button><Button onClick={() => characterId && revokeLink.mutate({ characterId })} disabled={!characterId || revokeLink.isPending} variant="outline" aria-label="Revogar link da ficha" className="h-11 w-11 rounded-none border-white/20 text-[#ffb08e] hover:border-[#b55b32] hover:text-[#ffb08e]">{revokeLink.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}</Button></div>;
}
