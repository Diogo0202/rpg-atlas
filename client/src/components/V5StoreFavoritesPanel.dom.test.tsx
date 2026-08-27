// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({ setFavoriteMutate: vi.fn(), toastSuccess: vi.fn(), toastInfo: vi.fn(), toastError: vi.fn() }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ store: { favorites: { invalidate: vi.fn() } } }),
    store: {
      favorites: { useQuery: () => ({ isLoading: false, data: [{ itemId: "destrier", createdAt: new Date() }, { itemId: "van-operacional", createdAt: new Date() }, { itemId: "traje-antimotim", createdAt: new Date() }] }) },
      setFavorite: { useMutation: () => ({ mutate: mocks.setFavoriteMutate, isPending: false }) },
    },
  },
}));

vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess, info: mocks.toastInfo, error: mocks.toastError } }));
import { V5StoreFavoritesPanel } from "./V5StoreFavoritesPanel";

const renderPanel = () => render(<V5StoreFavoritesPanel resources={1} characterName="Aurora" />);
afterEach(() => { cleanup(); mocks.setFavoriteMutate.mockClear(); mocks.toastError.mockClear(); });

it("lista e remove um favorito pessoal da loja", async () => {
  const user = userEvent.setup(); renderPanel();
  expect(screen.getByText("Destrier")).toBeTruthy();
  await user.click(screen.getByLabelText("Remover Destrier dos favoritos"));
  expect(mocks.setFavoriteMutate).toHaveBeenCalledWith({ itemId: "destrier", favorite: false });
});

it("guarda um novo item para compra futura", async () => {
  const user = userEvent.setup(); renderPanel();
  await user.selectOptions(screen.getByLabelText("Item para favoritar"), "pistola");
  await user.click(screen.getByRole("button", { name: /guardar/i }));
  expect(mocks.setFavoriteMutate).toHaveBeenCalledWith({ itemId: "pistola", favorite: true });
});

it("alerta quando os Recursos da ficha escolhida no Arsenal não cobrem o favorito", () => {
  renderPanel();
  expect(screen.getAllByText("Recursos 1 / exige 4").length).toBeGreaterThan(0);
  expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
  expect(screen.getByText(/Ficha selecionada no Arsenal: Aurora/)).toBeTruthy();
});

it("compara dois favoritos e bloqueia uma terceira seleção", async () => {
  const user = userEvent.setup(); renderPanel();
  const compareButtons = screen.getAllByRole("button", { name: "Comparar" });
  await user.click(compareButtons[0]);
  await user.click(screen.getAllByRole("button", { name: "Comparar" })[0]);
  expect(screen.getByLabelText("Comparação de favoritos")).toBeTruthy();
  expect(screen.getByRole("columnheader", { name: "Destrier" })).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Comparar" }));
  expect(mocks.toastError).toHaveBeenCalledWith(expect.stringMatching(/somente dois/i));
});
