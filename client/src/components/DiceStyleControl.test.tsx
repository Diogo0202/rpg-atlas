// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DiceStyleControl } from "./DiceStyleControl";

it("permite escolher um acabamento visual para os dados", async () => {
  const user = userEvent.setup();
  const setDiceStyle = vi.fn();
  render(<DiceStyleControl diceStyle="obsidiana" setDiceStyle={setDiceStyle} />);
  await user.click(screen.getByLabelText("Estilo Brasa"));
  expect(setDiceStyle).toHaveBeenCalledWith("brasa");
});
