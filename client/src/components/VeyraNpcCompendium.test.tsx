// @vitest-environment jsdom
import { expect, it } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VeyraNpcCompendium } from "./VeyraNpcCompendium";

it("filtra os NPCs de Véspera do Vau pela relação com os Heróis", async () => {
  const user = userEvent.setup();
  render(<VeyraNpcCompendium />);
  expect(screen.getByText("Maela Varn")).toBeTruthy();
  expect(screen.getByText("Salamon Kane")).toBeTruthy();
  await user.click(screen.getByRole("tab", { name: "Inimigos" }));
  expect(screen.getByText("Odran Voss")).toBeTruthy();
  expect(screen.getByText("Brahan Kane")).toBeTruthy();
  expect(screen.getByText("A Linhagem Kane: Sangue, Ferro e Fé · p. 4")).toBeTruthy();
  expect(screen.queryByText("Maela Varn")).toBeNull();
});
