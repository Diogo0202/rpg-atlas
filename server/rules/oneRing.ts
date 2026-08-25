export type OneRingRollInput = {
  target: number;
  successDie: number;
  featDice: readonly number[];
  favored?: boolean;
  illFavored?: boolean;
};

export type OneRingRollResult = {
  target: number;
  successDie: number;
  featDice: number[];
  total: number;
  greatSuccess: boolean;
  extraordinarySuccess: boolean;
  eyeOfSauron: boolean;
  success: boolean;
};

export function evaluateOneRingRoll(input: OneRingRollInput): OneRingRollResult {
  const validFeatDice = input.featDice.map((value) => Math.min(6, Math.max(1, value)));
  const selectedFeatDice = input.favored ? validFeatDice.sort((a, b) => b - a).slice(0, 1) : input.illFavored ? validFeatDice.sort((a, b) => a - b).slice(0, 1) : validFeatDice;
  const successDie = Math.min(12, Math.max(1, input.successDie));
  const total = successDie + selectedFeatDice.reduce((sum, value) => sum + value, 0);
  const eyeOfSauron = successDie === 11;
  const success = !eyeOfSauron && total >= input.target;
  const sixes = selectedFeatDice.filter((value) => value === 6).length;

  return {
    target: input.target,
    successDie,
    featDice: selectedFeatDice,
    total,
    eyeOfSauron,
    success,
    greatSuccess: success && sixes === 1,
    extraordinarySuccess: success && sixes >= 2,
  };
}
