export const V5_ATTRIBUTES = {
  fisicos: ["Força", "Destreza", "Vigor"],
  sociais: ["Carisma", "Manipulação", "Autocontrole"],
  mentais: ["Inteligência", "Raciocínio", "Determinação"],
} as const;

export const V5_SKILLS = {
  fisicos: ["Atletismo", "Briga", "Condução", "Furtividade", "Ladroagem", "Ofícios", "Sobrevivência", "Armas Brancas", "Armas de Fogo"],
  sociais: ["Etiqueta", "Empatia", "Intimidação", "Liderança", "Manha", "Performance", "Persuasão", "Subterfúgio", "Trato com Animais"],
  mentais: ["Acadêmicos", "Ciência", "Consciência", "Finanças", "Investigação", "Medicina", "Ocultismo", "Percepção", "Tecnologia"],
} as const;

export type V5Clan = { id: string; name: string; disciplines: string[]; bane: string; compulsion: string };
export const V5_CLANS: V5Clan[] = [
  { id: "banu-haqim", name: "Banu Haqim", disciplines: ["Feitiçaria de Sangue", "Celeridade", "Ofuscação"], bane: "Vício no sangue de outros vampiros.", compulsion: "Julgamento" },
  { id: "brujah", name: "Brujah", disciplines: ["Celeridade", "Potência", "Presença"], bane: "Paixões intensas tornam a Fúria mais próxima.", compulsion: "Rebelião" },
  { id: "gangrel", name: "Gangrel", disciplines: ["Animalismo", "Fortitude", "Metamorfose"], bane: "A Besta deixa marcas visíveis após o frenesi.", compulsion: "Feral" },
  { id: "hecata", name: "Hecata", disciplines: ["Auspícios", "Fortitude", "Oblívio"], bane: "Alimentar-se provoca dor ou perturbação no alvo.", compulsion: "Morbidez" },
  { id: "lasombra", name: "Lasombra", disciplines: ["Dominação", "Oblívio", "Potência"], bane: "Reflexos e gravações falham em reconhecer sua imagem.", compulsion: "Crueldade" },
  { id: "malkavian", name: "Malkaviano", disciplines: ["Auspícios", "Dominação", "Ofuscação"], bane: "A maldição de sangue manifesta uma perturbação recorrente.", compulsion: "Delírio" },
  { id: "ministerio", name: "Ministério", disciplines: ["Ofuscação", "Presença", "Metamorfose"], bane: "Luz intensa restringe seus sentidos e ações.", compulsion: "Transgressão" },
  { id: "nosferatu", name: "Nosferatu", disciplines: ["Animalismo", "Ofuscação", "Potência"], bane: "A deformidade não pode ser ocultada por completo.", compulsion: "Criptomania" },
  { id: "ravnos", name: "Ravnos", disciplines: ["Animalismo", "Ofuscação", "Presença"], bane: "O sangue exige uma compulsão pessoal e perigosa.", compulsion: "Tentação" },
  { id: "salubri", name: "Salubri", disciplines: ["Auspícios", "Dominação", "Fortitude"], bane: "O terceiro olho denuncia a linhagem ao usar disciplinas.", compulsion: "Empatia Avasaladora" },
  { id: "toreador", name: "Toreador", disciplines: ["Auspícios", "Celeridade", "Presença"], bane: "A beleza e a arte podem paralisá-los.", compulsion: "Fixação" },
  { id: "tremere", name: "Tremere", disciplines: ["Auspícios", "Dominação", "Feitiçaria de Sangue"], bane: "A linhagem depende de vínculos e juramentos de sangue.", compulsion: "Perfeccionismo" },
  { id: "tzimisce", name: "Tzimisce", disciplines: ["Animalismo", "Dominação", "Metamorfose"], bane: "Afastar-se do próprio domínio ou relíquia causa inquietação.", compulsion: "Cobrança" },
  { id: "ventrue", name: "Ventrue", disciplines: ["Dominação", "Fortitude", "Presença"], bane: "Só podem alimentar-se de um tipo de presa escolhido.", compulsion: "Arrogância" },
  { id: "caitiff", name: "Caitiff", disciplines: ["Disciplinas escolhidas"], bane: "Sem uma maldição única, mas sem a proteção de uma linhagem reconhecida.", compulsion: "Incerteza" },
  { id: "sangue-ralo", name: "Sangue-Ralo", disciplines: ["Afinidades escolhidas"], bane: "A vitae frágil manifesta características específicas de sangue ralo.", compulsion: "Dissonância" },
];

