// @vitest-environment jsdom
import { expect, it } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { createV5CatalogInventoryItem } from "@shared/vampire-v5";
import { V5AnimalCompanionsPanel } from "./V5AnimalCompanionsPanel";

it("apresenta na ficha o perfil resumido do animal adquirido na loja", () => {
  render(<V5AnimalCompanionsPanel animals={[createV5CatalogInventoryItem("destrier")!]} />);
  expect(screen.getByText("Destrier")).toBeTruthy();
  expect(screen.getByText("For")).toBeTruthy();
  expect(screen.getByText("Vit")).toBeTruthy();
  expect(screen.getByText("6")).toBeTruthy();
  expect(screen.getByText(/Treinado para guerra/)).toBeTruthy();
});
