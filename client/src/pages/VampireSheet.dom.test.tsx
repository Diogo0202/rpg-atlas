import { cleanup, render, screen, waitFor } from "@testing-library/react";
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
      shareLinkStatus: { useQuery: () => ({ data: null, isLoading: false, refetch: vi.fn() }) },
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
vi.mock("@/lib/v5Pdf", () => ({ createV5PdfFile: vi.fn(() => new File(["pdf"], "v5.pdf", { type: "application/pdf" })), downloadV5Pdf: vi.fn(), shareV5Pdf: vi.fn(), createV5MailtoUrl: vi.fn(() => "mailto:test@example.com") }));

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
  }, 25_000);
});


describe("VampireSheet — folha principal V5", () => {
  it("edita origem, fome e capacidades na composição principal", async () => {
    const user = userEvent.setup();
    render(<VampireSheet />);
    expect(screen.getByRole("region", { name: "Folha principal de criação Vampiro V5" })).not.toBeNull();
    expect(document.querySelector('[data-system-theme="vampire"]')).not.toBeNull();
    expect(screen.getAllByRole("region", { name: /Retrato/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /escolher imagem/i }).length).toBeGreaterThan(0);
    await user.selectOptions(screen.getByLabelText("Clã na folha principal"), "brujah");
    await user.clear(screen.getByLabelText("Fome na folha principal"));
    await user.type(screen.getByLabelText("Fome na folha principal"), "3");
    expect(screen.getAllByText("Brujah").length).toBeGreaterThan(0);
    expect((screen.getByLabelText("Fome na folha principal") as HTMLInputElement).value).toBe("3");
    expect(screen.getAllByText("Disciplinas").length).toBeGreaterThan(0);
    const primarySheet = screen.getByRole("region", { name: "Folha principal de criação Vampiro V5" });
    expect(primarySheet.textContent).toContain("Vitalidade");
    expect(primarySheet.textContent).toContain("Força de Vontade");
    expect(primarySheet.textContent).not.toContain("NaN");
    expect(screen.getByText(/Cofre local/i)).not.toBeNull();
  });

  it("mantém exportação e compartilhamento disponíveis junto do cofre local", async () => {
    const user = userEvent.setup();
    render(<VampireSheet />);
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:sheet") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    expect(screen.getByRole("button", { name: /exportar para impressão/i })).not.toBeNull();
    expect(screen.getByRole("button", { name: /compartilhar pdf/i })).not.toBeNull();
    expect(screen.getByRole("button", { name: /salvar localmente/i })).not.toBeNull();
    await user.type(screen.getByLabelText("Nome do personagem"), "Mara");
    await user.click(screen.getAllByRole("button").find((button) => button.textContent?.includes("Exportar ficha atual sem salvar"))!);
    await user.click(screen.getAllByRole("button").find((button) => button.textContent?.includes("Copiar link JSON"))!);
    await waitFor(() => expect(screen.getByText("Link JSON pronto")).not.toBeNull());
    await user.click(screen.getByRole("button", { name: /salvar localmente/i }));
    expect(localStorage.length).toBeGreaterThan(0);
    const savedCharacterButtons = screen.getAllByRole("button").filter((button) => button.textContent?.trim() === "Mara");
    await user.click(savedCharacterButtons[savedCharacterButtons.length - 1]);
    expect((screen.getByLabelText("Nome do personagem") as HTMLInputElement).value).toBe("Mara");
  });
});