export const V5_DISCIPLINES: Record<string, { description: string; powers: { level: number; name: string; effect: string }[] }> = {
  "Animalismo": { description: "Afinidade com a Besta e com criaturas animais.", powers: [{ level: 1, name: "Sentir a Besta", effect: "Percebe a natureza predatória de uma criatura." }, { level: 1, name: "Vínculo com Famulus", effect: "Estabelece um elo duradouro com um animal." }, { level: 2, name: "Sussurros Selvagens", effect: "Comunica-se com animais." }] },
  "Auspícios": { description: "Percepção sobrenatural, pressentimentos e leitura de auras.", powers: [{ level: 1, name: "Sentidos Aguçados", effect: "Amplia uma percepção escolhida." }, { level: 1, name: "Sentir o Invisível", effect: "Percebe presenças ocultas e fenômenos estranhos." }, { level: 2, name: "Previsão", effect: "Recebe um lampejo de possibilidade iminente." }] },
  "Celeridade": { description: "Velocidade, reação e precisão acima do humano.", powers: [{ level: 1, name: "Reflexos Rápidos", effect: "Age com velocidade incomum sob pressão." }, { level: 1, name: "Graça Felina", effect: "Aumenta agilidade e controle corporal." }, { level: 2, name: "Passo Relâmpago", effect: "Cruza uma distância antes que a cena reaja." }] },
  "Dominação": { description: "Comando mental e imposição da vontade.", powers: [{ level: 1, name: "Nublar a Mente", effect: "Apaga a lembrança imediata de uma interação." }, { level: 1, name: "Compelir", effect: "Dá uma ordem curta e direta." }, { level: 2, name: "Mesmerizar", effect: "Instala uma instrução mais duradoura." }] },
  "Fortitude": { description: "Resistência sobrenatural contra dor, impacto e terror.", powers: [{ level: 1, name: "Mente Resoluta", effect: "Suporta coerção e desgaste mental." }, { level: 1, name: "Resiliência", effect: "Reduz o impacto de ferimentos." }, { level: 2, name: "Desafiar a Dor", effect: "Age mesmo em meio a dano intenso." }] },
  "Metamorfose": { description: "Moldagem física, adaptação e domínio predatório do corpo.", powers: [{ level: 1, name: "Olhos da Besta", effect: "Enxerga na escuridão sem sofrer penalidade." }, { level: 1, name: "Peso da Pluma", effect: "Reduz dano de quedas e melhora saltos." }, { level: 2, name: "Garras Ferozes", effect: "Transforma unhas em armas naturais." }] },
  "Ofuscação": { description: "Ocultação, anonimato e desvio da atenção.", powers: [{ level: 1, name: "Capa das Sombras", effect: "Permanece despercebido enquanto imóvel." }, { level: 1, name: "Silêncio da Morte", effect: "Abafa som em uma área curta." }, { level: 2, name: "Passagem Despercebida", effect: "Move-se sem chamar atenção." }] },
  "Oblívio": { description: "Domínio sobre sombras, morte e os ecos do além.", powers: [{ level: 1, name: "Visão de Oblívio", effect: "Percebe a mancha da morte e do vazio." }, { level: 1, name: "Toque do Oblívio", effect: "Inflige frio sobrenatural e deterioração." }, { level: 2, name: "Manto de Sombras", effect: "Envolve a cena em escuridão inquieta." }] },
  "Potência": { description: "Força física e explosões de poder brutal.", powers: [{ level: 1, name: "Corpo Letal", effect: "Transforma o corpo em arma predatória." }, { level: 1, name: "Salto", effect: "Executa saltos extraordinários." }, { level: 2, name: "Proeza", effect: "Ergue, quebra ou arremessa além do normal." }] },
  "Presença": { description: "Magnetismo, terror e autoridade sobrenatural.", powers: [{ level: 1, name: "Fascínio", effect: "Amplia a força de atração do personagem." }, { level: 1, name: "Pavor", effect: "Inspira medo e recuo." }, { level: 2, name: "Olhar Inesquecível", effect: "Marca-se na memória de uma testemunha." }] },
  "Feitiçaria de Sangue": { description: "Rituais, fórmulas e manipulação da vitae.", powers: [{ level: 1, name: "Corrosão", effect: "Deteriora um objeto pelo toque de sangue." }, { level: 1, name: "Sabor do Sangue", effect: "Lê traços de uma vítima através da vitae." }, { level: 2, name: "Extinguir Vitae", effect: "Rouba vigor de sangue de outro vampiro." }] },
};

export function getClanDisciplines(clanId: string) {
  const clan = V5_CLANS.find((entry) => entry.id === clanId);
  return (clan?.disciplines || []).filter((discipline) => discipline in V5_DISCIPLINES);
}

export function applyClanDisciplines(clanId: string, current: Record<string, string[]>) {
  const disciplines = getClanDisciplines(clanId);
  if (!disciplines.length) return current;
  return Object.fromEntries(disciplines.map((discipline) => [discipline, current[discipline] || []]));
}

