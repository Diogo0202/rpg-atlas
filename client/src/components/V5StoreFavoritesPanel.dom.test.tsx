// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const setFavoriteMutate = vi.fn();
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ store: { favorites: { invalidate: vi.fn() } } }),
    store: {
      favorites: { useQuery: () => ({ isLoading: false, data: [{ itemId: "destrier", createdAt: new Date() }] }) },
      setFavorite: { useMutation: () => ({ mutate: setFavoriteMutate, isPending: false }) },
    },
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() } }));

import { V5StoreFavoritesPanel } from "./V5StoreFavoritesPanel";

afterEach(() => { cleanup(); setFavoriteMutate.mockClear(); });

it("lista e remove um favorito pessoal da loja", async () => {
  const user = userEvent.setup();
  render(<V5StoreFavoritesPanel />);
  expect(screen.getByText("Destrier")).toBeTruthy();
  await user.click(screen.getByLabelText("Remover Destrier dos favoritos"));
  expect(setFavoriteMutate).toHaveBeenCalledWith({ itemId: "destrier", favorite: false });
});

it("guarda um novo item para compra futura", async () => {
  const user = userEvent.setup();
  render(<V5StoreFavoritesPanel />);
  await user.selectOptions(screen.getByLabelText("Item para favoritar"), "van-operacional");
  await user.click(screen.getByRole("button", { name: /guardar/i }));
  expect(setFavoriteMutate).toHaveBeenCalledWith({ itemId: "van-operacional", favorite: true });
});
