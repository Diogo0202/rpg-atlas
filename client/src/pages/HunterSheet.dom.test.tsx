// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { createMutate, updateMutate, invalidate, toastSuccess, toastError } = vi.hoisted(() => ({
  createMutate: vi.fn(), updateMutate: vi.fn(), invalidate: vi.fn(), toastSuccess: vi.fn(), toastError: vi.fn(),
}));

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/components/SheetSystemSwitcher", () => ({ SheetSystemSwitcher: () => <div>Alternar sistema</div> }));
vi.mock("@/components/CustomArchetypePanel", () => ({ CustomArchetypePanel: () => <div>Arquétipos próprios</div> }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ characters: { mine: { invalidate } } }),
    characters: {
      mine: { useQuery: () => ({ data: [], isLoading: false }) },
      create: { useMutation: () => ({ mutate: createMutate, isPending: false }) },
      update: { useMutation: () => ({ mutate: updateMutate, isPending: false }) },
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
});