export type V5StarterArchetype = { id: string; label: string; summary: string; clanHints: string[]; attributes: Record<string, number>; skills: Record<string, number> };
export const V5_STARTER_ARCHETYPES: V5StarterArchetype[] = [
  { id: "combate-corpo-a-corpo", label: "Combate corpo a corpo", summary: "Linha de frente, pressão física e sobrevivência em confronto direto.", clanHints: ["brujah", "gangrel", "nosferatu"], attributes: { "Força": 3, "Destreza": 2, "Vigor": 3, "Autocontrole": 2 }, skills: { "Briga": 3, "Armas Brancas": 2, "Atletismo": 2, "Intimidação": 2, "Sobrevivência": 1 } },
  { id: "armas-de-fogo", label: "Armas de fogo", summary: "Precisão, cobertura e leitura de riscos em cenas de violência urbana.", clanHints: ["banu-haqim", "brujah", "ventrue"], attributes: { "Destreza": 3, "Raciocínio": 2, "Autocontrole": 2, "Vigor": 2 }, skills: { "Armas de Fogo": 3, "Atletismo": 2, "Consciência": 2, "Furtividade": 2, "Condução": 1 } },
  { id: "assassino", label: "Assassino", summary: "Infiltração, ataque preciso e retirada antes que a cena reaja.", clanHints: ["banu-haqim", "nosferatu", "ravnos"], attributes: { "Destreza": 3, "Autocontrole": 3, "Raciocínio": 2, "Força": 2 }, skills: { "Furtividade": 3, "Ladroagem": 2, "Armas Brancas": 2, "Atletismo": 2, "Armas de Fogo": 1 } },
  { id: "manipulacao", label: "Manipulação", summary: "Pressão social, segredos e controle indireto das escolhas alheias.", clanHints: ["ventrue", "ministerio", "toreador"], attributes: { "Manipulação": 3, "Carisma": 2, "Autocontrole": 2, "Raciocínio": 2 }, skills: { "Subterfúgio": 3, "Persuasão": 2, "Empatia": 2, "Etiqueta": 2, "Liderança": 1 } },
  { id: "social", label: "Social", summary: "Presença em Elysium, relações, reputação e apoio de mortais.", clanHints: ["toreador", "ventrue", "ministerio"], attributes: { "Carisma": 3, "Manipulação": 2, "Autocontrole": 2, "Determinação": 2 }, skills: { "Etiqueta": 3, "Persuasão": 2, "Performance": 2, "Empatia": 2, "Liderança": 1 } },
  { id: "mental", label: "Mental", summary: "Investigação, ocultismo e análise para revelar camadas da noite.", clanHints: ["tremere", "malkavian", "hecata"], attributes: { "Inteligência": 3, "Raciocínio": 3, "Determinação": 2, "Autocontrole": 2 }, skills: { "Investigação": 3, "Ocultismo": 2, "Consciência": 2, "Acadêmicos": 2, "Tecnologia": 1 } },
];

export const V5_PREDATORS = [
  { id: "alleycat", name: "Gato de Beco", bonus: "Especialidade em Briga ou Intimidação; acesso a uma disciplina física." },
  { id: "bagger", name: "Ensacador", bonus: "Especialidade em Medicina ou Ocultismo; acesso a contatos de bancos de sangue." },
  { id: "blood-leech", name: "Sanguessuga", bonus: "Especialidade em Ocultismo; familiaridade com sangue de vampiro e seus riscos." },
  { id: "cleaver", name: "Talhador", bonus: "Vínculo com uma família mortal, Refúgio ou Aliados; risco de exposição." },
  { id: "consensualist", name: "Consensualista", bonus: "Especialidade em Persuasão ou Medicina; alimentação negociada e limites éticos." },
  { id: "farmer", name: "Criador", bonus: "Rebanho e especialidade social; dependência de presas recorrentes." },
  { id: "osiris", name: "Osíris", bonus: "Fama, Influência ou Rebanho ligado a seguidores." },
  { id: "sandman", name: "Homem-Areia", bonus: "Especialidade em Furtividade; caça em lares e sonhos." },
  { id: "scene-queen", name: "Rainha da Cena", bonus: "Contatos, Fama ou Recursos dentro de uma subcultura." },
  { id: "siren", name: "Sereia", bonus: "Especialidade em Subterfúgio ou Persuasão; caça pela sedução." },
  { id: "assassino-beira-estrada", name: "Assassino de Beira de Estrada", bonus: "Especialidade em Sobrevivência ou Investigação; Rebanho e acesso a Fortitude ou Metamorfose." },
  { id: "extorsionista", name: "Extorsionista", bonus: "Especialidade em Intimidação ou Ladroagem; acesso a Dominação ou Potência e contatos de coerção." },
  { id: "ladrao-tumulos", name: "Ladrão de Túmulos", bonus: "Especialidade em Ocultismo ou Medicina; acesso a Fortitude ou Oblívio e Refúgio ligado à caça." },
] as const;

