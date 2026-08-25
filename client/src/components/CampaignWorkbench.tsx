/**
 * Design philosophy: Arquivo Obsidiano — campaign selection is treated as a filed record,
 * while generated items read like recovered evidence from the active campaign.
 */
import { useEffect, useState } from "react";
import { Check, Copy, Dices, MapPinned, Plus, RefreshCw, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";

type Campaign = { id: string; name: string; setting: string; register: string; tone: string };
type CampaignItem = { id: string; campaign: string; name: string; kind: string; description: string; cost: string; complication: string };

const initialCampaigns: Campaign[] = [
  { id: "coroa-partida", name: "A Coroa Partida", setting: "Véspera do Vau", register: "REG-04", tone: "memória, juramento e rio" },
  { id: "sino-afogado", name: "O Sino Afogado", setting: "Velas Mortas", register: "REG-11", tone: "luto, pântano e ecos" },
  { id: "fornalha-sem-rei", name: "A Fornalha sem Rei", setting: "Ermo de Karzath", register: "REG-17", tone: "escória, contrato e sobrevivência" },
];

const itemSeeds: Record<string, Omit<CampaignItem, "id" | "campaign">[]> = {
  "coroa-partida": [
    { name: "Selo de travessia apagado", kind: "documento de passagem", description: "Uma marca de cobre que abre um único marco do Vau quando molhada com água do Rio Cinéreo.", cost: "Exige o nome de alguém que não cruzará ao seu lado.", complication: "O Conselho dos Marcos reconhece a fraude antes do amanhecer." },
    { name: "Fragmento da Coroa Partida", kind: "relíquia de memória", description: "Bronze frio que reproduz o último juramento ouvido por quem o segura em silêncio.", cost: "A lembrança reproduzida perde uma cor, um rosto ou uma data.", complication: "A Companhia do Sal Negro oferece pagamento por ele antes que o grupo o use." },
    { name: "Lâmpada de maré baixa", kind: "instrumento ritual", description: "Lanterna que expõe pegadas na margem, inclusive as deixadas por uma lembrança que ganhou corpo.", cost: "Sua luz atrai o Eco sem Nome por uma cena.", complication: "A chama revela uma rota que não deveria existir." },
  ],
  "sino-afogado": [
    { name: "Vela de nome devolvido", kind: "vela funerária", description: "Queima sem vento e permite chamar um morto pelo nome que ele esqueceu ao atravessar o pântano.", cost: "A pessoa que acende a vela perde uma lembrança de infância até o próximo descanso.", complication: "O chamado pode responder na voz de outra pessoa." },
    { name: "Rosário de sal velho", kind: "amuleto de vigília", description: "Grãos duros que indicam qual túmulo foi aberto desde a última chuva.", cost: "Cada uso deixa sal na língua e reduz a esperança em uma conversa social.", complication: "Coletores de Ossos de Sal seguem seu rastro." },
    { name: "Bilhete do barqueiro morto", kind: "mapa incompleto", description: "Rota dobrada que leva a uma barca vazia antes da madrugada.", cost: "A viagem cobra uma promessa verbal de todos a bordo.", complication: "O destino escrito muda quando alguém mente." },
  ],
  "fornalha-sem-rei": [
    { name: "Chave de escória fria", kind: "ferramenta de forja", description: "Abre uma comporta da Cidadela e silencia temporariamente os sinos de ferro próximos.", cost: "A mão que gira a chave fica marcada como propriedade da forja.", complication: "Um Cavaleiro de Escória reconhece a marca e exige uma ordem." },
    { name: "Moeda do contrato impossível", kind: "garantia comercial", description: "Uma moeda pesada aceita como pagamento por qualquer rota proibida da Companhia.", cost: "O comprador escolhe depois qual favor foi realmente vendido.", complication: "A moeda retorna ao bolso de quem mais tem a perder." },
    { name: "Máscara do ferreiro sem rosto", kind: "artefato de ofício", description: "Permite reparar uma arma quebrada usando uma memória do portador como matéria-prima.", cost: "A memória fica inacessível até a arma ser destruída ou oferecida.", complication: "A arma reparada sussurra o nome de seu dono anterior." },
  ],
};

const genericItems: Omit<CampaignItem, "id" | "campaign">[] = [
  { name: "Carta de uma rota impossível", kind: "documento confidencial", description: "Um mapa manuscrito que aponta um caminho seguro apenas enquanto ninguém admite acreditar nele.", cost: "A rota exige que o grupo deixe algo importante para trás.", complication: "A carta conhece um segredo que não foi escrito." },
  { name: "Ampola de bruma memorial", kind: "recurso ritual", description: "Quando quebrada, restaura uma lembrança recente de todos que respiram sua névoa.", cost: "Uma memória mais antiga se embaralha em troca.", complication: "Uma testemunha indesejada recebe a mesma lembrança." },
  { name: "Marca de cobre inquieto", kind: "sinal de facção", description: "Uma insígnia que vibra diante de juramentos quebrados e passagens fechadas.", cost: "A marca escolhe um nome para cobrar depois.", complication: "Uma facção a interpreta como declaração de lealdade." },
];

function safeLoad<T>(key: string, fallback: T): T { try { const stored = window.localStorage.getItem(key); return stored ? JSON.parse(stored) as T : fallback; } catch { return fallback; } }
function pick<T>(items: T[]) { return items[Math.floor(Math.random() * items.length)]; }
function generateItem(campaign: Campaign): CampaignItem { const seed = pick(itemSeeds[campaign.id] ?? genericItems); return { ...seed, id: `IT-${Math.floor(1000 + Math.random() * 9000)}`, campaign: campaign.name }; }

export default function CampaignWorkbench() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => safeLoad<Campaign[]>("rpg-atlas-campaigns-v1", initialCampaigns));
  const [activeId, setActiveId] = useState(() => safeLoad<string>("rpg-atlas-active-campaign-v1", initialCampaigns[0].id));
  const [draftName, setDraftName] = useState("");
  const [draftSetting, setDraftSetting] = useState("");
  const activeCampaign = campaigns.find((campaign) => campaign.id === activeId) ?? campaigns[0];
  const [item, setItem] = useState<CampaignItem>(() => generateItem(initialCampaigns[0]));
  const [copied, setCopied] = useState(false);

  useEffect(() => { window.localStorage.setItem("rpg-atlas-campaigns-v1", JSON.stringify(campaigns)); }, [campaigns]);
  useEffect(() => { window.localStorage.setItem("rpg-atlas-active-campaign-v1", JSON.stringify(activeId)); }, [activeId]);

  const selectCampaign = (id: string) => { const next = campaigns.find((campaign) => campaign.id === id) ?? campaigns[0]; setActiveId(next.id); setItem(generateItem(next)); };
  const addCampaign = () => { const name = draftName.trim(); if (!name) return; const campaign: Campaign = { id: `campanha-${Date.now()}`, name, setting: draftSetting.trim() || "Território não catalogado", register: `REG-${String(campaigns.length + 18).padStart(2, "0")}`, tone: "segredos, território e consequência" }; setCampaigns((current) => [...current, campaign]); setDraftName(""); setDraftSetting(""); setActiveId(campaign.id); setItem(generateItem(campaign)); };
  const itemRecord = `${item.name}\n${item.campaign} · ${item.id}\nTipo: ${item.kind}\nFunção: ${item.description}\nPreço: ${item.cost}\nComplicação: ${item.complication}`;
  const copyItem = async () => { await navigator.clipboard?.writeText(itemRecord); setCopied(true); window.setTimeout(() => setCopied(false), 1500); };

  return <article className="border border-[#161715]/20 bg-[#eee7db]/85 p-6 sm:p-8"><div className="flex flex-col justify-between gap-5 border-b border-[#161715]/15 pb-5 lg:flex-row lg:items-start"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#b55b32]"><ScrollText className="h-3.5 w-3.5" /> Arquivo de campanhas</div><h3 className="mt-3 font-serif text-[34px] leading-none">Preparar a próxima cena.</h3><p className="mt-3 max-w-[550px] text-[13px] leading-6 text-[#575a52]">Escolha o registro em curso, alterne a campanha ou abra um novo dossiê local. O gerador de itens muda seu vocabulário conforme o mundo ativo.</p></div><div className="border border-[#b55b32]/35 bg-[#f7efe3] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8a4630]">{activeCampaign?.register ?? "REG-00"} · ativo</div></div><div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><div className="border-r-0 border-[#161715]/15 lg:border-r lg:pr-6"><label className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#65675f]">Campanha em curso<select value={activeCampaign?.id ?? ""} onChange={(event) => selectCampaign(event.target.value)} className="h-11 border border-[#161715]/25 bg-[#f7efe3] px-3 text-[13px] font-semibold normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]">{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name} · {campaign.setting}</option>)}</select></label><div className="mt-5 border-l-2 border-[#b55b32] pl-4"><p className="font-serif text-[28px] leading-none">{activeCampaign?.name}</p><p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7a876d]">{activeCampaign?.setting}</p><p className="mt-3 text-[13px] leading-6 text-[#575a52]">Tom do arquivo: {activeCampaign?.tone}</p></div><div className="mt-6 border-t border-[#161715]/15 pt-5"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#65675f]">Abrir novo dossiê</p><div className="mt-3 grid gap-2"><input value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="Nome da campanha" className="h-10 border border-[#161715]/25 bg-transparent px-3 text-[13px] outline-none placeholder:text-[#8a8b83] focus:border-[#b55b32]" /><input value={draftSetting} onChange={(event) => setDraftSetting(event.target.value)} placeholder="Território ou cenário" className="h-10 border border-[#161715]/25 bg-transparent px-3 text-[13px] outline-none placeholder:text-[#8a8b83] focus:border-[#b55b32]" /><button onClick={addCampaign} disabled={!draftName.trim()} className="flex h-10 items-center justify-center gap-2 border border-[#161715]/30 text-[9px] font-bold uppercase tracking-[0.13em] text-[#161715] hover:bg-[#161715] hover:text-[#eae3d5] disabled:opacity-35"><Plus className="h-3.5 w-3.5" /> Guardar campanha</button></div></div></div><div className="bg-[#171a18] p-5 text-[#eae3d5]"><div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#83a89a]"><Dices className="h-3.5 w-3.5" /> Gerador de itens</div><h4 className="mt-2 font-serif text-[30px] leading-none">Achado de {activeCampaign?.name}</h4></div><div className="flex gap-2"><button onClick={copyItem} className="flex h-9 items-center gap-2 border border-white/15 px-3 text-[9px] font-bold uppercase tracking-[0.13em] text-[#c9c3b8] hover:border-[#83a89a] hover:text-[#83a89a]">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copiado" : "Copiar"}</button><Button onClick={() => activeCampaign && setItem(generateItem(activeCampaign))} variant="outline" className="h-9 rounded-none border-[#d27648]/65 bg-transparent px-3 text-[9px] font-bold uppercase tracking-[0.13em] text-[#d27648] hover:bg-[#d27648] hover:text-[#171a18]"><RefreshCw className="mr-2 h-3.5 w-3.5" /> Gerar</Button></div></div><div className="mt-5 border-l-2 border-[#d27648] pl-4"><div className="flex flex-wrap items-center gap-2"><p className="font-serif text-[31px] leading-none">{item.name}</p><span className="border border-[#d27648]/45 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-[#d27648]">{item.id}</span></div><p className="mt-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">{item.kind}</p><p className="mt-4 text-[14px] leading-6 text-[#c9c3b8]">{item.description}</p></div><div className="mt-5 grid border-t border-white/10 sm:grid-cols-2"><div className="p-4 sm:border-r sm:border-white/10"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">Preço</p><p className="mt-2 text-[12px] leading-5 text-[#c9c3b8]">{item.cost}</p></div><div className="border-t border-white/10 p-4 sm:border-t-0"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">Complicação</p><p className="mt-2 text-[12px] leading-5 text-[#c9c3b8]">{item.complication}</p></div></div></div></div></article>;
}
