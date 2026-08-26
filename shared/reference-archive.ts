import { V5_CLANS } from "./vampire-v5";

export const V5_REFERENCE_CLAN_IDS = [
  "banu-haqim", "brujah", "gangrel", "hecata", "lasombra", "malkavian",
  "ministerio", "nosferatu", "toreador", "tremere", "tzimisce", "ventrue",
] as const;

export const V5_REFERENCE_CLANS = V5_REFERENCE_CLAN_IDS.map((id) => {
  const clan = V5_CLANS.find((entry) => entry.id === id);
  if (!clan) throw new Error(`Clã de referência não encontrado: ${id}`);
  return clan;
});

export type HunterCreed = {
  id: string;
  name: string;
  focus: string;
  methods: string[];
  archetypes: string[];
};

export const HUNTER_CREEDS: HunterCreed[] = [
  {
    id: "empreendedor",
    name: "Empreendedor",
    focus: "Transforma engenho, recursos e soluções experimentais em vantagens para a Caçada.",
    methods: ["Preparação técnica", "Recursos improvisados", "Soluções pragmáticas"],
    archetypes: ["Trabalhador de Jornada Dupla", "Negociador de Contratos", "Influenciador", "Promoter de Boates"],
  },
  {
    id: "devoto",
    name: "Devoto",
    focus: "Sustenta a Caçada em fé, justiça pessoal e compromisso moral diante do sobrenatural.",
    methods: ["Juramentos", "Expiação", "Proteção da comunidade"],
    archetypes: ["Absolvedor", "Convertido de Última Hora", "Espécime Físico", "Apóstata"],
  },
  {
    id: "inquisitivo",
    name: "Inquisitivo",
    focus: "Investiga padrões, preserva evidências e compreende o oculto antes de agir.",
    methods: ["Coleta de informação", "Análise de padrões", "Pesquisa do oculto"],
    archetypes: ["Libertador de Dados", "Especialista em Sinistros", "Professor Substituto", "Motorista de Rota"],
  },
  {
    id: "marcial",
    name: "Marcial",
    focus: "Enfrenta a presa de modo direto, disciplinado e preparado para proteger a célula sob pressão.",
    methods: ["Treinamento", "Táticas de confronto", "Poder de fogo"],
    archetypes: ["Desistente", "Engenheiro", "Ativo Comprometido", "Atirador de Elite"],
  },
  {
    id: "clandestino",
    name: "Clandestino",
    focus: "Combate o oculto pela contracultura, subterfúgio e acesso a redes que operam fora do caminho oficial.",
    methods: ["Infiltração", "Sabotagem", "Sobrevivência urbana"],
    archetypes: ["Pistoleiro", "Dono de Galeria", "Contrabandista", "Infiltrado"],
  },
];

export type OneRingLineage = {
  id: string;
  name: string;
  homeland: string;
  outlook: string;
  culturalBlessing: string;
};

export const ONE_RING_LINEAGES: OneRingLineage[] = [
  { id: "durin", name: "Anões do Povo de Durin", homeland: "Montanhas Nebulosas e seus salões ancestrais", outlook: "Resiliência, memória e obra paciente diante de uma herança pesada.", culturalBlessing: "Formidável" },
  { id: "bardeses", name: "Bardeses", homeland: "Dale, Vale do Anduin e as terras próximas à Montanha Solitária", outlook: "Coragem pública, liderança e uma esperança que se recusa a apagar.", culturalBlessing: "Coração Forte" },
  { id: "lindon", name: "Elfos de Lindon", homeland: "Os refúgios élficos a oeste de Eriador", outlook: "Memória longa, percepção sutil e dever diante da sombra que retorna.", culturalBlessing: "Povo Élfico" },
  { id: "condado", name: "Hobbits do Condado", homeland: "O Condado e suas comunidades discretas", outlook: "Humildade, constância e coragem revelada quando o lar precisa ser protegido.", culturalBlessing: "Povo Pequeno" },
  { id: "bri", name: "Homens de Bri", homeland: "Bri e as estradas que ligam Eriador", outlook: "Praticidade, hospitalidade e disposição para lidar com o incomum que passa pela encruzilhada.", culturalBlessing: "Pessoas de Bri" },
  { id: "patrulheiros", name: "Patrulheiros do Norte", homeland: "Os ermos e as ruínas do antigo Arnor", outlook: "Vigilância, sacrifício e responsabilidade silenciosa pelas fronteiras esquecidas.", culturalBlessing: "Sangue de Westernesse" },
];

export const REFERENCE_SOURCES = {
  hunter: { label: "Cópia de Caçador — A Revanche", detail: "PDF anexado pelo cronista; credos e arquétipos consultados nas páginas 33–51." },
  vampire: { label: "Materiais V5 do Drive", detail: "Catálogo estruturado a partir das referências de Vampiro: A Máscara V5 preservadas no atlas." },
  oneRing: { label: "O Um Anel 2ª edição", detail: "Culturas heroicas consultadas no material compartilhado do Drive." },
} as const;