export type V5MeritDetail = { name: string; dots: string; effect: string };
export const V5_ADVANTAGE_DETAILS: V5MeritDetail[] = [
  { name: "Aliados", dots: "1–5", effect: "Mortais ou Membros dispostos a agir, dentro de limites narrativos definidos." },
  { name: "Contatos", dots: "1–5", effect: "Fontes recorrentes de informação em um campo específico." },
  { name: "Fama", dots: "1–5", effect: "Reconhecimento público que abre portas e também cria risco de exposição." },
  { name: "Influência", dots: "1–5", effect: "Capacidade de mover uma instituição, grupo social ou território." },
  { name: "Lacaios", dots: "1–5", effect: "Servidores vinculados, mortais ou sobrenaturais, com função definida." },
  { name: "Mawla", dots: "1–5", effect: "Mentor, patrono ou autoridade que pode oferecer orientação e favores." },
  { name: "Recursos", dots: "1–5", effect: "Acesso recorrente a dinheiro, propriedade e aquisições compatíveis com o nível." },
  { name: "Rebanho", dots: "1–5", effect: "Grupo de presas conhecidas que reduz a incerteza da caça." },
  { name: "Refúgio", dots: "1–5", effect: "Local seguro com características como segurança, tamanho e isolamento." },
  { name: "Retentor", dots: "1–5", effect: "Assistente especializado que resolve uma função contínua." },
  { name: "Status", dots: "1–5", effect: "Prestígio reconhecido por uma seita, domínio ou grupo." },
  { name: "Máscara", dots: "1–5", effect: "Identidade mortal documentada que ajuda a sustentar a não-vida." },
  { name: "Ritos", dots: "1–5", effect: "Acesso a práticas e conhecimento oculto de uma tradição." },
  { name: "Veículo", dots: "1–5", effect: "Meio de transporte com nível de manutenção e discrição apropriados." },
  { name: "Familiar", dots: "1–3", effect: "Laço especial com criatura ou entidade de apoio." },
  { name: "Sentidos Aguçados", dots: "1", effect: "Aumenta a percepção em situações ligadas ao sentido escolhido." },
];
export const V5_FLAW_DETAILS: V5MeritDetail[] = [
  { name: "Adversário", dots: "1–5", effect: "Uma força ativa trabalha contra os interesses do personagem." },
  { name: "Caçadores", dots: "2–5", effect: "Uma célula ou indivíduo investiga sinais da não-vida." },
  { name: "Defeito de Alimentação", dots: "1–4", effect: "A caça impõe uma limitação de saciedade, método ou consequência." },
  { name: "Dívida", dots: "1–5", effect: "Um favor pendente pode ser cobrado em momento inoportuno." },
  { name: "Inimigo", dots: "1–5", effect: "Pessoa ou facção busca prejudicar o personagem diretamente." },
  { name: "Má Reputação", dots: "1–3", effect: "O nome ou a aparência dificulta relações dentro de um círculo." },
  { name: "Máscara Frágil", dots: "1–5", effect: "A identidade mortal tem lacunas, rastros ou contradições perigosas." },
  { name: "Presa Exclusa", dots: "1–3", effect: "Uma categoria de presa não pode ser usada para saciar a Fome." },
  { name: "Predador Manifesto", dots: "2", effect: "A abordagem de caça provoca medo, suspeita ou atenção recorrente." },
  { name: "Segredo Sombrio", dots: "1–5", effect: "Uma revelação ameaça relações, Status ou sobrevivência." },
  { name: "Vício", dots: "1–3", effect: "Uma necessidade pessoal compete com a disciplina e a Máscara." },
  { name: "Infame", dots: "1–3", effect: "A reputação precede o personagem mesmo entre estranhos." },
  { name: "Refúgio Comprometido", dots: "1–4", effect: "O santuário possui falha de segurança, vigilância ou vulnerabilidade." },
  { name: "Perseguidor", dots: "1–5", effect: "Alguém acompanha rotinas, contatos ou movimentações do personagem." },
];
export const V5_ADVANTAGES = V5_ADVANTAGE_DETAILS.map((entry) => entry.name);
export const V5_FLAWS = V5_FLAW_DETAILS.map((entry) => entry.name);

export const V5_DISCIPLINE_ADVANCED_POWERS: Record<string, { level: number; name: string; effect: string }[]> = {
  "Animalismo": [{ level: 3, name: "Acalmar a Besta", effect: "Reduz impulsos predatórios em outra criatura." }, { level: 4, name: "Subsumir o Espírito", effect: "Projeta a consciência por meio de um animal vinculado." }, { level: 5, name: "Extrair a Besta", effect: "Desloca a fúria predatória para outro alvo." }],
  "Auspícios": [{ level: 3, name: "Perscrutar a Alma", effect: "Lê ressonâncias emocionais e marcas sobrenaturais." }, { level: 4, name: "Partilhar os Sentidos", effect: "Vê e escuta por meio de um alvo observado." }, { level: 5, name: "Possessão", effect: "Projeta a consciência na mente de uma vítima vulnerável." }],
  "Celeridade": [{ level: 3, name: "Travessia", effect: "Ultrapassa obstáculos com rapidez sobrenatural." }, { level: 4, name: "Desfoque", effect: "Torna movimentos difíceis de acompanhar." }, { level: 5, name: "Golpe Relâmpago", effect: "Age antes que a defesa comum se organize." }],
  "Dominação": [{ level: 3, name: "Mente Esquecida", effect: "Altera uma sequência maior de memórias." }, { level: 4, name: "Racionalizar", effect: "Faz uma ordem parecer escolha natural da vítima." }, { level: 5, name: "Manipulação em Massa", effect: "Estende um comando a vários alvos." }],
  "Fortitude": [{ level: 3, name: "Fortificar a Carne", effect: "Aumenta a proteção contra dano físico persistente." }, { level: 4, name: "Voluntade Inabalável", effect: "Resiste a medo, coerção e quebra emocional." }, { level: 5, name: "Resistência Imortal", effect: "Suporta agressões que derrubariam um vampiro comum." }],
  "Metamorfose": [{ level: 3, name: "Fundir-se à Terra", effect: "Esconde o corpo em solo ou matéria apropriada." }, { level: 4, name: "Mudar de Forma", effect: "Assume aspecto predatório ou animal selecionado." }, { level: 5, name: "Forma de Névoa", effect: "Dissolve o corpo em estado difícil de atingir." }],
  "Ofuscação": [{ level: 3, name: "Máscara de Mil Faces", effect: "Projeta uma aparência alternativa aos observadores." }, { level: 4, name: "Desaparecer", effect: "Some da atenção mesmo em situação de risco." }, { level: 5, name: "Ocultar o Grupo", effect: "Estende a ocultação a aliados próximos." }],
  "Oblívio": [{ level: 3, name: "Braços de Ahriman", effect: "Sombras respondem para prender ou ameaçar uma cena." }, { level: 4, name: "Passagem pelo Vazio", effect: "Move-se entre sombras conectadas." }, { level: 5, name: "Manto do Abismo", effect: "Cria uma região de escuridão opressiva." }],
  "Potência": [{ level: 3, name: "Alimentação Brutal", effect: "Caça com força predatória e deixa marcas claras." }, { level: 4, name: "Golpe Sísmico", effect: "Abala terreno, objetos ou posições próximas." }, { level: 5, name: "Força Impossível", effect: "Executa proezas de impacto excepcional." }],
  "Presença": [{ level: 3, name: "Enfeitiçar", effect: "Cria uma fixação social temporária no alvo." }, { level: 4, name: "Convocar", effect: "Puxa uma vítima conhecida para a presença do vampiro." }, { level: 5, name: "Majestade", effect: "Impõe reverência e recuo pela força da persona." }],
  "Feitiçaria de Sangue": [{ level: 3, name: "Toque do Escorpião", effect: "Contamina o alvo com vitae agressiva." }, { level: 4, name: "Roubo de Vitae", effect: "Drena força de sangue de outro vampiro." }, { level: 5, name: "Caldeirão de Sangue", effect: "Provoca devastação interna pela vitae do alvo." }],
};

