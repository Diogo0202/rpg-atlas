// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({ createMutate: vi.fn(), removeMutate: vi.fn(), setItemMutate: vi.fn(), setItemAcquiredMutate: vi.fn(), shareMutate: vi.fn(), toastSuccess: vi.fn(), toastError: vi.fn() }));
vi.mock("@/lib/trpc", () => ({ trpc: { useUtils: () => ({ shoppingLists: { mine: { invalidate: vi.fn() } } }), campaigns: { mine: { useQuery: () => ({ data: [{ id: 12, title: "Noites de Veyr", systemId: "vampiro-v5" }] }) } }, store: { favorites: { useQuery: () => ({ data: [{ itemId: "destrier" }, { itemId: "van-operacional" }] }) } }, shoppingLists: { mine: { useQuery: () => ({ isLoading: false, data: [{ id: 4, title: "Cavalaria", campaignId: 12, campaignTitle: "Noites de Veyr", items: [{ itemId: "destrier", isAcquired: 0, acquiredAt: null }, { itemId: "van-operacional", isAcquired: 1, acquiredAt: new Date() }] }] }) }, create: { useMutation: () => ({ mutate: mocks.createMutate, isPending: false }) }, remove: { useMutation: () => ({ mutate: mocks.removeMutate, isPending: false }) }, setItem: { useMutation: () => ({ mutate: mocks.setItemMutate, isPending: false }) }, setItemAcquired: { useMutation: () => ({ mutate: mocks.setItemAcquiredMutate, isPending: false }) }, createShareLink: { useMutation: () => ({ mutate: mocks.shareMutate, isPending: false }) } } } }));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess, error: mocks.toastError } }));
import { V5CampaignShoppingListsPanel } from "./V5CampaignShoppingListsPanel";

afterEach(() => { cleanup(); Object.values(mocks).forEach((mock) => mock.mockClear()); });

it("cria uma lista vinculada a uma campanha V5", async () => {
  const user = userEvent.setup(); render(<V5CampaignShoppingListsPanel />);
  await user.selectOptions(screen.getByLabelText("Campanha da lista"), "12");
  await user.type(screen.getByLabelText("Nome da lista"), "Montarias");
  await user.click(screen.getByRole("button", { name: /criar/i }));
  expect(mocks.createMutate).toHaveBeenCalledWith({ campaignId: 12, title: "Montarias" });
});

it("mostra totais e permite marcar um item como adquirido", async () => {
  const user = userEvent.setup(); render(<V5CampaignShoppingListsPanel />);
  await user.click(screen.getByRole("button", { name: /Cavalaria/i }));
  expect(screen.getByText("8")).toBeTruthy();
  expect(screen.getByText("4")).toBeTruthy();
  await user.click(screen.getByLabelText("Marcar Destrier como adquirido"));
  expect(mocks.setItemAcquiredMutate).toHaveBeenCalledWith({ listId: 4, itemId: "destrier", acquired: true });
});

it("gera um link para compartilhar a lista com o narrador", async () => {
  const user = userEvent.setup(); render(<V5CampaignShoppingListsPanel />);
  await user.click(screen.getByRole("button", { name: /Cavalaria/i }));
  await user.click(screen.getByLabelText("Compartilhar lista Cavalaria"));
  expect(mocks.shareMutate).toHaveBeenCalledWith({ listId: 4 });
});
