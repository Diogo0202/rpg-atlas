/**
 * Contratos de regras do RPG Atlas.
 * Cada sistema descreve apenas seus campos, recursos e mecânicas; as entidades
 * de campanha, personagens e biblioteca permanecem independentes do sistema.
 */
export type RpgSystemId = "vampiro-v5" | "o-um-anel" | "cacador-a-vinganca";

export type TraitDefinition = {
  id: string;
  label: string;
  group: string;
  min: number;
  max: number;
};

export type ResourceDefinition = {
  id: string;
  label: string;
  kind: "track" | "pool" | "counter";
  min: number;
  max: number;
};

export type RpgSystemDefinition = {
  id: RpgSystemId;
  name: string;
  edition: string;
  status: "active" | "planned";
  rollEngine: "v5-pool" | "one-ring-success-die";
  attributes: readonly TraitDefinition[];
  skills: readonly TraitDefinition[];
  resources: readonly ResourceDefinition[];
};

const trait = (id: string, label: string, group: string, min: number, max: number): TraitDefinition => ({ id, label, group, min, max });

export const RPG_SYSTEMS: readonly RpgSystemDefinition[] = [
  {
    id: "vampiro-v5",
    name: "Vampiro: A Máscara",
    edition: "5ª edição",
    status: "active",
    rollEngine: "v5-pool",
    attributes: [
      trait("forca", "Força", "Físicos", 1, 5), trait("destreza", "Destreza", "Físicos", 1, 5), trait("vigor", "Vigor", "Físicos", 1, 5),
      trait("carisma", "Carisma", "Sociais", 1, 5), trait("manipulacao", "Manipulação", "Sociais", 1, 5), trait("autocontrole", "Autocontrole", "Sociais", 1, 5),
      trait("inteligencia", "Inteligência", "Mentais", 1, 5), trait("raciocinio", "Raciocínio", "Mentais", 1, 5), trait("determinacao", "Determinação", "Mentais", 1, 5),
    ],
    skills: [
      trait("atletismo", "Atletismo", "Físicas", 0, 5), trait("briga", "Briga", "Físicas", 0, 5), trait("furtividade", "Furtividade", "Físicas", 0, 5),
      trait("persuasao", "Persuasão", "Sociais", 0, 5), trait("subterfugio", "Subterfúgio", "Sociais", 0, 5), trait("empatia", "Empatia", "Sociais", 0, 5),
      trait("investigacao", "Investigação", "Mentais", 0, 5), trait("ocultismo", "Ocultismo", "Mentais", 0, 5), trait("tecnologia", "Tecnologia", "Mentais", 0, 5),
    ],
    resources: [
      { id: "hunger", label: "Fome", kind: "counter", min: 0, max: 5 },
      { id: "health", label: "Vitalidade", kind: "track", min: 0, max: 10 },
      { id: "willpower", label: "Força de Vontade", kind: "track", min: 0, max: 10 },
    ],
  },
  {
    id: "o-um-anel",
    name: "O Um Anel",
    edition: "2ª edição",
    status: "active",
    rollEngine: "one-ring-success-die",
    attributes: [
      trait("strength", "Força", "Atributos", 1, 7), trait("heart", "Coração", "Atributos", 1, 7), trait("wits", "Espírito", "Atributos", 1, 7),
    ],
    skills: [
      trait("awe", "Presença", "Personalidade", 0, 6), trait("athletics", "Atletismo", "Movimento", 0, 6), trait("awareness", "Percepção", "Percepção", 0, 6),
      trait("hunting", "Caçada", "Sobrevivência", 0, 6), trait("song", "Canção", "Personalidade", 0, 6), trait("travel", "Viagem", "Sobrevivência", 0, 6),
    ],
    resources: [
      { id: "endurance", label: "Vigor", kind: "pool", min: 0, max: 40 },
      { id: "hope", label: "Esperança", kind: "pool", min: 0, max: 20 },
      { id: "shadow", label: "Sombra", kind: "counter", min: 0, max: 10 },
    ],
  },
  {
    id: "cacador-a-vinganca",
    name: "Caçador: A Revanche",
    edition: "5ª edição",
    status: "active",
    rollEngine: "v5-pool",
    attributes: [
      trait("forca", "Força", "Físicos", 1, 5), trait("destreza", "Destreza", "Físicos", 1, 5), trait("vigor", "Vigor", "Físicos", 1, 5),
      trait("carisma", "Carisma", "Sociais", 1, 5), trait("manipulacao", "Manipulação", "Sociais", 1, 5), trait("autocontrole", "Autocontrole", "Sociais", 1, 5),
      trait("inteligencia", "Inteligência", "Mentais", 1, 5), trait("raciocinio", "Raciocínio", "Mentais", 1, 5), trait("determinacao", "Determinação", "Mentais", 1, 5),
    ],
    skills: [
      trait("atletismo", "Atletismo", "Físicas", 0, 5), trait("briga", "Briga", "Físicas", 0, 5), trait("furtividade", "Furtividade", "Físicas", 0, 5),
      trait("persuasao", "Persuasão", "Sociais", 0, 5), trait("subterfugio", "Subterfúgio", "Sociais", 0, 5), trait("empatia", "Empatia", "Sociais", 0, 5),
      trait("investigacao", "Investigação", "Mentais", 0, 5), trait("ocultismo", "Ocultismo", "Mentais", 0, 5), trait("tecnologia", "Tecnologia", "Mentais", 0, 5),
    ],
    resources: [
      { id: "health", label: "Vitalidade", kind: "track", min: 0, max: 10 },
      { id: "willpower", label: "Força de Vontade", kind: "track", min: 0, max: 10 },
      { id: "desperation", label: "Desespero", kind: "counter", min: 0, max: 5 },
    ],
  },
] as const;

export function getRpgSystem(systemId: RpgSystemId) {
  return RPG_SYSTEMS.find((system) => system.id === systemId);
}