export type V5StoreItem = { id: string; category: "arma" | "armadura" | "equipamento" | "roupa" | "moradia" | "veiculo" | "montaria"; name: string; resources: number; damage?: number; armor?: number; specification: string };
export type V5StoreCategory = V5StoreItem["category"];
export type V5DamageFilter = "all" | "balistico" | "cortante" | "contundente" | "incapacitante" | "narrativo";
export type V5StoreFilter = { categories: V5StoreCategory[]; category?: V5StoreCategory | "all"; maxResources: number; damageType?: V5DamageFilter };

export function getV5DamageType(item: V5StoreItem): V5DamageFilter {
  if (item.damage === undefined) return "narrativo";
  if (["pistola", "revolver", "submetralhadora", "rifle", "espingarda"].includes(item.id)) return "balistico";
  if (["faca", "espada", "machete", "machado", "arco"].includes(item.id)) return "cortante";
  if (item.id === "gas") return "incapacitante";
  return "contundente";
}

export function filterV5Store(items: readonly V5StoreItem[], filter: V5StoreFilter) {
  return items.filter((item) => filter.categories.includes(item.category) && (!filter.category || filter.category === "all" || item.category === filter.category) && item.resources <= filter.maxResources && (!filter.damageType || filter.damageType === "all" || getV5DamageType(item) === filter.damageType));
}
export const V5_STORE: V5StoreItem[] = [
  { id: "faca", category: "arma", name: "Faca robusta", resources: 1, damage: 1, specification: "Arma branca discreta, fácil de ocultar." },
  { id: "taco", category: "arma", name: "Taco ou bastão", resources: 1, damage: 2, specification: "Arma contundente comum, pouco discreta." },
  { id: "espada", category: "arma", name: "Espada cerimonial", resources: 3, damage: 3, specification: "Lâmina longa, exige porte e manutenção." },
  { id: "pistola", category: "arma", name: "Pistola compacta", resources: 2, damage: 2, specification: "Arma de fogo curta, ocultável com preparo." },
  { id: "espingarda", category: "arma", name: "Espingarda", resources: 3, damage: 4, specification: "Alto impacto em curta distância, difícil de dissimular." },
  { id: "colete", category: "armadura", name: "Colete balístico leve", resources: 2, armor: 2, specification: "Proteção portátil contra impactos balísticos e contundentes." },
  { id: "tatico", category: "armadura", name: "Proteção tática reforçada", resources: 4, armor: 3, specification: "Cobertura ampla; compromete discrição e mobilidade." },
  { id: "kit", category: "equipamento", name: "Kit de arrombamento", resources: 2, specification: "Ferramentas compactas para fechaduras e acesso físico." },
  { id: "forense", category: "equipamento", name: "Kit forense portátil", resources: 3, specification: "Coleta de vestígios, luzes e recipientes seguros." },
  { id: "formal", category: "roupa", name: "Traje formal sob medida", resources: 2, specification: "Apoia presença em eventos de elite e etiqueta social." },
  { id: "tatico-look", category: "roupa", name: "Vestuário tático discreto", resources: 2, specification: "Peças resistentes pensadas para mobilidade e ocultação." },
  { id: "apartamento", category: "moradia", name: "Apartamento discreto", resources: 2, specification: "Moradia urbana com espaço para uma rotina segura." },
  { id: "refugio", category: "moradia", name: "Refúgio fortificado", resources: 4, specification: "Acesso controlado, camadas de segurança e isolamento diurno." },
  { id: "sedan", category: "veiculo", name: "Sedã executivo", resources: 3, specification: "Veículo confortável com discrição em áreas urbanas." },
  { id: "moto", category: "veiculo", name: "Motocicleta de fuga", resources: 2, specification: "Mobilidade alta e perfil baixo em tráfego denso." },
  { id: "cavalo", category: "montaria", name: "Cavalo treinado", resources: 3, specification: "Montaria para deslocamento rural, histórico ou de domínio próprio." },
  { id: "machado", category: "arma", name: "Machado de mão", resources: 2, damage: 2, specification: "Ferramenta de impacto cortante, barulhenta e de difícil ocultação." },
  { id: "machete", category: "arma", name: "Facão", resources: 2, damage: 2, specification: "Lâmina longa para trabalho pesado ou combate de proximidade." },
  { id: "revolver", category: "arma", name: "Revólver", resources: 2, damage: 2, specification: "Arma curta robusta; exige atenção a ruído e rastreabilidade." },
  { id: "submetralhadora", category: "arma", name: "Submetralhadora", resources: 4, damage: 3, specification: "Alto volume de fogo; inadequada para operações discretas." },
  { id: "rifle", category: "arma", name: "Rifle de caça", resources: 4, damage: 4, specification: "Precisão e alcance; transporte conspícuo e controlado." },
  { id: "couro", category: "armadura", name: "Jaqueta de couro reforçada", resources: 1, armor: 1, specification: "Proteção leve contra impacto e corte superficial." },
  { id: "capacete", category: "armadura", name: "Capacete balístico", resources: 2, armor: 1, specification: "Cobertura de cabeça para cenários de confronto armado." },
  { id: "escudo", category: "armadura", name: "Escudo balístico", resources: 4, armor: 3, specification: "Proteção móvel; ocupa uma das mãos e limita mobilidade." },
  { id: "medico", category: "equipamento", name: "Kit médico de trauma", resources: 2, specification: "Material de estabilização para ferimentos imediatos." },
  { id: "telefones", category: "equipamento", name: "Telefones descartáveis", resources: 1, specification: "Comunicação de baixo rastreamento para uma operação curta." },
  { id: "noturna", category: "equipamento", name: "Óptica noturna", resources: 3, specification: "Amplia observação em baixa luz sem revelar a presença." },
  { id: "identidade", category: "equipamento", name: "Documentos de cobertura", resources: 3, specification: "Conjunto de identidade e trilha de papel para uma Máscara alternativa." },
  { id: "luxo", category: "roupa", name: "Guarda-roupa de luxo", resources: 4, specification: "Peças de alta-costura para eventos de Status elevado." },
  { id: "uniforme", category: "roupa", name: "Uniforme de serviço", resources: 1, specification: "Permite circular em contextos profissionais específicos com pouca atenção." },
  { id: "cobertura", category: "moradia", name: "Cobertura urbana", resources: 5, specification: "Moradia de status, adequada a encontros sociais e observação urbana." },
  { id: "deposito", category: "moradia", name: "Galpão convertido", resources: 3, specification: "Espaço amplo para coterie, armazenagem e trabalho discreto." },
  { id: "carro-esportivo", category: "veiculo", name: "Carro esportivo", resources: 4, specification: "Mobilidade veloz e símbolo evidente de Recursos." },
  { id: "utilitario", category: "veiculo", name: "Utilitário blindado", resources: 5, specification: "Transporte robusto para equipamento, aliados e viagens arriscadas." },
  { id: "cavalo-raca", category: "montaria", name: "Cavalo de raça", resources: 5, specification: "Montaria de prestígio, treinamento elevado e manutenção contínua." },
  { id: "soco-ingles", category: "arma", name: "Soco-inglês", resources: 1, damage: 1, specification: "Impacto curto e discreto, associado a confronto de rua." },
  { id: "arco", category: "arma", name: "Arco composto", resources: 3, damage: 3, specification: "Arma de distância silenciosa que requer prática e espaço." },
  { id: "gas", category: "arma", name: "Agente incapacitante", resources: 2, damage: 0, specification: "Ferramenta de controle de cena; seus efeitos dependem da proteção do alvo." },
  { id: "traje-antimotim", category: "armadura", name: "Traje antimotim", resources: 4, armor: 3, specification: "Proteção ampla contra impacto; impossível de confundir com vestimenta comum." },
  { id: "casaco-fogo", category: "armadura", name: "Casaco resistente ao fogo", resources: 3, armor: 1, specification: "Camada especializada para mitigar risco ambiental e faíscas." },
  { id: "drone", category: "equipamento", name: "Drone de observação", resources: 3, specification: "Reconhecimento remoto; sujeito a ruído, alcance e vigilância eletrônica." },
  { id: "vigilancia", category: "equipamento", name: "Maleta de vigilância", resources: 4, specification: "Câmeras, captação e armazenamento para monitorar uma cena." },
  { id: "laboratorio", category: "equipamento", name: "Laboratório portátil", resources: 4, specification: "Análise rápida de vestígios, reagentes e material ritualístico." },
  { id: "traje-luto", category: "roupa", name: "Traje de luto", resources: 1, specification: "Vestimenta social apropriada para funerais, velórios e ambientes solenes." },
  { id: "vestido-baile", category: "roupa", name: "Traje de gala", resources: 3, specification: "Peça de presença para Elysium, recepções e círculos de Status." },
  { id: "fazenda", category: "moradia", name: "Propriedade rural", resources: 4, specification: "Terreno isolado com potencial para refúgio, rebanho ou criação de animais." },
  { id: "hotel", category: "moradia", name: "Suíte de hotel de longa estadia", resources: 3, specification: "Cobertura urbana temporária com serviço, anonimato relativo e custo recorrente." },
  { id: "furgoneta", category: "veiculo", name: "Furgoneta de carga", resources: 3, specification: "Transporte de pessoas, equipamento ou cobertura de trabalho logístico." },
  { id: "classico", category: "veiculo", name: "Automóvel clássico", resources: 4, specification: "Veículo de prestígio, memorável e menos adequado a passar despercebido." },
  { id: "mula", category: "montaria", name: "Mula de carga", resources: 1, specification: "Montaria resistente para trilhas, viagem e transporte de suprimentos." },
  { id: "carruagem", category: "montaria", name: "Carruagem restaurada", resources: 4, specification: "Veículo histórico para domínios tradicionais, eventos ou cenários rurais." },
] as const;

