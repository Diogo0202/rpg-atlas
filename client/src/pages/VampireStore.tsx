import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { V5_STORE, filterV5Store, type V5DamageFilter, type V5SheetData } from "@shared/vampire-v5";
import { Armchair, Car, Check, Filter, Home, Shield, ShoppingBag, Sword } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type StoreTab = "arsenal" | "compras";
const categories = { arma: "Armas", armadura: "Armaduras", equipamento: "Equipamento", roupa: "Vestuário", moradia: "Moradias", veiculo: "Veículos", montaria: "Montarias" } as const;
type DamageFilter = V5DamageFilter;
const damageLabel: Record<DamageFilter, string> = { all: "Todo dano", balistico: "Balístico", cortante: "Cortante", contundente: "Contundente", incapacitante: "Incapacitante", narrativo: "Sem dano" };
function inferDamageType(item: typeof V5_STORE[number]): DamageFilter {
  if (item.damage === undefined) return "narrativo";
  if (["pistola", "revolver", "submetralhadora", "rifle", "espingarda"].includes(item.id)) return "balistico";
  if (["faca", "espada", "machete", "machado", "arco"].includes(item.id)) return "cortante";
  if (item.id === "gas") return "incapacitante";
  return "contundente";
}

function StoreContent() {
  const utils = trpc.useUtils();
  const { data: characters = [] } = trpc.characters.mine.useQuery();
  const vampires = useMemo(() => characters.filter((character) => character.systemId === "vampiro-v5"), [characters]);
  const [tab, setTab] = useState<StoreTab>("arsenal");
  const [category, setCategory] = useState<keyof typeof categories | "all">("all");
  const [damageFilter, setDamageFilter] = useState<DamageFilter>("all");
  const [maxResources, setMaxResources] = useState(5);
  const [characterId, setCharacterId] = useState("");
  const update = trpc.characters.update.useMutation({ onSuccess: async () => { await utils.characters.mine.invalidate(); toast.success("Aquisição registrada na ficha."); }, onError: (error) => toast.error(error.message) });
  const tabCategories: Array<keyof typeof categories> = tab === "arsenal" ? ["arma", "armadura", "equipamento"] : ["equipamento", "roupa", "moradia", "veiculo", "montaria"];
  const visible = filterV5Store(V5_STORE, { categories: tabCategories, category, maxResources, damageType: damageFilter });
  const addToSheet = (itemId: string) => {
    const character = vampires.find((entry) => entry.id === Number(characterId));
    if (!character) { toast.error("Selecione uma ficha V5 antes de registrar uma aquisição."); return; }
    const sheet = (character.sheetData || {}) as Partial<V5SheetData>;
    const item = V5_STORE.find((entry) => entry.id === itemId);
    const resources = (sheet.advantages || []).find((entry) => entry.name === "Recursos")?.dots ?? 0;
    if (!item) { toast.error("Registro de aquisição não encontrado."); return; }
    if (resources < item.resources) { toast.error(`Esta aquisição exige Recursos ${item.resources}; a ficha possui Recursos ${resources}.`); return; }
    if ((sheet.inventory || []).includes(itemId)) { toast.error("Este item já está registrado no inventário da ficha."); return; }
    const inventory = [...(sheet.inventory || []), itemId];
    update.mutate({ characterId: character.id, name: character.name, concept: character.concept || undefined, campaignId: character.campaignId ?? null, sheetData: { ...sheet, inventory } });
  };

  return <div className="min-h-screen bg-[#101211] text-[#eae3d5]"><div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10"><header className="border-b border-white/10 pb-7"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#83a89a]">Vampiro V5 · aquisições 09</p><div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><h1 className="font-serif text-5xl leading-none tracking-[-0.04em] text-[#f4eee4]">Arsenal e<br />casa de recursos.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#b8b3a8]">Especificações organizadas em pontos de Recursos. Escolha uma ficha para registrar armas, proteção, equipamento ou bens de cena no inventário dela.</p></div><select value={characterId} onChange={(event) => setCharacterId(event.target.value)} className="h-11 border border-[#b55b32]/55 bg-[#171a18] px-3 text-sm text-[#eae3d5]"><option value="">Ficha que receberá a aquisição</option>{vampires.map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}</select></div></header>
  <section className="mt-7 border-b border-white/10 pb-4"><div className="flex flex-wrap gap-2"><Button onClick={() => { setTab("arsenal"); setCategory("all"); }} className={`rounded-none ${tab === "arsenal" ? "bg-[#b55b32] text-[#101211]" : "border border-white/15 bg-transparent text-[#eae3d5]"}`}><Sword className="mr-2 h-4 w-4" /> Arsenal</Button><Button onClick={() => { setTab("compras"); setCategory("all"); }} className={`rounded-none ${tab === "compras" ? "bg-[#b55b32] text-[#101211]" : "border border-white/15 bg-transparent text-[#eae3d5]"}`}><ShoppingBag className="mr-2 h-4 w-4" /> Compras</Button><div className="ml-0 flex flex-wrap gap-2 lg:ml-auto"><button onClick={() => setCategory("all")} className={`px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] ${category === "all" ? "border-b-2 border-[#83a89a] text-[#a9c7bb]" : "text-[#b8b3a8]"}`}>Todas</button>{tabCategories.map((key) => <button key={key} onClick={() => setCategory(key)} className={`px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] ${category === key ? "border-b-2 border-[#83a89a] text-[#a9c7bb]" : "text-[#b8b3a8]"}`}>{categories[key]}</button>)}</div></div><div className="mt-4 grid gap-3 border-t border-dashed border-white/15 pt-4 md:grid-cols-3"><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#a9c7bb]"><span className="flex items-center gap-2"><Filter className="h-3.5 w-3.5 text-[#d27648]" /> Tipo de dano</span><select value={damageFilter} onChange={(event) => setDamageFilter(event.target.value as DamageFilter)} className="h-10 border border-white/15 bg-[#101211] px-2 text-sm normal-case tracking-normal text-[#eae3d5]">{Object.entries(damageLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#a9c7bb]">Custo máximo em Recursos<input type="range" min="1" max="5" value={maxResources} onChange={(event) => setMaxResources(Number(event.target.value))} className="accent-[#b55b32]" /><span className="text-sm normal-case tracking-normal text-[#f4eee4]">Até Recursos {maxResources}</span></label><div className="flex items-end text-sm text-[#b8b3a8]"><span><strong className="text-[#f4eee4]">{visible.length}</strong> registros correspondem à consulta.</span></div></div></section>
  <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((item) => <article key={item.id} className="relative overflow-hidden border border-white/10 bg-[#171a18] p-5"><div className="absolute inset-0 dossier-grid opacity-15" /><div className="relative"><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">{categories[item.category]}</p><h2 className="mt-2 font-serif text-3xl leading-none text-[#f4eee4]">{item.name}</h2></div><span className="border border-[#b55b32]/65 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#ffb08e]">Recursos {item.resources}</span></div><p className="mt-4 min-h-12 text-sm leading-6 text-[#c7c1b5]">{item.specification}</p><div className="mt-4 flex gap-3 border-y border-white/10 py-3 text-xs"><span className="flex items-center gap-1 text-[#a9c7bb]">{item.damage !== undefined ? <Sword className="h-3.5 w-3.5" /> : item.armor !== undefined ? <Shield className="h-3.5 w-3.5" /> : item.category === "moradia" ? <Home className="h-3.5 w-3.5" /> : item.category === "veiculo" ? <Car className="h-3.5 w-3.5" /> : <Armchair className="h-3.5 w-3.5" />}{item.damage !== undefined ? `Dano +${item.damage}` : item.armor !== undefined ? `Proteção +${item.armor}` : "Aquisição narrativa"}</span></div><Button onClick={() => addToSheet(item.id)} disabled={update.isPending} className="mt-4 h-10 w-full rounded-none border border-[#b55b32]/60 bg-[#b55b32]/10 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f4eee4] hover:bg-[#b55b32]/20"><Check className="mr-2 h-4 w-4" /> Registrar na ficha</Button></div></article>)}</section></div></div>;
}

export default function VampireStore() { return <DashboardLayout><StoreContent /></DashboardLayout>; }
