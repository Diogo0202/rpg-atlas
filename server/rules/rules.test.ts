import { describe, expect, it } from "vitest";
import { evaluateOneRingRoll, evaluateV5Roll } from "./index";

describe("motor de regras V5", () => {
  it("aplica penalidade sem reduzir a reserva abaixo de um dado", () => {
    const result = evaluateV5Roll({ attribute: 1, skill: 0, hunger: 2, penalty: 3, dice: [10, 1] });
    expect(result.basePool).toBe(1);
    expect(result.finalPool).toBe(1);
    expect(result.hungerDice).toBe(1);
  });

  it("reconhece um crítico bagunçado quando há dois dez e Fome", () => {
    const result = evaluateV5Roll({ attribute: 3, skill: 2, hunger: 2, dice: [10, 10, 5, 3, 2] });
    expect(result.successes).toBe(4);
    expect(result.messyCritical).toBe(true);
  });
});

describe("motor de regras O Um Anel", () => {
  it("reconhece um grande sucesso por dado de proeza seis", () => {
    const result = evaluateOneRingRoll({ target: 14, successDie: 8, featDice: [6] });
    expect(result.success).toBe(true);
    expect(result.greatSuccess).toBe(true);
  });

  it("marca o Olho de Sauron como falha independente do total", () => {
    const result = evaluateOneRingRoll({ target: 10, successDie: 11, featDice: [6, 6] });
    expect(result.eyeOfSauron).toBe(true);
    expect(result.success).toBe(false);
  });
});