export type V5InventoryEntry = {
  id: string;
  catalogId?: string;
  source: "catalog" | "custom";
  name: string;
  category: V5StoreCategory;
  resources: number;
  quantity: number;
  damage?: number;
  armor?: number;
  specification: string;
};

const inventoryCategories: V5StoreCategory[] = ["arma", "armadura", "equipamento", "roupa", "moradia", "veiculo", "montaria"];

export function createV5CatalogInventoryItem(catalogId: string): V5InventoryEntry | undefined {
  const item = V5_STORE.find((entry) => entry.id === catalogId);
  return item ? { ...item, catalogId: item.id, source: "catalog", quantity: 1 } : undefined;
}

export function normalizeV5Inventory(value: unknown): V5InventoryEntry[] {
  if (!Array.isArray(value)) return [];
  const entries: V5InventoryEntry[] = [];
  const ids = new Set<string>();
  value.forEach((raw) => {
    if (typeof raw === "string") {
      const legacy = createV5CatalogInventoryItem(raw);
      if (legacy && !ids.has(legacy.id)) { entries.push(legacy); ids.add(legacy.id); }
      return;
    }
    if (!raw || typeof raw !== "object") return;
    const candidate = raw as Partial<V5InventoryEntry>;
    const fallback = candidate.catalogId ? createV5CatalogInventoryItem(candidate.catalogId) : undefined;
    const id = typeof candidate.id === "string" && candidate.id ? candidate.id : fallback?.id;
    const name = typeof candidate.name === "string" && candidate.name.trim() ? candidate.name.trim() : fallback?.name;
    if (!id || !name || ids.has(id)) return;
    const category = inventoryCategories.includes(candidate.category as V5StoreCategory) ? candidate.category as V5StoreCategory : fallback?.category || "equipamento";
    const number = (input: unknown, fallbackValue: number | undefined) => typeof input === "number" && Number.isFinite(input) ? Math.max(0, input) : fallbackValue;
    entries.push({
      id,
      catalogId: typeof candidate.catalogId === "string" ? candidate.catalogId : fallback?.catalogId,
      source: candidate.source === "catalog" || candidate.source === "custom" ? candidate.source : fallback ? "catalog" : "custom",
      name,
      category,
      resources: number(candidate.resources, fallback?.resources ?? 0) ?? 0,
      quantity: Math.max(1, Math.floor(number(candidate.quantity, 1) ?? 1)),
      damage: number(candidate.damage, fallback?.damage),
      armor: number(candidate.armor, fallback?.armor),
      specification: typeof candidate.specification === "string" ? candidate.specification : fallback?.specification || "Item registrado na ficha.",
    });
    ids.add(id);
  });
  return entries;
}

