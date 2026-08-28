// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VeyraNpcCompendium } from "./VeyraNpcCompendium";

afterEach(cleanup);

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

it("encontra NPCs por nome e especialidade, preservando o filtro de relação", async () => {
  const user = userEvent.setup();
  render(<VeyraNpcCompendium />);
  const search = screen.getByRole("searchbox", { name: "Buscar NPC por nome, especialidade, descrição ou gancho" });
  await user.type(search, "contrainteligencia");
  expect(screen.getByText("Salamon Kane")).toBeTruthy();
  expect(screen.queryByText("Maela Varn")).toBeNull();
  await user.clear(search);
  await user.click(screen.getByRole("tab", { name: "Neutros" }));
  await user.type(search, "infiltração");
  expect(screen.getByText("Dorian Kane")).toBeTruthy();
  expect(screen.getByText("Alistair Kane")).toBeTruthy();
  expect(screen.queryByText("Maela Varn")).toBeNull();
});
