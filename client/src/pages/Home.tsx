/**
 * Design philosophy: Arquivo Obsidiano — editorial gothic revival, mineral black,
 * aged bone, ember copper and salt green. The page reads like a campaign dossier.
 */
import { useState } from "react";
import { ArrowRight, ChevronRight, Compass, Crosshair, Menu, ScrollText, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import NarratorTools from "@/components/NarratorTools";

const visualAssets = {
  hero: "/manus-storage/veyr-hero_61927817.png",
  sigil: "/manus-storage/veyr-sigil_9fd2f690.png",
  karzath: "/manus-storage/karzath-forge_e4e01e45.png",
  relic: "/manus-storage/namar-relic_0cdce2c5.png",
};

const territories = [
  {
    id: "vespera",
    index: "I",
    name: "Véspera do Vau",
    descriptor: "O rio guarda tudo o que alguém tentou apagar.",
    image: visualAssets.hero,
    tone: "Cidade-porta sobre o Rio Cinéreo",
    text: "O Sino de Namar rouba nomes dos registros e chama pessoas para a água. Entre sal, lanternas e dívidas, os Heróis precisam descobrir o que a cidade escolheu esquecer.",
    stakes: ["Controle do Conselho", "Pânico Popular", "Influência do Eco"],
  },
  {
    id: "karzath",
    index: "II",
    name: "Ermo de Karzath",
    descriptor: "Uma fornalha apagada ainda negocia com a memória.",
    image: visualAssets.karzath,
    tone: "Cinzas, forjas e vidro negro",
    text: "Terras vulcânicas e industriais onde memórias se tornam armas. O Rei Sem Fornalha não é só um inimigo: é uma proposta política que testa o preço de cada juramento.",
    stakes: ["Nome de Coroa", "Cavaleiros de Escória", "Cidadela em ruptura"],
  },
  {
    id: "pantano",
    index: "III",
    name: "Velas Mortas",
    descriptor: "O pântano ilumina aquilo que ainda cobra resposta.",
    image: visualAssets.relic,
    tone: "Luto, sal e lembranças que recusam morrer",
    text: "Um território funerário ligado ao Rio Velado, onde velas revelam o que foi perdido. A cura e a recuperação de nomes existem, mas toda dádiva altera vínculos e facções.",
    stakes: ["Memórias recuperadas", "Testes da Senhora", "Rotas interditadas"],
  },
];

const factions = [
  ["01", "Conselho dos Marcos", "Ordem, registros e uma cidade que teme admitir suas perdas."],
  ["02", "Lanterna de Sal", "Vigias que mantêm a luz acesa enquanto o rio devolve segredos."],
  ["03", "Companhia do Sal Negro", "Rotas, contratos e o tipo de proteção que sempre cobra retorno."],
  ["04", "Vidreiros Errantes", "Trilhas secretas, espelhos opacos e hostilidade da Cidadela."],
  ["05", "Círculo das Velas Mortas", "Nomes recuperados em troca de atenção indesejada."],
];

const workflow = [
  ["Diagnóstico", "Ler materiais, expor lacunas e definir prioridades."],
  ["Mundo e era", "Fixar cronologia, geografia, facções e atmosfera."],
  ["Conflito", "Projetar antagonistas, cultos, valores e fraquezas."],
  ["Continuidade", "Conectar sucessores, linhagens e consequências."],
  ["Mesa", "Balancear poderes, custos, desafios e fichas."],
  ["Entrega", "Consolidar suplementos, mapas, imagens e trilhas."],
];

const chronicles = [
  {
    id: "vampiro",
    index: "01",
    title: "Vampiro: A Máscara",
    eyebrow: "Fome, influência e dívida",
    summary: "A noite é uma rede de favores, territórios e nomes que não podem aparecer à luz. Cada vitória testa aquilo que o personagem ainda considera humano.",
    question: "Que parte de si você entrega para manter a Máscara intacta?",
    pressure: "A dívida chega antes do amanhecer.",
    dossiers: ["Humanidade", "Prestígio", "Segredos"],
  },
  {
    id: "lobisomem",
    index: "02",
    title: "Lobisomem: O Apocalipse",
    eyebrow: "Fúria, território e ruína",
    summary: "A guerra pelo mundo material e espiritual é íntima: a matilha defende o que ainda respira enquanto aprende o preço de transformar indignação em destruição.",
    question: "O que você protege quando a Fúria também quer decidir por você?",
    pressure: "Toda fronteira guarda uma ferida aberta.",
    dossiers: ["Matilha", "Território", "Fúria"],
  },
  {
    id: "mago",
    index: "03",
    title: "Mago: A Ascensão",
    eyebrow: "Vontade, crença e paradoxo",
    summary: "A realidade não é neutra: ela é disputada por convicções, rituais e consequências. O poder amplia a escolha, mas também torna cada contradição impossível de ignorar.",
    question: "Qual verdade continua de pé quando o mundo recusa acreditar nela?",
    pressure: "Toda certeza deixa uma rachadura no real.",
    dossiers: ["Esfera", "Convicção", "Paradoxo"],
  },
];

function VeyrSeal({ className = "", label = "selo de Veyr" }: { className?: string; label?: string }) {
  return (
    <div className={`relative grid place-items-center border border-[#b55b32]/75 bg-[#111312]/85 ${className}`} aria-label={label}>
      <span className="absolute left-2 right-2 top-2 h-[42%] rounded-t-full border-x border-t border-[#83a89a]/70" />
      <span className="absolute inset-[13%] border border-[#eae3d5]/20" />
      <img src={visualAssets.sigil} alt="" className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] object-contain opacity-55" />
      <span className="relative font-serif text-[clamp(1.6rem,2.5vw,2.5rem)] leading-none text-[#eae3d5]">V</span>
      <span className="absolute bottom-2 left-2 right-2 border-t border-dashed border-[#b55b32]/70" />
    </div>
  );
}

