export const veyraNpcRelations = ["ally", "enemy", "neutral"] as const;
export type VeyraNpcRelation = (typeof veyraNpcRelations)[number];
export type VeyraNpcSource = { title: string; url: string };

export type VeyraNpcRecord = {
  id: string;
  name: string;
  epithet: string;
  relation: VeyraNpcRelation;
  summary: string;
  specialties: string[];
  hook: string;
  sourcePage: number;
  source?: VeyraNpcSource;
};

export const veyraNpcRelationLabels: Record<VeyraNpcRelation, string> = { ally: "Aliados", enemy: "Inimigos", neutral: "Neutros" };
export const veyraNpcSource = { title: "NPCs rápidos de Véspera do Vau", url: "https://drive.google.com/file/d/1MIlh50LxdisNlk_t92Az1yPnkiO0ff5b/view?usp=drivesdk" };
export const kaneNpcSource = { title: "A Linhagem Kane: Sangue, Ferro e Fé", url: "https://drive.google.com/file/d/1nDqN2w3DDLSPqEsT6dC8sPR8XoAGDGyL/view?usp=drivesdk" };

export const veyraNpcCompendium: VeyraNpcRecord[] = [
  { id: "maela-varn", name: "Maela Varn", epithet: "A Mãe da Fita", relation: "ally", summary: "Moradora acolhedora das Velas Baixas; protege Tira e sustenta a casa dos vizinhos durante os toques do sino.", specialties: ["Cuidado", "Persuasão", "Vontade", "Conhecimento local"], hook: "Salvar Tira revela a entrada esquecida do Ossário das Velas.", sourcePage: 2 },
  { id: "tomas-do-banco", name: "Tomas do Banco", epithet: "O Velho que Lembra", relation: "ally", summary: "Antigo aprendiz dos Registradores que preserva a memória de uma ponte apagada dos registros da cidade.", specialties: ["História", "Memória", "Observação", "Relatos antigos"], hook: "Reconhece no Fragmento a marca da pessoa cujo nome foi removido.", sourcePage: 3 },
  { id: "tira-varn", name: "Tira Varn", epithet: "A Menina que Escuta o Sino", relation: "ally", summary: "Criança curiosa que percebe os nomes chamados pela voz do sino e desenha as galerias da cidade.", specialties: ["Furtividade", "Escuta", "Ruas", "Desenho"], hook: "Sua origem pode ligar o Sino de Namar a um Patrono dos Viajantes.", sourcePage: 4 },
  { id: "daro-ferrugem", name: "Daro Ferrugem", epithet: "O Ferreiro da Oficina de Sinos", relation: "ally", summary: "Ferreiro leal que forjou parte do sino sem conhecer sua finalidade e teme pelo futuro do aprendiz.", specialties: ["Ofício", "Luta", "Avaliação de metal", "Intimidação"], hook: "O bronze revela um vínculo entre Véspera do Vau e o Ermo de Karzath.", sourcePage: 5 },
  { id: "irma-sava", name: "Irmã Sava", epithet: "A Curandeira da Lanterna", relation: "ally", summary: "Curandeira da Irmandade da Lanterna de Sal, comprometida em proteger moradores e a pessoa sem nome do santuário.", specialties: ["Cura", "Vontade", "Ritos de abrigo", "Liderança comunitária"], hook: "O anônimo conhece o nome original do Eco, mas sangra ao tentar pronunciá-lo.", sourcePage: 6 },
  { id: "odran-voss", name: "Odran Voss", epithet: "O Funcionário do Conselho", relation: "enemy", summary: "Escrivão do Conselho que falsificou registros e tenta encerrar a investigação por meio de pagamento, documentos ou acusação.", specialties: ["Intriga", "Leitura", "Persuasão", "Burocracia"], hook: "A voz que ordenou os apagamentos pode ser o Eco, um Patrono ou algo ligado à Coroa Partida.", sourcePage: 7 },
  { id: "harkan-karzath", name: "Harkan de Karzath", epithet: "O Refugiado Hostil", relation: "enemy", summary: "Ex-mensageiro marcado por Karzath; começa agressivo e pode atacar para impedir que o Fragmento seja entregue a um lorde.", specialties: ["Sobrevivência", "Luta", "Karzath", "Intimidação"], hook: "Pode tornar-se guia da próxima missão ou rival da Companhia.", sourcePage: 8 },
  { id: "esma-ril", name: "Esma Ril", epithet: "A Comerciante das Correntes", relation: "neutral", summary: "Comerciante perspicaz do Mercado das Correntes, ligada à venda de fichas de bronze e a dívidas com a Companhia do Sal Negro.", specialties: ["Barganha", "Intriga", "Avaliação", "Mentira convincente"], hook: "Seu livro-caixa registra: quarto toque, quarto nome.", sourcePage: 2 },
  { id: "nilo-salmoura", name: "Nilo Salmoura", epithet: "O Informante Nervoso", relation: "neutral", summary: "Carregador do Cais da Cinza que conhece a rota da caixa de bronze, mas negocia cada informação pela liberdade da irmã.", specialties: ["Furtividade", "Navegação", "Cais", "Contrabandistas"], hook: "A irmã guarda metade de uma carta de carga assinada por Veyra Oss.", sourcePage: 6 },
  { id: "basto-palido", name: "Basto Pálido", epithet: "O Bêbado Lúcido", relation: "neutral", summary: "Morador que aparenta embriaguez para silenciar as vozes do sino e cuja memória se torna perigosa quando está sóbrio.", specialties: ["Presságio", "Ruas", "Mentira", "Resistência ao Pavor"], hook: "Uma dívida com o Cego das Sete Encruzilhadas pode convocá-lo à trama.", sourcePage: 9 },
  { id: "brahan-kane", name: "Brahan Kane", epithet: "O Flagelo de Deus", relation: "enemy", summary: "Ancestral fundador da linhagem Kane e da Ecclesia Custodes, cuja fé e caça direta a vampiros e demônios definiram o credo da família.", specialties: ["Fé", "Combate corpo a corpo", "Caça ao sobrenatural", "Táticas do Codex Tenebris"], hook: "As observações e táticas que iniciou no Codex Tenebris podem revelar a origem de uma antiga operação da Ecclesia Custodes.", sourcePage: 4, source: kaneNpcSource },
  { id: "alistair-kane", name: "Alistair Kane", epithet: "O Escriba de Sangue", relation: "neutral", summary: "Erudito renascentista que organizou o Codex Tenebris e converteu a caça da linhagem em uma operação baseada em pesquisa, infiltração e informação.", specialties: ["Pesquisa", "Conhecimento de clãs", "Infiltração", "Aconselhamento"], hook: "Uma anotação atribuída a Alistair pode conter a fraqueza de uma linhagem vampírica ainda ativa.", sourcePage: 8, source: kaneNpcSource },
  { id: "dorian-kane", name: "Dorian Kane", epithet: "A Sombra das Engrenagens", relation: "neutral", summary: "Caçador da Revolução Industrial que adaptou as táticas Kane ao ambiente urbano com sabotagem, tecnologia emergente e redes de informantes.", specialties: ["Infiltração", "Sabotagem", "Tecnologia", "Redes de informantes"], hook: "O volume do Codex dedicado aos Tzimisce pode apontar uma fábrica, um contato ou um método de sabotagem que sobreviveu à era industrial.", sourcePage: 11, source: kaneNpcSource },
  { id: "gabriel-kane", name: "Gabriel Kane", epithet: "O Sentinela das Trincheiras", relation: "neutral", summary: "Guardião do legado Kane nas Guerras Mundiais, atuante na caça a vampiros que exploravam os conflitos e na proteção de civis em zona de guerra.", specialties: ["Sobrevivência", "Armamento militar", "Táticas de guerra", "Proteção de civis"], hook: "Relatos do Sentinela podem ligar uma arma militar esquecida a uma rede vampírica que manipulava os altos comandos.", sourcePage: 14, source: kaneNpcSource },
  { id: "salamon-kane", name: "Salamon Kane", epithet: "O Cardeal Inquisidor", relation: "enemy", summary: "Líder atual da Ordem de São Miguel em São Paulo, combina fé, contrainteligência e tecnologia para combater ameaças sobrenaturais urbanas.", specialties: ["Contrainteligência", "Tecnologia", "Liderança", "Caça ao sobrenatural"], hook: "A investigação de Salamon sobre cultos niilistas ou a Alcateia da Lua Sangrenta pode cruzar o caminho da crônica.", sourcePage: 17, source: kaneNpcSource },
  { id: "joao-kane", name: "João Kane", epithet: "O Herdeiro do Ferro", relation: "neutral", summary: "Sobrinho de Salamon e herdeiro em treinamento da linhagem Kane, dotado de intelecto aguçado, mas ainda em formação diante do peso da missão familiar.", specialties: ["Intelecto", "Conhecimento da linhagem", "Tecnologia", "Potencial de liderança"], hook: "A promessa e a dúvida de João podem abrir uma negociação ou precipitar uma decisão que revele o futuro da linhagem.", sourcePage: 17, source: kaneNpcSource },
];

function normalizeNpcSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

export function filterVeyraNpcs(relation: VeyraNpcRelation | "all", search = "") {
  const normalizedSearch = normalizeNpcSearch(search);
  return veyraNpcCompendium.filter((npc) => {
    const matchesRelation = relation === "all" || npc.relation === relation;
    const matchesSearch = !normalizedSearch || [npc.name, npc.epithet, ...npc.specialties].some((value) => normalizeNpcSearch(value).includes(normalizedSearch));
    return matchesRelation && matchesSearch;
  });
}
