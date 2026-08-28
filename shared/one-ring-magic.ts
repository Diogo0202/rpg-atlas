export type OneRingMagicDiscipline = "abrigo" | "nomes" | "estradas" | "memória" | "bronze" | "cinzas" | "juramentos" | "seivas" | "estrelas";
export type OneRingMagicOrigin = "drive" | "veyra-original";

export type OneRingMagic = {
  id: string;
  name: string;
  discipline: OneRingMagicDiscipline;
  test: string;
  effect: string;
  cost: string;
  origin: OneRingMagicOrigin;
  sourcePage?: number;
};

export const oneRingMagicSource = { title: "O Sino que Chama Nomes", url: "https://drive.google.com/file/d/1Dim5L8I_OEVq-c1PDQn2LuJCQv7Jviry/view?usp=drivesdk" };

export const oneRingMagics: OneRingMagic[] = [
  { id: "bencao-de-abrigo", name: "Bênção de Abrigo", discipline: "abrigo", test: "Vontade ou Vigilância · NA 12", effect: "Uma lanterna mantida acesa impede que a água e as sombras avancem por uma rodada; ao concluir a travessia, a Companhia recupera 1 Fadiga causada pela galeria.", cost: "O portador não recupera Esperança na próxima noite, salvo se outro companheiro assumir o fardo.", origin: "drive", sourcePage: 8 },
  { id: "nome-verdadeiro", name: "Nome Verdadeiro", discipline: "nomes", test: "Arte ou História · NA 14", effect: "Pronunciar o nome verdadeiro de alguém que deseja proteger remove, até o fim da rodada, a proteção sobrenatural de um Afogado Sem Nome.", cost: "Exige que o companheiro exponha uma memória ou vínculo verdadeiro diante do perigo.", origin: "drive", sourcePage: 7 },
  { id: "divida-de-estrada", name: "Dívida de Estrada", discipline: "estradas", test: "Vigilância, Exploração ou Discernimento · NA 14", effect: "Permite reconhecer uma saída rápida pelos corredores da Senhora das Estradas Sem Lua e concede Favorecida no primeiro teste da câmara final.", cost: "Ao aceitar o preço voluntário, a Companhia não pode retornar pelo mesmo corredor.", origin: "drive", sourcePage: 8 },
  { id: "memoria-dos-marcos", name: "Memória dos Marcos", discipline: "memória", test: "Arte ou História · NA 14", effect: "Ofereça uma lembrança pequena, mas verdadeira, para abrir a Porta da Mãe dos Marcos e receber uma pista sobre o Fragmento.", cost: "A lembrança fica enfraquecida até que seja recuperada em uma cena de vínculo apropriada.", origin: "drive", sourcePage: 8 },
  { id: "selo-de-bronze", name: "Selo de Bronze", discipline: "bronze", test: "Ofício", effect: "Um prego de bronze forjado por Daro mantém uma porta subterrânea fechada durante uma cena.", cost: "O selo é consumido quando a cena termina ou a passagem é rompida.", origin: "drive", sourcePage: 5 },
  { id: "lanterna-contra-o-pavor", name: "Lanterna Contra o Pavor", discipline: "abrigo", test: "Arte · NA 13", effect: "A luz da Lanterna de Sal impede que a água avance por uma rodada e pode evitar que um companheiro receba 1 Sombra de um efeito de medo.", cost: "A chama exige concentração: quem a carrega não realiza ataques à distância nem usa as duas mãos em outra tarefa.", origin: "drive", sourcePage: 6 },
  { id: "brasa-do-ultimo-rei", name: "Brasa do Último Rei", discipline: "cinzas", test: "Arte ou Canção · NA 14", effect: "Ao reacender cinzas de um lar destruído, o rito revela uma passagem esquecida ou concede Favorecida ao próximo teste de Vigilância da Companhia naquela ruína.", cost: "O guardião da brasa deve entregar um símbolo pessoal de sua casa ao fogo; ele não poderá recuperá-lo ao fim da cena.", origin: "veyra-original" },
  { id: "juramento-da-lamina-partida", name: "Juramento da Lâmina Partida", discipline: "juramentos", test: "Luta ou Vontade · NA 15", effect: "Uma arma quebrada é consagrada contra uma ameaça nomeada. No primeiro confronto da cena, seu portador pode proteger um aliado da consequência de uma falha.", cost: "Se o juramento for abandonado, o portador recebe 1 Sombra ou deve declarar publicamente a razão da quebra perante a Companhia.", origin: "veyra-original" },
  { id: "orvalho-da-arvore-tortuosa", name: "Orvalho da Árvore Tortuosa", discipline: "seivas", test: "Cura ou Ofício · NA 13", effect: "O orvalho de uma árvore marcada limpa veneno, ferrugem ou corrupção menor de um objeto e permite a um companheiro ignorar uma penalidade de Fadiga até o fim da cena.", cost: "A água só funciona uma vez e o recipiente usado ganha uma fissura visível, lembrando a dívida com o bosque.", origin: "veyra-original" },
  { id: "manto-da-estela-palida", name: "Manto da Estela Pálida", discipline: "estrelas", test: "Vigilância ou História · NA 14", effect: "Sob céu aberto, traça uma constelação perdida e torna Favorecido o próximo teste para não se perder, seguir rastros antigos ou decifrar um presságio.", cost: "Até o próximo descanso, o observador sente a presença de algo distante olhando de volta e não pode esconder esse presságio dos aliados.", origin: "veyra-original" },
  { id: "passos-sobre-o-mar-de-nevoa", name: "Passos sobre o Mar de Névoa", discipline: "estradas", test: "Exploração ou Furtividade · NA 15", effect: "A Companhia cruza uma área tomada por névoa, água rasa ou cinzas sem deixar rastros comuns até alcançar abrigo ou até o fim da cena.", cost: "Cada viajante deve deixar para trás uma pequena lembrança do caminho, que o Narrador pode trazer de volta como presságio em uma sessão futura.", origin: "veyra-original" },
];

export function getOneRingMagicById(id: string) { return oneRingMagics.find((magic) => magic.id === id); }
export function getOneRingMagicReference(magic: OneRingMagic) { return magic.origin === "veyra-original" ? "Rito original de Veyr · inspiração em Elden Ring" : `${oneRingMagicSource.title} · p. ${magic.sourcePage}`; }
export function normalizeOneRingMagicIds(value: unknown) { return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string" && oneRingMagics.some((magic) => magic.id === id)) : []; }
export function addOneRingMagic(selected: string[], magicId: string) { return selected.includes(magicId) || !oneRingMagics.some((magic) => magic.id === magicId) ? selected : [...selected, magicId]; }
export function removeOneRingMagic(selected: string[], magicId: string) { return selected.filter((id) => id !== magicId); }
export function toggleOneRingMagicFavorite(favoriteIds: string[], magicId: string) { return favoriteIds.includes(magicId) ? removeOneRingMagic(favoriteIds, magicId) : addOneRingMagic(favoriteIds, magicId); }