function DossierRail({ onNavigate }: { onNavigate: (id: string) => void }) {
  const chapters = [
    ["01", "Campanha", "campanha"],
    ["02", "Facções", "faccoes"],
    ["03", "Método", "metodo"],
    ["04", "Mesa", "mesa"],
    ["05", "Crônicas", "cronicas"],
    ["06", "Narrador", "narrador"],
  ];

  return (
    <aside className="dossier-grid fixed bottom-0 left-0 top-[74px] z-40 hidden w-[132px] border-r border-white/10 bg-[#0e100f] xl:flex xl:flex-col xl:items-center">
      <div className="flex h-[160px] w-full flex-col items-center justify-center border-b border-white/10">
        <p className="mb-3 text-[7px] font-bold uppercase tracking-[0.2em] text-[#83a89a]">RPG Atlas · Veyr</p>
        <VeyrSeal className="h-[78px] w-[78px]" label="Selo de autenticação do arquivo de Veyr" />
        <span className="mt-2 bg-[#0e100f] px-1 text-[8px] font-bold tracking-[0.22em] text-[#83a89a]">V-17 · AUT.</span>
      </div>
      <div className="relative flex w-full flex-1 flex-col items-center py-4">
        <span className="absolute top-0 h-full border-l border-dashed border-[#83a89a]/35" />
        {chapters.map(([number, label, id]) => (
          <button key={id} onClick={() => onNavigate(id)} className="group relative z-10 mb-2 flex h-[54px] w-full flex-col items-center justify-center gap-1 bg-[#0e100f] text-center">
            <span className="font-serif text-[19px] leading-none text-[#b55b32] transition-transform duration-150 group-hover:-translate-y-1">{number}</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#9b978c] transition-colors duration-150 group-hover:text-[#eae3d5]">{label}</span>
          </button>
        ))}
      </div>
      <div className="w-full border-t border-white/10 px-3 py-4 text-center text-[8px] font-bold uppercase tracking-[0.16em] text-[#83a89a]">Arquivo<br />autenticado<br /><span className="text-[#b55b32]">registro 04</span></div>
    </aside>
  );
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [activeTerritory, setActiveTerritory] = useState(territories[0]);
  const [activeChronicle, setActiveChronicle] = useState(chronicles[0]);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[#111312] text-[#eae3d5] selection:bg-[#b55b32] selection:text-[#111312]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111312]/92 backdrop-blur-xl xl:pl-[132px]">
        <div className="mx-auto flex h-[74px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <button onClick={() => navigate("inicio")} className="group flex items-center gap-3 text-left xl:hidden" aria-label="Voltar ao início">
            <img src={visualAssets.sigil} alt="Selo de Veyr" className="h-10 w-10 object-contain transition-transform duration-200 group-hover:-rotate-6" />
            <span className="hidden font-serif text-[18px] tracking-[0.16em] text-[#eae3d5] sm:inline">RPG ATLAS</span>
          </button>

          <div className="hidden xl:block"><p className="font-serif text-[17px] tracking-[0.16em] text-[#eae3d5]">RPG ATLAS</p><p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-[#83a89a]">Registro de campanha 04 / Veyr</p></div>
          <nav className="hidden items-center gap-7 lg:flex xl:hidden" aria-label="Navegação principal">
            {[
              ["Campanha", "campanha"],
              ["Facções", "faccoes"],
              ["Método", "metodo"],
              ["Guia de mesa", "mesa"],
              ["Crônicas", "cronicas"],
              ["Narrador", "narrador"],
            ].map(([label, id]) => (
              <button key={id} onClick={() => navigate(id)} className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#b8b3a8] transition-colors duration-150 hover:text-[#eae3d5]">
                {label}
              </button>
            ))}
          </nav>

          <Button onClick={() => navigate("campanha")} className="hidden rounded-none bg-[#b55b32] px-4 text-[12px] font-bold uppercase tracking-[0.12em] text-[#111312] hover:bg-[#d27648] sm:flex xl:hidden">
            Abrir registro <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="grid h-10 w-10 place-items-center border border-white/15 text-[#eae3d5] lg:hidden" aria-label="Abrir menu">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-white/10 bg-[#171a18] px-5 py-5 lg:hidden">
            <div className="flex flex-col gap-4">
              {[["Campanha", "campanha"], ["Facções", "faccoes"], ["Método", "metodo"], ["Guia de mesa", "mesa"], ["Crônicas", "cronicas"], ["Narrador", "narrador"]].map(([label, id]) => (
                <button key={id} onClick={() => navigate(id)} className="text-left text-[13px] font-semibold uppercase tracking-[0.14em] text-[#d8d2c6]">{label}</button>
              ))}
            </div>
          </div>
        )}
      </header>

      <DossierRail onNavigate={navigate} />
      <main className="xl:pl-[132px]">
        <section id="inicio" className="relative isolate min-h-[760px] border-b border-white/10 bg-[#111312]">
          <img src={visualAssets.hero} alt="Véspera do Vau ao cair da noite" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(17,19,18,0.97)_0%,rgba(17,19,18,0.9)_34%,rgba(17,19,18,0.42)_70%,rgba(17,19,18,0.76)_100%)]" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_30%,rgba(181,91,50,0.15),transparent_31%)]" />
          <div className="absolute right-5 top-28 hidden text-right xl:block xl:right-10">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#83a89a]">Coord. 21°V / 07°R</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#bbb4a7]">Margem do Rio Cinéreo</p>
          </div>
          <div className="absolute bottom-8 left-10 hidden items-center gap-4 xl:flex">
            <span className="h-px w-24 border-t border-dashed border-[#83a89a]/70" />
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#83a89a]">Linha de investigação · 04 marcos ativos</p>
          </div>
          <div className="mx-auto grid min-h-[760px] max-w-[1440px] grid-cols-1 items-end px-5 pb-16 pt-28 sm:px-8 lg:grid-cols-[minmax(0,760px)_1fr] lg:px-10 lg:pb-24">
            <div>
              <div className="mb-7 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#83a89a]">
                <span className="h-px w-10 bg-[#83a89a]" /> Terras de Veyr · arquivo de campanha
              </div>
              <h1 className="max-w-[760px] font-serif text-[clamp(4.5rem,9vw,8.7rem)] leading-[0.78] tracking-[-0.06em] text-[#f4eee4]">
                Nenhum juramento<br />some <em className="font-normal text-[#d27648]">sem rastro.</em>
              </h1>
              <p className="mt-10 max-w-[580px] text-[18px] leading-8 text-[#d6d0c5] sm:text-[20px]">
                Um atlas para construir campanhas de horror, memória e território. Entre no registro de <strong className="font-semibold text-[#f4eee4]">A Coroa Partida</strong> e descubra o que as cidades de Veyr decidiram esquecer.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button onClick={() => navigate("campanha")} className="group h-12 rounded-none bg-[#b55b32] px-6 text-[12px] font-bold uppercase tracking-[0.13em] text-[#111312] hover:bg-[#d27648]">
                  Explorar a campanha <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
                <Button onClick={() => navigate("metodo")} variant="outline" className="h-12 rounded-none border-[#eae3d5]/30 bg-[#111312]/35 px-6 text-[12px] font-bold uppercase tracking-[0.13em] text-[#eae3d5] hover:bg-[#eae3d5]/10 hover:text-[#f4eee4]">
                  Consultar método
                </Button>
              </div>
            </div>
              <div className="mt-14 justify-self-end border-l border-dashed border-[#eae3d5]/30 pl-6 lg:mt-0">
                <div className="flex items-start gap-4">
                  <VeyrSeal className="h-[64px] w-[64px] shrink-0" label="Selo de Veyr no registro em curso" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#83a89a]">Registro em curso</p>
                    <p className="mt-3 max-w-[250px] font-serif text-[25px] leading-tight text-[#f4eee4]">"O Sino chama pelo nome que a cidade não suporta lembrar."</p>
                    <p className="mt-5 max-w-[240px] text-[13px] leading-5 text-[#c2bbae]">Véspera do Vau · Rio Cinéreo · A Coroa Partida</p>
                  </div>
                </div>
              </div>
          </div>
        </section>

        <section id="campanha" className="archive-paper relative text-[#161715]">
          <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
              <div>
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a876d]"><span className="grid h-7 w-7 place-items-center border border-[#b55b32] font-serif text-[15px] text-[#b55b32]">V</span> 01 · campanha · folha 01</div>
                <h2 className="mt-5 font-serif text-[56px] leading-[0.88] tracking-[-0.045em] sm:text-[74px]">A Coroa<br />Partida</h2>
                <p className="mt-8 text-[16px] leading-7 text-[#484b45]">Uma rota em três marcas: cada território revela uma maneira distinta de negociar com memória, medo e sobrevivência.</p>
                <div className="mt-10 hidden flex-col gap-1 lg:flex">
                  {territories.map((territory) => (
                    <button key={territory.id} onClick={() => setActiveTerritory(territory)} className={`flex items-center justify-between border-b border-[#161715]/15 py-4 text-left transition-colors ${activeTerritory.id === territory.id ? "text-[#b55b32]" : "text-[#5a5e55] hover:text-[#161715]"}`}>
                      <span className="font-serif text-[24px]">{territory.index}. {territory.name}</span><ChevronRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="relative grid gap-0 border border-[#161715]/15 bg-[#eae3d5]/70 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
                  <span className="absolute -right-3 top-6 hidden rotate-90 border border-[#b55b32]/50 bg-[#eae3d5] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-[#b55b32] lg:block">registro vivo</span>
                  <div className="relative min-h-[420px] overflow-hidden bg-[#1d211d]">
                    <img src={activeTerritory.image} alt={activeTerritory.name} className="h-full min-h-[420px] w-full object-cover transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(12,14,13,0.85)_0%,rgba(12,14,13,0.06)_70%)]" />
                    <div className="absolute bottom-0 left-0 p-7 text-[#f4eee4] sm:p-10">
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a9c7bb]">{activeTerritory.tone}</span>
                      <h3 className="mt-3 font-serif text-[46px] leading-none tracking-[-0.04em]">{activeTerritory.name}</h3>
                      <p className="mt-4 max-w-[420px] text-[15px] leading-6 text-[#d7d1c5]">{activeTerritory.descriptor}</p>
                    </div>
                  </div>
                  <div className="flex min-h-[420px] flex-col justify-between bg-[#f2ece0] p-7 sm:p-10">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b55b32]">O que está em risco</p>
                      <p className="mt-6 text-[17px] leading-8 text-[#3f433d]">{activeTerritory.text}</p>
                    </div>
                    <div className="mt-10 space-y-3 border-t border-[#161715]/15 pt-6">
                      {activeTerritory.stakes.map((stake, index) => (
                        <div key={stake} className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#3c403a]"><span className="text-[#b55b32]">0{index + 1}</span>{stake}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2 lg:hidden">
                  {territories.map((territory) => <button key={territory.id} onClick={() => setActiveTerritory(territory)} className={`h-2 flex-1 ${activeTerritory.id === territory.id ? "bg-[#b55b32]" : "bg-[#161715]/15"}`} aria-label={`Selecionar ${territory.name}`} />)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faccoes" className="relative bg-[#171a18]">
          <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#83a89a]"><span className="h-px w-10 border-t border-dashed border-[#83a89a]" /> 02 · forças em movimento · índice de pressão</div>
                <h2 className="mt-5 max-w-[730px] font-serif text-[54px] leading-[0.9] tracking-[-0.045em] text-[#f4eee4] sm:text-[76px]">Toda rota cobra<br />um aliado.</h2>
              </div>
              <p className="max-w-[330px] text-[16px] leading-7 text-[#b8b3a8]">As facções reagem a proteção, medo e verdade. A política não é cenário: ela é o relógio que move a mesa.</p>
            </div>
            <div className="mt-16 grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-5">
              {factions.map(([number, name, text]) => (
                <article key={name} className="group relative min-h-[260px] border-b border-white/10 p-6 transition-colors duration-200 hover:bg-[#202521] sm:border-r sm:last:border-r-0 lg:border-b-0">
                  <span className="font-serif text-[30px] text-[#b55b32]">{number}</span>
                  <span className="absolute right-5 top-7 text-[8px] font-bold uppercase tracking-[0.15em] text-[#83a89a]/70">Dossiê</span>
                  <h3 className="mt-12 font-serif text-[27px] leading-[0.98] text-[#f4eee4]">{name}</h3>
                  <p className="mt-5 text-[14px] leading-6 text-[#aaa79c]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="metodo" className="archive-paper relative text-[#161715]">
          <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
              <div>
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a876d]"><span className="h-7 w-7 border border-[#161715]/50" /> 03 · protocolo de criação · classificação C</div>
                <h2 className="mt-5 font-serif text-[56px] leading-[0.88] tracking-[-0.045em] sm:text-[76px]">Do arquivo<br />à mesa.</h2>
                <p className="mt-8 max-w-[420px] text-[17px] leading-8 text-[#484b45]">O atlas organiza uma produção de campanha que começa por leitura e termina em materiais diretamente usáveis: facções, antagonistas, mapas, fichas, suplementos e trilhas.</p>
                <div className="mt-10 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.12em] text-[#b55b32]"><ScrollText className="h-4 w-4" /> método modular de criação</div>
              </div>
              <div className="grid border-t border-[#161715]/20 sm:grid-cols-2">
                {workflow.map(([name, text], index) => (
                  <div key={name} className="group relative min-h-[176px] border-b border-[#161715]/20 p-6 sm:[&:nth-child(odd)]:border-r sm:p-8">
                    <div className="flex items-center justify-between"><span className="text-[11px] font-bold tracking-[0.18em] text-[#b55b32]">0{index + 1}</span><ArrowRight className="h-4 w-4 text-[#83a89a] transition-transform duration-200 group-hover:translate-x-1" /></div>
                    <span className="absolute bottom-4 right-5 text-[8px] font-bold uppercase tracking-[0.16em] text-[#7a876d]">procedimento</span>
                    <h3 className="mt-8 font-serif text-[31px] leading-none">{name}</h3>
                    <p className="mt-3 text-[14px] leading-6 text-[#53564f]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="mesa" className="bg-[#111312]">
          <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:px-10 lg:py-28">
            <div className="dossier-grid relative min-h-[520px] overflow-hidden border border-white/10 bg-[#1b1f1c]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_70%,rgba(181,91,50,0.23),transparent_28%),linear-gradient(135deg,rgba(17,19,18,0.6),rgba(17,19,18,0.08))]" />
              <img src={visualAssets.sigil} alt="Selo de Veyr" className="absolute bottom-7 right-7 h-48 w-48 rotate-[-7deg] object-contain opacity-25" />
              <div className="relative flex min-h-[520px] flex-col justify-between p-8 sm:p-10">
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a9c7bb]"><Compass className="h-4 w-4" /> Ferramenta de improviso · R-03</div>
                <div>
                  <p className="max-w-[460px] font-serif text-[42px] leading-[0.94] tracking-[-0.04em] text-[#f4eee4]">O que o ambiente quer?<br />Quem observa?<br />Qual memória está em risco?</p>
                  <p className="mt-6 max-w-[440px] text-[15px] leading-7 text-[#d7d1c5]">Três perguntas para sustentar qualquer cena sem perder o tom de Veyr: desejo, testemunha e consequência.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#83a89a]">04 · guia de mesa</div>
              <h2 className="mt-5 font-serif text-[56px] leading-[0.9] tracking-[-0.045em] text-[#f4eee4] sm:text-[76px]">Custo antes<br />de conquista.</h2>
              <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-white/10 pt-8">
                {[
                  ["Fadiga", "Desgaste físico e mental que pede pausa segura, acampamento ou Sociedade."],
                  ["Sombra", "Integridade moral ameaçada pela forma como uma escolha é feita."],
                  ["Nomes", "Memória apurada por investigação; pode reduzir consequências de Sombra."],
                  ["Marcos", "Progressão que nasce da ficção e cria objetivos em vez de bloqueios."],
                ].map(([title, text]) => (
                  <div key={title}><h3 className="font-serif text-[27px] text-[#d27648]">{title}</h3><p className="mt-2 text-[14px] leading-6 text-[#aaa79c]">{text}</p></div>
                ))}
              </div>
              <div className="mt-10 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.12em] text-[#eae3d5]"><Crosshair className="h-4 w-4 text-[#b55b32]" /> O combate sempre deve ter objetivo, terreno, relógio, fraqueza e preço.</div>
            </div>
          </div>
        </section>

        <section id="cronicas" className="archive-paper relative overflow-hidden text-[#161715]">
          <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_88%_20%,rgba(131,168,154,0.2),transparent_22%),radial-gradient(circle_at_13%_76%,rgba(181,91,50,0.14),transparent_28%)]" />
          <div className="relative mx-auto flex max-w-[1440px] items-center gap-4 px-5 pt-7 sm:px-8 lg:px-10"><span className="h-px w-20 border-t border-dashed border-[#b55b32]/75" /><span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#7a876d]">Rota de evidência · ramificação C-04</span><span className="h-2 w-2 border border-[#b55b32]" /></div>
          <div className="relative mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="grid gap-14 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-20">
              <div>
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a876d]"><span className="grid h-7 w-7 place-items-center border border-[#b55b32] font-serif text-[15px] text-[#b55b32]">V</span> 05 · mundo das trevas · índice de crônicas</div>
                <h2 className="mt-5 font-serif text-[56px] leading-[0.88] tracking-[-0.045em] sm:text-[76px]">A noite<br />tem arquivo.</h2>
                <p className="mt-8 max-w-[300px] text-[16px] leading-7 text-[#484b45]">Três dossiês para crônicas onde identidade, território e realidade cobram consequências pessoais.</p>

                <div className="mt-10 border-t border-[#161715]/20">
                  {chronicles.map((chronicle) => {
                    const selected = activeChronicle.id === chronicle.id;

                    return (
                      <button
                        key={chronicle.id}
                        onClick={() => setActiveChronicle(chronicle)}
                        aria-pressed={selected}
                        className={`group flex w-full items-center justify-between gap-4 border-b border-[#161715]/20 py-5 text-left transition-colors duration-150 ${selected ? "text-[#b55b32]" : "text-[#4d514a] hover:text-[#161715]"}`}
                      >
                        <span className="flex items-center gap-4"><span className="font-serif text-[24px]">{chronicle.index}</span><span className="font-serif text-[24px] leading-[0.95]">{chronicle.title}</span></span>
                        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform duration-150 ${selected ? "translate-x-1" : "group-hover:translate-x-1"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <article className="relative overflow-hidden border border-[#161715]/20 bg-[#171a18] text-[#f4eee4] shadow-[16px_16px_0_rgba(22,23,21,0.12)]">
                <div className="absolute inset-0 dossier-grid opacity-30" />
                <div className="absolute inset-x-0 top-0 h-1 bg-[#b55b32]" />
                <div className="relative grid min-h-[520px] lg:grid-cols-[minmax(0,1.15fr)_280px]">
                  <div className="flex flex-col p-7 sm:p-10 lg:p-12">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a9c7bb]">
                      <span>Registro {activeChronicle.index} · consulta de crônica</span>
                      <span className="border border-[#b55b32]/60 px-2 py-1 text-[#d27648]">ativo</span>
                    </div>
                    <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[#a9c7bb]">{activeChronicle.eyebrow}</p>
                    <h3 className="mt-4 max-w-[620px] font-serif text-[50px] leading-[0.88] tracking-[-0.045em] sm:text-[72px]">{activeChronicle.title}</h3>
                    <p className="mt-8 max-w-[610px] text-[17px] leading-8 text-[#d6d0c5]">{activeChronicle.summary}</p>
                    <div className="mt-auto pt-10">
                      <div className="border-l border-dashed border-[#a9c7bb]/55 pl-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a9c7bb]">Pergunta para abrir a cena</p>
                        <p className="mt-3 max-w-[570px] font-serif text-[27px] leading-tight text-[#f4eee4]">“{activeChronicle.question}”</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex flex-col border-t border-white/15 bg-[#111312]/65 p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-9">
                    <span className="absolute right-4 top-4 text-[8px] font-bold uppercase tracking-[0.18em] text-[#83a89a]/70">arquivo interno</span>
                    <div className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#83a89a]">Sinais de pressão</div>
                    <p className="mt-4 font-serif text-[31px] leading-[0.98] text-[#d27648]">{activeChronicle.pressure}</p>
                    <div className="mt-12 space-y-0 border-t border-white/15">
                      {activeChronicle.dossiers.map((dossier, index) => (
                        <div key={dossier} className="flex items-center justify-between border-b border-white/15 py-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#d8d2c6]"><span>{dossier}</span><span className="font-serif text-[20px] text-[#b55b32]">0{index + 1}</span></div>
                      ))}
                    </div>
                    <div className="mt-auto border border-[#83a89a]/35 p-4 text-[11px] leading-5 text-[#b8b3a8]">Selecione uma crônica para trocar o registro sem perder o fio da investigação.</div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <NarratorTools />

        <section className="relative border-y border-[#161715]/15 bg-[#b55b32] text-[#161715]">
          <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 px-5 py-14 sm:px-8 md:flex-row md:items-end lg:px-10">
            <div><div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em]"><img src={visualAssets.sigil} alt="" className="h-8 w-8 object-contain" /> RPG Atlas · Terras de Veyr · selo autenticado</div><p className="mt-4 font-serif text-[36px] leading-[0.96] tracking-[-0.03em] sm:text-[48px]">O próximo registro começa<br />naquilo que a mesa decide não esquecer.</p></div>
            <Button onClick={() => navigate("inicio")} variant="outline" className="h-12 rounded-none border-[#161715]/40 bg-[#eae3d5]/10 px-6 text-[12px] font-bold uppercase tracking-[0.13em] text-[#161715] hover:bg-[#161715] hover:text-[#eae3d5]">Voltar ao início <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </section>
      </main>

      <footer className="bg-[#111312]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-10 text-[12px] text-[#89877e] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex items-center gap-3"><VeyrSeal className="h-10 w-10 shrink-0" label="Selo de Veyr no rodapé" /><span>RPG Atlas · Arquivo de campanha</span></div>
          <p className="max-w-[630px] leading-5">Conteúdo baseado no contexto de skills, campanhas e materiais fornecidos. Exports de conta e tarefas criptografados permanecem fora do escopo deste atlas.</p>
          <div className="flex items-center gap-2 font-semibold uppercase tracking-[0.12em] text-[#d2ccc0]"><Sparkles className="h-3.5 w-3.5 text-[#b55b32]" /> Manus AI</div>
        </div>
      </footer>
    </div>
  );
}
