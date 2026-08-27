// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { createMutate, updateMutate, recordRollMutate, invalidate, toastSuccess, toastError, hunterRecords } = vi.hoisted(() => ({
  createMutate: vi.fn(), updateMutate: vi.fn(), recordRollMutate: vi.fn(), invalidate: vi.fn(), toastSuccess: vi.fn(), toastError: vi.fn(), hunterRecords: [] as any[],
}));

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/components/SheetSystemSwitcher", () => ({ SheetSystemSwitcher: () => <div>Alternar sistema</div> }));
vi.mock("@/components/CustomArchetypePanel", () => ({ CustomArchetypePanel: () => <div>Arquétipos próprios</div> }));
vi.mock("@/components/HunterCellConnectionsPanel", () => ({ HunterCellConnectionsPanel: () => <div>Mapa de vínculos</div> }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ characters: { mine: { invalidate } } }),
    characters: {
      mine: { useQuery: () => ({ data: hunterRecords, isLoading: false }) },
      create: { useMutation: () => ({ mutate: createMutate, isPending: false }) },
      update: { useMutation: () => ({ mutate: updateMutate, isPending: false }) },
      recordRoll: { useMutation: () => ({ mutate: recordRollMutate, isPending: false }) },
    },
    campaigns: { mine: { useQuery: () => ({ data: [] }) } },
  },
}));
vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: toastError } }));

import HunterSheet from "./HunterSheet";

describe("módulo de Caçador", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    hunterRecords.splice(0);
  });

  it("importa uma ficha JSON e a preserva usando o contrato de personagens", async () => {
    const user = userEvent.setup();
    class MockFileReader {
      result: string | null = JSON.stringify({ format: "rpg-atlas-hunter-character-v1", character: { name: "Mara Duarte", concept: "Paramédica", sheetData: { creed: "marcial", attributes: { forca: 4 }, skills: { investigacao: 2 }, desperation: 1 } } });
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readAsText() { this.onload?.(); }
    }
    vi.stubGlobal("FileReader", MockFileReader);
    render(<HunterSheet />);
    await user.upload(screen.getByLabelText("Importar ficha de Caçador JSON"), new File(["{}"], "mara.json", { type: "application/json" }));
    expect((screen.getByLabelText("Nome") as HTMLInputElement).value).toBe("Mara Duarte");
    expect((screen.getByLabelText("Conceito") as HTMLInputElement).value).toBe("Paramédica");
    await user.click(screen.getByRole("button", { name: /preservar caçador/i }));
    expect(createMutate).toHaveBeenCalledWith(expect.objectContaining({ systemId: "cacador-a-vinganca", name: "Mara Duarte", concept: "Paramédica", sheetData: expect.objectContaining({ creed: "marcial", desperation: 1, attributes: expect.objectContaining({ forca: 4 }) }) }));
  });

  it("exporta a ficha no formato compartilhável e registra uma rolagem de Desespero", async () => {
    hunterRecords.push({ id: 21, systemId: "cacador-a-vinganca", name: "Mara", concept: "Paramédica", campaignId: null, sheetData: { attributes: { forca: 3 }, skills: { atletismo: 2 }, desperation: 1 } });
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => "blob:caçador");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    render(<HunterSheet />);
    await user.click(screen.getByRole("button", { name: /mara/i }));
    await user.click(screen.getByRole("button", { name: /exportar json/i }));
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(toastSuccess).toHaveBeenCalledWith("Ficha de Caçador exportada em JSON.");
    await user.click(screen.getByRole("button", { name: /^rolar$/i }));
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    expect(recordRollMutate).toHaveBeenCalledWith(expect.objectContaining({ systemId: "cacador-a-vinganca", characterId: 21, resultData: expect.objectContaining({ desperationDice: 1 }) }));
    anchorClick.mockRestore();
  }, 5_000);
});
