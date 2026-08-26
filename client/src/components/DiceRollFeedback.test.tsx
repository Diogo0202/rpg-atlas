// @vitest-environment jsdom
import { expect, it } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { DiceRollFeedback } from "./DiceRollFeedback";

it("evidencia visualmente quando uma condição altera o resultado", () => {
  render(<DiceRollFeedback dice={[10, 6, 2]} modifier={-2}><p>Teste de condição</p></DiceRollFeedback>);
  expect(screen.getByText(/Condição temporária aplicada: -2/i)).toBeTruthy();
  expect(screen.getByText("10")).toBeTruthy();
});
