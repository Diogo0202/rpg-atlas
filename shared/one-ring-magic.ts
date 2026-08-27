export type OneRingMagic = { id: string; name: string; discipline: "abrigo" | "nomes" | "estradas" | "memória" | "bronze"; test: string; effect: string; cost: string; sourcePage: number };

export const oneRingMagicSource = { title: "O Sino que Chama Nomes", url: "https://drive.google.com/file/d/1Dim5L8I_OEVq-c1PDQn2LuJCQv7Jviry/view?usp=drivesdk" };

export const oneRingMagics: OneRingMagic[] = [
  { id: "bencao-de-abrigo", name: "Bênção de Abrigo", discipline: "abrigo", test: "Vontade ou Vigilância · NA 12", effect: "Uma lanterna mantida acesa impede que a água e as sombras avancem por uma rodada; ao concluir a travessia, a Companhia recupera 1 Fadiga causada pela galeria.", cost: "O portador não recupera Esperança na próxima noite, salvo se outro companheiro assumir o fardo.", sourcePage: 8 },
  { id: "nome-verdadeiro", name: "Nome Verdadeiro", discipline: "nomes", test: "Arte ou História · NA 14", effect: "Pronunciar o nome verdadeiro de alguém que deseja proteger remove, até o fim da rodada, a proteção sobrenatural de um Afogado Sem Nome.", cost: "Exige que o companheiro exponha uma memória ou vínculo verdadeiro diante do perigo.", sourcePage: 7 },
  { id: "divida-de-estrada", name: "Dívida de Estrada", discipline: "estradas", test: "Vigilância, Exploração ou Discernimento · NA 14", effect: "Permite reconhecer uma saída rápida pelos corredores da Senhora das Estradas Sem Lua e concede Favorecida no primeiro teste da câmara final.", cost: "Ao aceitar o preço voluntário, a Companhia não pode retornar pelo mesmo corredor.", sourcePage: 8 },
  { id: "memoria-dos-marcos", name: "Memória dos Marcos", discipline: "memória", test: "Arte ou História · NA 14", effect: "Ofereça uma lembrança pequena, mas verdadeira, para abrir a Porta da Mãe dos Marcos e receber uma pista sobre o Fragmento.", cost: "A lembrança fica enfraquecida até que seja recuperada em uma cena de vínculo apropriada.", sourcePage: 8 },
  { id: "selo-de-bronze", name: "Selo de Bronze", discipline: "bronze", test: "Ofício", effect: "Um prego de bronze forjado por Daro mantém uma porta subterrânea fechada durante uma cena.", cost: "O selo é consumido quando a cena termina ou a passagem é rompida.", sourcePage: 5 },
  { id: "lanterna-contra-o-pavor", name: "Lanterna Contra o Pavor", discipline: "abrigo", test: "Arte · NA 13", effect: "A luz da Lanterna de Sal impede que a água avance por uma rodada e pode evitar que um companheiro receba 1 Sombra de um efeito de medo.", cost: "A chama exige concentração: quem a carrega não realiza ataques à distância nem usa as duas mãos em outra tarefa.", sourcePage: 6 },
];

export function getOneRingMagicById(id: string) { return oneRingMagics.find((magic) => magic.id === id); }
export function normalizeOneRingMagicIds(value: unknown) { return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string" && oneRingMagics.some((magic) => magic.id === id)) : []; }
export function addOneRingMagic(selected: string[], magicId: string) { return selected.includes(magicId) || !oneRingMagics.some((magic) => magic.id === magicId) ? selected : [...selected, magicId]; }
export function removeOneRingMagic(selected: string[], magicId: string) { return selected.filter((id) => id !== magicId); }
