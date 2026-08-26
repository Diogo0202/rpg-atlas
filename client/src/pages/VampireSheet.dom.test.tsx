import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createV5SheetData } from "@shared/vampire-v5";

const invalidate = vi.fn();
const mutate = vi.fn();
const characters = [
  { id: 11, systemId: "vampiro-v5", name: "Mara", concept: "Investigadora", campaignId: null, sheetData: createV5SheetData() },
  { id: 12, systemId: "vampiro-v5", name: "Dante", concept: "Guardião", campaignId: null, sheetData: createV5SheetData() },
];

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/components/SystemRuleTooltip", () => ({ SystemRuleTooltip: () => <span>Regra V5</span>, AttributeRuleTooltip: () => <span>Regra de atributo</span> }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ characters: { mine: { invalidate } }, archetypes: { mine: { invalidate } } }),
    characters: {
      mine: { useQuery: () => ({ data: characters }) },
      create: { useMutation: () => ({ mutate, isPending: false }) },
      update: { useMutation: () => ({ mutate, isPending: false }) },
      recordRoll: { useMutation: () => ({ mutate, isPending: false }) },
      rollHistory: { useQuery: () => ({ data: [], isLoading: false }) },
      createShareLink: { useMutation: () => ({ mutate, isPending: false }) },
      revokeShareLink: { useMutation: () => ({ mutate, isPending: false }) },
    },
    campaigns: { mine: { useQuery: () => ({ data: [] }) } },
    archetypes: {
      mine: { useQuery: () => ({ data: [], isLoading: false }) },
      create: { useMutation: () => ({ mutate, isPending: false }) },
      update: { useMutation: () => ({ mutate, isPending: false }) },
      remove: { useMutation: () => ({ mutate, isPending: false }) },
    },
  },
}));
vi.mock("wouter", () => ({ Link: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

import VampireSheet from "./VampireSheet";

afterEach(() => cleanup());

describe("inventário expansível autenticado", () => {
  it("expande, adiciona, edita e remove item, descartando rascunho ao trocar de ficha", async () => {
    const user = userEvent.setup();
    render(<VampireSheet />);

    const inventoryTrigger = screen.getByRole("button", { name: /inventário · 0 item/i });
    await user.click(inventoryTrigger);
    expect(screen.queryByRole("button", { name: /adicionar item/i })).toBeNull();
    await user.click(inventoryTrigger);

    await user.click(screen.getByRole("button", { name: /adicionar item/i }));
    const draftName = screen.getAllByLabelText("Nome").at(-1)!;
    await user.type(draftName, "Estojo ritual");
    await user.type(screen.getByLabelText("Descrição"), "Ampolas de vitae e lâminas cerimoniais.");
    await user.click(screen.getByRole("button", { name: /adicionar ao inventário/i }));
    expect(screen.getByText("Estojo ritual")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Editar Estojo ritual" }));
    const editName = screen.getAllByLabelText("Nome").at(-1)!;
    await user.clear(editName);
    await user.type(editName, "Estojo de sangue");
    await user.click(screen.getByRole("button", { name: /atualizar item/i }));
    expect(screen.getByText("Estojo de sangue")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Remover Estojo de sangue" }));
    expect(screen.queryByText("Estojo de sangue")).toBeNull();

    await user.click(screen.getByRole("button", { name: /adicionar item/i }));
    await user.type(screen.getAllByLabelText("Nome").at(-1)!, "Rascunho de Mara");
    expect(screen.getByText("Novo item")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Dante/i }));
    expect(screen.queryByText("Novo item")).toBeNull();
    expect(screen.queryByDisplayValue("Rascunho de Mara")).toBeNull();
  }, 10_000);
});