export const V5_GENERATIONS = Array.from({ length: 11 }, (_, index) => {
  const generation = 13 - index;
  return { generation, bloodPotency: Math.max(0, 13 - generation), label: generation === 3 ? "Terceira Geração" : `${generation}ª Geração` };
});

export type TemporaryModifier = { id: string; label: string; value: number; scope: "all" | "attributes" | "skills"; enabled: boolean };

export type V5SheetData = {
  clan: string; predator: string; generation: number; bloodPotency: number; humanity: number; hunger: number; portraitUrl: string;
  attributes: Record<string, number>; skills: Record<string, number>; disciplines: Record<string, string[]>;
  advantages: { name: string; dots: number }[]; flaws: { name: string; dots: number }[]; inventory: V5InventoryEntry[]; equippedWeaponId: string | null; equippedArmorId: string | null;
  experienceHistory: V5ExperienceRecord[]; history: V5HistoryRecord[]; temporaryModifiers: TemporaryModifier[];
};

export type V5ExperienceRecord = { id: string; kind: V5AdvancementKind; currentDots: number; targetDots: number; cost: number; recordedAt: number };
export type V5HistoryRecord = { id: string; label: string; recordedAt: number };

export function createV5SheetData(): V5SheetData {
  const attributes = Object.values(V5_ATTRIBUTES).flat().reduce<Record<string, number>>((acc, name) => ({ ...acc, [name]: 1 }), {});
  const skills = Object.values(V5_SKILLS).flat().reduce<Record<string, number>>((acc, name) => ({ ...acc, [name]: 0 }), {});
  return { clan: "", predator: "", generation: 13, bloodPotency: 0, humanity: 7, hunger: 1, portraitUrl: "", attributes, skills, disciplines: {}, advantages: [], flaws: [], inventory: [], equippedWeaponId: null, equippedArmorId: null, experienceHistory: [], history: [], temporaryModifiers: [] };
}

export function appendV5History(sheet: V5SheetData, label: string, recordedAt = Date.now()): V5SheetData {
  return { ...sheet, history: [{ id: `history-${recordedAt}-${sheet.history.length}`, label, recordedAt }, ...sheet.history].slice(0, 8) };
}

export function v5HealthTrack(attributes: Record<string, number>) { return Math.max(1, (attributes["Vigor"] || 1) + 3); }
export function v5WillpowerTrack(attributes: Record<string, number>) { return Math.max(1, (attributes["Determinação"] || 1) + (attributes["Autocontrole"] || 1)); }

export type V5AdvancementKind = "attribute" | "skill" | "discipline" | "outOfClanDiscipline" | "bloodPotency";
const advancementMultipliers: Record<V5AdvancementKind, number> = { attribute: 5, skill: 3, discipline: 5, outOfClanDiscipline: 7, bloodPotency: 10 };

