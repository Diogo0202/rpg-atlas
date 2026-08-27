// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import CharacterArchive from "./CharacterArchive";

afterEach(() => { cleanup(); window.localStorage.clear(); });

it("apresenta fichas preservadas sem controles de criação no painel inicial", async () => {
  window.localStorage.setItem("rpg-atlas-v5-sheets-v1", JSON.stringify([{ id: "v5-1", name: "Mara", concept: "Detetive", chronicle: "Veyr", clanId: "sanguelume", hunger: 2, selectedPowerIds: ["sal-da-passagem"] }]));
  render(<CharacterArchive />);
  expect(await screen.findByRole("heading", { name: "Mara" })).toBeTruthy();
  expect(screen.getAllByText("Detetive").length).toBe(2);
  expect(screen.queryByRole("button", { name: /nova/i })).toBeNull();
  expect(screen.queryByRole("button", { name: /autenticar/i })).toBeNull();
  expect(screen.queryByLabelText(/carregar retrato/i)).toBeNull();
});
