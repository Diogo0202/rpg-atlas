/** Funções puras do motor de regras, independentes da interface dos sistemas. */
export type RuleModifier = { source: string; value: number; active?: boolean };

export function calculateRuleTotal(base: number, modifiers: readonly RuleModifier[] = [], minimum = 0) {
  const applied = modifiers.filter((modifier) => modifier.active !== false);
  return Math.max(minimum, Math.round(base) + applied.reduce((total, modifier) => total + Math.round(modifier.value), 0));
}

export type IntegrityTrack = { maximum: number; superficial: number; aggravated: number; occupied: number; remaining: number; impaired: boolean; penalty: number };

export function calculateIntegrityTrack(maximum: number, superficial: number, aggravated: number): IntegrityTrack {
  const normalizedMaximum = Math.max(1, Math.round(maximum));
  const normalizedAggravated = Math.max(0, Math.min(normalizedMaximum, Math.round(aggravated)));
  const normalizedSuperficial = Math.max(0, Math.min(normalizedMaximum - normalizedAggravated, Math.round(superficial)));
  const occupied = normalizedSuperficial + normalizedAggravated;
  const impaired = occupied >= normalizedMaximum;
  return { maximum: normalizedMaximum, superficial: normalizedSuperficial, aggravated: normalizedAggravated, occupied, remaining: normalizedMaximum - occupied, impaired, penalty: impaired ? -2 : 0 };
}

/** Estado derivado de O Um Anel: quando a resistência chega à carga, o herói fica Cansado. */
export function calculateOneRingJourneyState(endurance: number, load: number) {
  const normalizedEndurance = Math.max(0, Math.round(endurance));
  const normalizedLoad = Math.max(0, Math.round(load));
  const weary = normalizedEndurance <= normalizedLoad;
  return { endurance: normalizedEndurance, load: normalizedLoad, weary, margin: normalizedEndurance - normalizedLoad };
}

/** Enquanto Cansado, resultados 1–3 nos dados de perícia não contam. */
export function applyOneRingWeariness(skillDice: readonly number[], weary: boolean) {
  return skillDice.map((die) => weary && die >= 1 && die <= 3 ? 0 : die);
}