export function calculateV5ExperienceCost(kind: V5AdvancementKind, currentDots: number, targetDots: number) {
  const from = Math.max(0, Math.floor(currentDots));
  const to = Math.max(from, Math.floor(targetDots));
  return Array.from({ length: to - from }, (_, index) => (from + index + 1) * advancementMultipliers[kind]).reduce((total, cost) => total + cost, 0);
}

export function getV5InventoryItems(sheet: Pick<V5SheetData, "inventory">) {
  return normalizeV5Inventory(sheet.inventory);
}

export function getV5EquippedWeapon(sheet: Pick<V5SheetData, "inventory" | "equippedWeaponId">) {
  const item = getV5InventoryItems(sheet).find((entry) => entry.id === sheet.equippedWeaponId);
  return item?.category === "arma" ? item : undefined;
}

export function getV5EquippedArmor(sheet: Pick<V5SheetData, "inventory" | "equippedArmorId">) {
  const item = getV5InventoryItems(sheet).find((entry) => entry.id === sheet.equippedArmorId);
  return item?.category === "armadura" ? item : undefined;
}

export function reconcileV5EquipmentAfterInventoryEdit(current: Pick<V5SheetData, "equippedWeaponId" | "equippedArmorId">, item: Pick<V5InventoryEntry, "id" | "category">) {
  return {
    equippedWeaponId: current.equippedWeaponId === item.id && item.category !== "arma" ? null : current.equippedWeaponId,
    equippedArmorId: current.equippedArmorId === item.id && item.category !== "armadura" ? null : current.equippedArmorId,
  };
}

export function getV5AdvancementLabel(kind: V5AdvancementKind) {
  return ({ attribute: "Atributo", skill: "Habilidade", discipline: "Disciplina de clã", outOfClanDiscipline: "Disciplina externa", bloodPotency: "Potência de Sangue" } satisfies Record<V5AdvancementKind, string>)[kind];
}

export type V5SheetExportSection = { title: string; lines: string[] };

export function buildV5SheetExportSections(input: { name: string; concept?: string; campaignName?: string; sheet: V5SheetData }): V5SheetExportSection[] {
  const { name, concept, campaignName, sheet } = input;
  const clan = V5_CLANS.find((entry) => entry.id === sheet.clan)?.name || "Não informado";
  const predator = V5_PREDATORS.find((entry) => entry.id === sheet.predator)?.name || "Não informado";
  const generation = V5_GENERATIONS.find((entry) => entry.generation === sheet.generation)?.label || `${sheet.generation}ª Geração`;
  const inventoryLines = getV5InventoryItems(sheet).map((item) => {
    const status = item.id === sheet.equippedWeaponId ? " [ARMA EQUIPADA]" : item.id === sheet.equippedArmorId ? " [ARMADURA EQUIPADA]" : "";
    const score = item.damage !== undefined ? `dano +${item.damage}` : item.armor !== undefined ? `proteção +${item.armor}` : `Recursos ${item.resources}`;
    return `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}${status} · ${item.category} · ${score}`;
  });
  const disciplineLines = Object.entries(sheet.disciplines).filter(([, powers]) => powers.length).map(([discipline, powers]) => `${discipline}: ${powers.join(", ")}`);
  const experienceLines = [...sheet.experienceHistory].sort((a, b) => b.recordedAt - a.recordedAt).map((entry) => `${new Date(entry.recordedAt).toLocaleDateString("pt-BR")} · ${getV5AdvancementLabel(entry.kind)} ${entry.currentDots}→${entry.targetDots} · ${entry.cost} XP`);

  return [
    { title: "Identidade", lines: [`Nome: ${name || "Sem nome"}`, `Conceito: ${concept || "Não informado"}`, `Crônica: ${campaignName || "Sem vínculo"}`, `Clã: ${clan}`, `Predador: ${predator}`, `Geração: ${generation} · Potência de Sangue ${sheet.bloodPotency}`] },
    { title: "Marcadores", lines: [`Fome: ${sheet.hunger}/5`, `Humanidade: ${sheet.humanity}/10`, `Vitalidade: ${v5HealthTrack(sheet.attributes)}`, `Força de Vontade: ${v5WillpowerTrack(sheet.attributes)}`] },
    { title: "Atributos", lines: Object.entries(V5_ATTRIBUTES).map(([group, labels]) => `${group}: ${labels.map((label) => `${label} ${sheet.attributes[label] ?? 0}`).join(" · ")}`) },
    { title: "Habilidades", lines: Object.entries(V5_SKILLS).map(([group, labels]) => `${group}: ${labels.filter((label) => (sheet.skills[label] ?? 0) > 0).map((label) => `${label} ${sheet.skills[label]}`).join(" · ") || "Nenhuma registrada"}`) },
    { title: "Disciplinas e poderes", lines: disciplineLines.length ? disciplineLines : ["Nenhuma disciplina ou poder registrado."] },
    { title: "Vantagens", lines: sheet.advantages.length ? sheet.advantages.map((entry) => `${entry.name} · ${entry.dots} ponto(s)`) : ["Nenhuma vantagem registrada."] },
    { title: "Desvantagens", lines: sheet.flaws.length ? sheet.flaws.map((entry) => `${entry.name} · ${entry.dots} ponto(s)`) : ["Nenhuma desvantagem registrada."] },
    { title: "Inventário e equipamento", lines: inventoryLines.length ? inventoryLines : ["Nenhum item registrado."] },
    { title: "Histórico de experiência", lines: experienceLines.length ? experienceLines : ["Nenhuma evolução registrada."] },
  ];
}
