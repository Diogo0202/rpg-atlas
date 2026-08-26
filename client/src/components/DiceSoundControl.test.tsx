// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DiceSoundControl } from "./DiceSoundControl";

it("permite ativar os efeitos de dados e ajustar o volume", async () => {
  const user = userEvent.setup();
  const setEnabled = vi.fn();
  const setVolume = vi.fn();
  render(<DiceSoundControl enabled={false} setEnabled={setEnabled} volume={45} setVolume={setVolume} />);
  await user.click(screen.getByRole("button", { name: /som desligado/i }));
  await user.click(screen.getByLabelText("Volume dos dados"));
  expect(setEnabled).toHaveBeenCalledWith(true);
  expect(screen.getByText("45%")).toBeTruthy();
});
