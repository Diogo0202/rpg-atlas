export type V5Die = { value: number; hunger: boolean };

export type V5RollInput = {
  attribute: number;
  skill: number;
  hunger: number;
  penalty?: number;
  dice: readonly number[];
};

export type V5RollResult = {
  basePool: number;
  penalty: number;
  finalPool: number;
  hungerDice: number;
  dice: V5Die[];
  successes: number;
  messyCritical: boolean;
  bestialFailure: boolean;
  verdict: string;
};

export function evaluateV5Roll(input: V5RollInput): V5RollResult {
  const basePool = Math.max(1, input.attribute + input.skill);
  const penalty = Math.max(0, input.penalty ?? 0);
  const finalPool = Math.max(1, basePool - penalty);
  const hungerDice = Math.min(finalPool, Math.max(0, input.hunger));
  const dice = input.dice.slice(0, finalPool).map((value, index) => ({ value: Math.min(10, Math.max(1, value)), hunger: index < hungerDice }));
  const successes = dice.reduce((total, die) => total + (die.value >= 6 ? 1 : 0), 0);
  const tens = dice.filter((die) => die.value === 10).length;
  const totalSuccesses = successes + Math.floor(tens / 2) * 2;
  const messyCritical = dice.some((die) => die.hunger && die.value === 10) && tens >= 2;
  const bestialFailure = dice.some((die) => die.hunger && die.value === 1) && totalSuccesses === 0;

  return {
    basePool,
    penalty,
    finalPool,
    hungerDice,
    dice,
    successes: totalSuccesses,
    messyCritical,
    bestialFailure,
    verdict: messyCritical ? "Crítico bagunçado" : bestialFailure ? "Falha bestial" : totalSuccesses > 0 ? "Êxito" : "Falha",
  };
}
