// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DiceAnimationControl } from "./DiceAnimationControl";

it("permite alternar de animação para resultado instantâneo", async () => {
  const user = userEvent.setup();
  const setAnimationsEnabled = vi.fn();
  render(<DiceAnimationControl animationsEnabled setAnimationsEnabled={setAnimationsEnabled} />);
  await user.click(screen.getByRole("button", { name: /animação ativa/i }));
  expect(setAnimationsEnabled).toHaveBeenCalledWith(false);
});
