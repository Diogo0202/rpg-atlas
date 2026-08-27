// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({ createMutate: vi.fn(), removeMutate: vi.fn(), setItemMutate: vi.fn(), toastSuccess: vi.fn(), toastError: vi.fn() }));
vi.mock("@/lib/trpc", () => ({ trpc: { useUtils: () => ({ shoppingLists: { mine: { invalidate: vi.fn() } } }), campaigns: { mine: { useQuery: () => ({ data: [{ id: 12, title: "Noites de Veyr", systemId: "vampiro-v5" }] }) } }, store: { favorites: { useQuery: () => ({ data: [{ itemId: "destrier" }] }) } }, shoppingLists: { mine: { useQuery: () => ({ isLoading: false, data: [{ id: 4, title: "Cavalaria", campaignId: 12, campaignTitle: "Noites de Veyr", itemIds: [] }] }) }, create: { useMutation: () => ({ mutate: mocks.createMutate, isPending: false }) }, remove: { useMutation: () => ({ mutate: mocks.removeMutate, isPending: false }) }, setItem: { useMutation: () => ({ mutate: mocks.setItemMutate, isPending: false }) } } } }));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess, error: mocks.toastError } }));
import { V5CampaignShoppingListsPanel } from "./V5CampaignShoppingListsPanel";

afterEach(() => { cleanup(); mocks.createMutate.mockClear(); mocks.setItemMutate.mockClear(); });

it("cria uma lista vinculada a uma campanha V5", async () => {
  const user = userEvent.setup(); render(<V5CampaignShoppingListsPanel />);
  await user.selectOptions(screen.getByLabelText("Campanha da lista"), "12");
  await user.type(screen.getByLabelText("Nome da lista"), "Montarias");
  await user.click(screen.getByRole("button", { name: /criar/i }));
  expect(mocks.createMutate).toHaveBeenCalledWith({ campaignId: 12, title: "Montarias" });
});

it("adiciona um favorito à lista de campanha selecionada", async () => {
  const user = userEvent.setup(); render(<V5CampaignShoppingListsPanel />);
  await user.click(screen.getByRole("button", { name: /Cavalaria/i }));
  await user.selectOptions(screen.getByLabelText("Favorito para lista"), "destrier");
  await user.click(screen.getByRole("button", { name: /adicionar/i }));
  expect(mocks.setItemMutate).toHaveBeenCalledWith({ listId: 4, itemId: "destrier", included: true });
});
