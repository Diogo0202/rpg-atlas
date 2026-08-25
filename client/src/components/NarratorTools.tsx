/**
 * Design philosophy: Arquivo Obsidiano — the tools are rendered as indexed records,
 * with useful session-ready content instead of generic dashboard cards.
 */
import { useState } from "react";
import { Check, Copy, Dices, RefreshCw, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

type Territory = "Véspera do Vau" | "Ermo de Karzath" | "Velas Mortas";

type Hook = {
  code: string;
  title: string;
  territory: Territory;
  premise: string;
  pressure: string;
  witness: string;
  memory: string;
  reward: string;
  escalation: string;
};

type Npc = {
  code: string;
  name: string;
  role: string;
  appearance: string;
  desire: string;
  fear: string;
  secret: string;
  offer: string;
  betrayal: string;
  profile: { body: number; heart: number; wits: number; resistance: number; hope: number };
};

const hooksByTerritory: Record<Territory, Omit<Hook, "code" | "territory">[]> = {
  "Véspera do Vau": [
    { title: "A lista que cresce sozinha", premise: "Uma lista de travessias começa a registrar nomes de pessoas que ainda não cruzaram o Rio Cinéreo.", pressure: "O Conselho dos Marcos exige silêncio antes que a Companhia do Sal Negro use a lista para vender proteção.", witness: "Uma aprendiz de escrivã viu um nome ser escrito por uma mão molhada dentro do próprio livro.", memory: "A última travessia de um parente desaparecido voltou a constar como paga.", reward: "Um salvo-conduto pelos marcos e um nome verdadeiro esquecido.", escalation: "Se a lista alcançar doze nomes, o Sino de Namar chama todos ao mesmo tempo." },
    { title: "O quarto toque", premise: "Três toques do Sino de Namar são rotina; o quarto anuncia que a cidade perdeu uma memória coletiva.", pressure: "A Lanterna de Sal quer isolar as margens, mas a população teme que o bloqueio esconda uma prisão.", witness: "Um barqueiro afirma ter levado uma mulher sem rosto para o centro do rio.", memory: "A canção que cada Herói aprendeu na infância perdeu um verso essencial.", reward: "Acesso a uma rota de sal que não existe em mapas públicos.", escalation: "Cada noite sem resposta transforma mais uma casa em endereço sem dono." },
    { title: "Vidro sob a ponte", premise: "Fragmentos verdes brotam sob a ponte do vau e refletem cenas que ainda não aconteceram.", pressure: "Os Vidreiros Errantes oferecem uma saída, mas o Conselho exige que os espelhos sejam destruídos.", witness: "Uma criança reconhece nos reflexos uma versão adulta de si mesma entregando o sino a alguém.", memory: "Um juramento que um Herói nunca fez aparece como quebrado no vidro.", reward: "Uma rota secreta, um favor dos Vidreiros e uma pergunta respondida pelo reflexo.", escalation: "Quando o último fragmento partir, uma das previsões se torna inevitável." },
  ],
  "Ermo de Karzath": [
    { title: "A coroa sob as cinzas", premise: "Uma escavação revelou um aro de bronze que sussurra o título de quem o toca, mas nunca o nome completo.", pressure: "A Cidadela de Escória quer fundir o objeto; os Clãs do Vidro Negro querem provar que ele pertence ao Rei Sem Fornalha.", witness: "Um ferreiro sem memória do próprio rosto afirma ter ouvido a coroa negar um pedido de guerra.", memory: "A lembrança de uma derrota pessoal passa a ter cheiro de metal queimado.", reward: "Uma marca de passagem pelas forjas e uma audiência indireta com um Cavaleiro de Escória.", escalation: "Se a coroa for aquecida, ela escolherá um portador e fechará todas as saídas da escavação." },
    { title: "O cavaleiro que não golpeia", premise: "Um Cavaleiro de Escória bloqueia uma rota vital, mas responde a violência apenas ajoelhando-se em silêncio.", pressure: "Os Barqueiros precisam da rota aberta; a Irmandade da Cinza Oca quer usar o impasse como propaganda.", witness: "Uma mensageira encontrou na armadura uma inscrição idêntica a uma promessa feita por um Herói.", memory: "A memória de uma pessoa esquecida pode libertar o guardião, mas custa uma verdade presente.", reward: "Uma chave de bronze e proteção contra uma patrulha da Cidadela.", escalation: "Quando o sol baixar, o Cavaleiro aceitará uma ordem de execução sem poder desobedecer." },
    { title: "Forja para ninguém", premise: "Uma fornalha abandonada produz armas com nomes gravados de pessoas que nunca existiram.", pressure: "A Companhia do Sal Negro quer vender as lâminas; os Forjados Sem Nome querem destruí-las antes que criem soldados.", witness: "Um catador reconhece seu próprio nome numa espada que lembra uma vida impossível.", memory: "Cada arma aceita uma lembrança para se tornar mais poderosa.", reward: "Uma ferramenta de Ofício singular e o mapa de um corredor sob a forja.", escalation: "Depois de sete armas, a fornalha exigirá um nome vivo para completar a oitava." },
  ],
  "Velas Mortas": [
    { title: "A vela que não se apaga", premise: "Uma vela funerária segue acesa há quarenta dias e ilumina apenas as mentiras ditas perto dela.", pressure: "O Círculo das Velas Mortas pede contenção; os Coletores de Ossos de Sal querem capturar sua chama.", witness: "Uma criança do pântano diz que a vela fala com a voz de uma pessoa que todos juram nunca ter conhecido.", memory: "O primeiro segredo que um Herói contar perto da chama deixa de pertencer somente a ele.", reward: "Um nome recuperado e a bênção temporária de uma rota sobre a água.", escalation: "Ao apagar, a vela devolve todas as mentiras de uma vez para seus donos." },
    { title: "O enterro que caminha", premise: "Uma procissão de barcas vazias atravessa o pântano ao amanhecer, sempre rumo a uma tumba sem nome.", pressure: "A Irmandade do Lodo oferece cura em troca da rota; os Barqueiros temem perder o comércio do Rio Velado.", witness: "Uma viúva viu a própria sombra embarcar na primeira barca.", memory: "Cada parada da procissão mostra uma perda que o grupo decidiu ignorar.", reward: "Cura de uma Fadiga grave e um juramento de abrigo dos Barqueiros.", escalation: "Se ninguém entrar na tumba antes do anoitecer, a procissão volta trazendo alguém que não deveria retornar." },
    { title: "Sal para os mortos", premise: "A água do pântano ficou doce e os mortos começaram a esquecer por que descansam.", pressure: "Os Coletores culpam a Cidadela; o Círculo suspeita de uma barganha feita para drenar a região.", witness: "Um guardião de túmulo carrega um frasco de sal com o brasão de um aliado do grupo.", memory: "Para restaurar o sal, alguém deve nomear uma perda que ainda tenta esconder.", reward: "Passagem segura pelos canais e uma vela que revela uma presença invisível.", escalation: "A cada noite, um túmulo abre e pede uma tarefa inacabada." },
  ],
};

const npcNames = ["Mara Veld", "Ivo Cantar", "Noa Cinzamar", "Rian da Ponte", "Talma Breu", "Elen Vidro", "Daro Avel", "Sila Orvalho", "Bren Salferro", "Yara Vau" ];
const npcRoles = ["escrivã de marcos", "barqueiro de juramentos", "ferreira sem nome", "vigia de lanterna", "contrabandista de memória", "devota das velas", "batedor de cinzas", "curadora de Fadiga", "negociador da Cidadela", "mensageira do pântano"];
const npcAppearances = ["Dedos manchados de sal e um casaco que cheira a rio.", "Um olho de vidro negro e luvas de trabalho queimadas.", "Cabelos presos por uma tira de cobre; fala olhando para as rotas, não para as pessoas.", "Veste luto antigo, mas carrega uma lanterna impecável.", "Tem cinza sob as unhas e uma voz baixa demais para a distância."];
const npcDesires = ["proteger uma rota que mantém uma família inteira viva", "comprar de volta uma memória vendida", "provar que um juramento foi forjado", "tirar alguém do mapa antes que o Conselho o encontre", "impedir que uma fornalha receba mais um nome"];
const npcFears = ["ser lembrado pela pessoa errada", "perder o último vínculo com a própria origem", "ver sua facção transformar proteção em domínio", "descobrir que seu maior sacrifício não salvou ninguém", "ter de escolher entre uma cidade e uma pessoa"];
const npcSecrets = ["já ouviu o Sino de Namar chamar seu nome verdadeiro", "deve um favor ao Rei Sem Fornalha", "guardou uma vela com uma lembrança roubada", "falsificou um registro que agora está voltando à tona", "é a única testemunha de um pacto entre duas facções"];
const npcOffers = ["uma passagem discreta pelos marcos", "um mapa com uma rota que muda a cada lua", "uma verdade curta sobre o Eco sem Nome", "uma cura provisória para Fadiga", "um encontro seguro com alguém que não deveria ser encontrado"];
const npcBetrayals = ["entrega o grupo se a própria família for ameaçada", "omite o preço real do favor até a última cena", "segue uma ordem antiga que contradiz sua fala", "troca uma memória do grupo por proteção para si", "pede ajuda para testar se os Heróis merecem confiança"];

function pick<T>(items: T[]) { return items[Math.floor(Math.random() * items.length)]; }
function number(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function createHook(territory: Territory): Hook {
  const base = pick(hooksByTerritory[territory]);
  return { ...base, territory, code: `G-${territory.slice(0, 2).toUpperCase()}-${number(11, 99)}` };
}

function createNpc(): Npc {
  const heart = number(1, 4);
  return {
    code: `NPC-${number(100, 999)}`,
    name: pick(npcNames), role: pick(npcRoles), appearance: pick(npcAppearances), desire: pick(npcDesires), fear: pick(npcFears), secret: pick(npcSecrets), offer: pick(npcOffers), betrayal: pick(npcBetrayals),
    profile: { body: number(1, 5), heart, wits: number(1, 5), resistance: 20 + heart, hope: 8 + heart },
  };
}

function CopyRecord({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return <button onClick={copy} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#83a89a] transition-colors hover:text-[#eae3d5]">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copiado" : "Copiar registro"}</button>;
}

export default function NarratorTools() {
  const [territory, setTerritory] = useState<Territory>("Véspera do Vau");
  const [hook, setHook] = useState<Hook>(() => createHook("Véspera do Vau"));
  const [npc, setNpc] = useState<Npc>(() => createNpc());

  const hookText = `${hook.title}\n${hook.territory} · ${hook.code}\nPremissa: ${hook.premise}\nPressão: ${hook.pressure}\nTestemunha: ${hook.witness}\nMemória em risco: ${hook.memory}\nRecompensa: ${hook.reward}\nEscalada: ${hook.escalation}`;
  const npcText = `${npc.name} · ${npc.role} · ${npc.code}\nAparência: ${npc.appearance}\nDesejo: ${npc.desire}\nMedo: ${npc.fear}\nSegredo: ${npc.secret}\nOferta: ${npc.offer}\nTraição possível: ${npc.betrayal}\nCorpo ${npc.profile.body} · Coração ${npc.profile.heart} · Esperteza ${npc.profile.wits} · Resistência ${npc.profile.resistance} · Esperança ${npc.profile.hope}`;

  return (
    <section id="narrador" className="archive-paper relative text-[#161715]">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <div>
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a876d]"><span className="grid h-7 w-7 place-items-center border border-[#b55b32] font-serif text-[15px] text-[#b55b32]">N</span> 05 · estação do narrador · uso ao vivo</div>
            <h2 className="mt-5 font-serif text-[58px] leading-[0.88] tracking-[-0.05em] sm:text-[76px]">Ganchos e<br />rostos rápidos.</h2>
            <p className="mt-8 max-w-[420px] text-[17px] leading-8 text-[#484b45]">Ferramentas prontas para abrir uma cena quando a mesa toma um desvio inesperado. Todo resultado preserva o princípio de Veyr: ambiente, testemunha e memória em risco.</p>
            <div className="mt-10 border-y border-[#161715]/15 py-6 text-[13px] leading-6 text-[#585b53]"><strong className="font-semibold text-[#161715]">Procedimento:</strong> escolha o território, gere o registro e adapte apenas o que a ficção já estabeleceu. As fichas usam os valores caseiros recomendados de Corpo, Coração, Esperteza, Resistência e Esperança.</div>
          </div>

          <div className="grid gap-7">
            <article className="border border-[#161715]/20 bg-[#eee7db]/85 p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-5 border-b border-[#161715]/15 pb-5 sm:flex-row sm:items-start">
                <div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#b55b32]"><Dices className="h-3.5 w-3.5" /> Gerador de gancho</div><h3 className="mt-3 font-serif text-[34px] leading-none">Registro de incidente</h3></div>
                <CopyRecord text={hookText} />
              </div>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <label className="flex max-w-[280px] flex-1 flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#65675f]">Território
                  <select value={territory} onChange={(event) => { const next = event.target.value as Territory; setTerritory(next); setHook(createHook(next)); }} className="h-11 border border-[#161715]/25 bg-transparent px-3 text-[13px] font-semibold normal-case tracking-normal text-[#161715] outline-none focus:border-[#b55b32]">
                    {(Object.keys(hooksByTerritory) as Territory[]).map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <Button onClick={() => setHook(createHook(territory))} className="h-11 rounded-none bg-[#b55b32] px-5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#161715] hover:bg-[#d27648]"><RefreshCw className="mr-2 h-4 w-4" /> Gerar gancho</Button>
              </div>
              <div className="mt-7 border-l-2 border-[#b55b32] pl-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2"><span className="font-serif text-[31px] leading-none">{hook.title}</span><span className="border border-[#b55b32]/35 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#b55b32]">{hook.code}</span></div>
                <p className="mt-3 text-[15px] leading-7 text-[#3f423b]">{hook.premise}</p>
              </div>
              <div className="mt-7 grid border-t border-[#161715]/15 sm:grid-cols-2">
                {[["Pressão", hook.pressure], ["Testemunha", hook.witness], ["Memória em risco", hook.memory], ["Recompensa", hook.reward], ["Escalada", hook.escalation]].map(([label, value], index) => <div key={label} className={`p-4 ${index < 4 ? "border-b border-[#161715]/15" : ""} ${index % 2 === 0 ? "sm:border-r" : ""}`}><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#7a876d]">{label}</p><p className="mt-2 text-[13px] leading-6 text-[#4e5149]">{value}</p></div>)}
              </div>
            </article>

            <article className="bg-[#171a18] p-6 text-[#eae3d5] sm:p-8">
              <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-start">
                <div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#83a89a]"><UserRound className="h-3.5 w-3.5" /> Ficha rápida de NPC</div><h3 className="mt-3 font-serif text-[34px] leading-none">Pessoa em foco</h3></div>
                <CopyRecord text={npcText} />
              </div>
              <div className="mt-6 flex justify-end"><Button onClick={() => setNpc(createNpc())} variant="outline" className="h-11 rounded-none border-[#eae3d5]/30 bg-transparent px-5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#eae3d5] hover:bg-[#eae3d5]/10 hover:text-[#f4eee4]"><RefreshCw className="mr-2 h-4 w-4" /> Gerar NPC</Button></div>
              <div className="mt-6 grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
                <div className="border-l-2 border-[#83a89a] pl-5"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#83a89a]">{npc.code} · {npc.role}</p><h4 className="mt-3 font-serif text-[39px] leading-none">{npc.name}</h4><p className="mt-4 text-[14px] leading-6 text-[#b7b3a9]">{npc.appearance}</p><div className="mt-7 grid grid-cols-3 gap-2"><div><p className="text-[9px] uppercase tracking-[0.12em] text-[#85897f]">Corpo</p><p className="font-serif text-[28px] text-[#d27648]">{npc.profile.body}</p></div><div><p className="text-[9px] uppercase tracking-[0.12em] text-[#85897f]">Coração</p><p className="font-serif text-[28px] text-[#d27648]">{npc.profile.heart}</p></div><div><p className="text-[9px] uppercase tracking-[0.12em] text-[#85897f]">Esp.</p><p className="font-serif text-[28px] text-[#d27648]">{npc.profile.wits}</p></div></div></div>
                <div className="grid gap-0 border-t border-white/10 sm:grid-cols-2">{[["Desejo", npc.desire], ["Medo", npc.fear], ["Segredo", npc.secret], ["Oferta", npc.offer], ["Traição", npc.betrayal]].map(([label, value], index) => <div key={label} className={`p-4 ${index < 4 ? "border-b border-white/10" : ""} ${index % 2 === 0 ? "sm:border-r" : ""}`}><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#83a89a]">{label}</p><p className="mt-2 text-[13px] leading-6 text-[#c9c3b8]">{value}</p></div>)}</div>
              </div>
              <div className="mt-6 flex gap-6 border-t border-white/10 pt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a6a397]"><span>Resistência <strong className="ml-1 text-[#eae3d5]">{npc.profile.resistance}</strong></span><span>Esperança <strong className="ml-1 text-[#eae3d5]">{npc.profile.hope}</strong></span></div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
