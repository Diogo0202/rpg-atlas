// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createV5CatalogInventoryItem } from "@shared/vampire-v5";

const mocks = vi.hoisted(() => ({ create: vi.fn(), download: vi.fn(), toastSuccess: vi.fn(), toastError: vi.fn() }));
vi.mock("@/lib/animalPdf", () => ({ createAnimalPdfFile: mocks.create, downloadAnimalPdf: mocks.download }));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess, error: mocks.toastError } }));
import { V5AnimalCompanionsPanel } from "./V5AnimalCompanionsPanel";

afterEach(() => { cleanup(); mocks.create.mockReset(); mocks.download.mockReset(); mocks.toastSuccess.mockReset(); mocks.toastError.mockReset(); });

it("apresenta na ficha o perfil resumido do animal adquirido na loja", () => {
  render(<V5AnimalCompanionsPanel animals={[createV5CatalogInventoryItem("destrier")!]} />);
  expect(screen.getByLabelText("Visualização rápida de animais")).toBeTruthy();
  expect(screen.getByText("Destrier")).toBeTruthy();
  expect(screen.getByText("For")).toBeTruthy();
  expect(screen.getByText("Vit")).toBeTruthy();
  expect(screen.getByText("6")).toBeTruthy();
  expect(screen.getByText(/Treinado para guerra/)).toBeTruthy();
});

it("exporta a ficha resumida do animal em PDF", async () => {
  const user = userEvent.setup(); const file = new File(["pdf"], "destrier.pdf", { type: "application/pdf" }); mocks.create.mockResolvedValue(file);
  render(<V5AnimalCompanionsPanel animals={[createV5CatalogInventoryItem("destrier")!]} />);
  await user.click(screen.getByLabelText("Exportar ficha de Destrier em PDF"));
  await waitFor(() => expect(mocks.download).toHaveBeenCalledWith(file));
  expect(mocks.toastSuccess).toHaveBeenCalledWith(expect.stringMatching(/exportada em PDF/i));
});

it("informa erro quando a geração do PDF falha", async () => {
  const user = userEvent.setup(); mocks.create.mockRejectedValue(new Error("falha"));
  render(<V5AnimalCompanionsPanel animals={[createV5CatalogInventoryItem("destrier")!]} />);
  await user.click(screen.getByLabelText("Exportar ficha de Destrier em PDF"));
  await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith(expect.stringMatching(/não foi possível/i)));
});
