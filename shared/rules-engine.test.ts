import { expect, it } from "vitest";
import { applyOneRingWeariness, calculateIntegrityTrack, calculateOneRingJourneyState, calculateRuleTotal } from "./rules-engine";

it("soma somente modificadores ativos e respeita o mínimo do pool", () => {
  expect(calculateRuleTotal(3, [{ source: "Condição", value: 2 }, { source: "Penalidade", value: -1 }, { source: "Inativa", value: 5, active: false }], 1)).toBe(4);
  expect(calculateRuleTotal(0, [{ source: "Debilitado", value: -4 }], 1)).toBe(1);
});

it("normaliza a trilha de integridade e aplica penalidade ao preenchê-la", () => {
  expect(calculateIntegrityTrack(5, 2, 1)).toMatchObject({ maximum: 5, superficial: 2, aggravated: 1, occupied: 3, remaining: 2, impaired: false, penalty: 0 });
  expect(calculateIntegrityTrack(5, 4, 2)).toMatchObject({ maximum: 5, superficial: 3, aggravated: 2, occupied: 5, remaining: 0, impaired: true, penalty: -2 });
});

it("marca Cansaço e anula resultados baixos dos dados de perícia em O Um Anel", () => {
  expect(calculateOneRingJourneyState(12, 12)).toMatchObject({ weary: true, margin: 0 });
  expect(calculateOneRingJourneyState(13, 12)).toMatchObject({ weary: false, margin: 1 });
  expect(applyOneRingWeariness([1, 3, 4, 6], true)).toEqual([0, 0, 4, 6]);
  expect(applyOneRingWeariness([1, 3, 4, 6], false)).toEqual([1, 3, 4, 6]);
});
