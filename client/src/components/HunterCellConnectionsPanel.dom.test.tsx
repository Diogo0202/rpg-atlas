// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { configureMutate, createMutate, invalidate, selectCellName, cellRecords } = vi.hoisted(() => ({ configureMutate: vi.fn(), createMutate: vi.fn(), invalidate: vi.fn(), selectCellName: vi.fn(), cellRecords: [{ id: 4, name: "Vigília da Ponte", description: "Sem trégua", campaignId: 8, campaign: { id: 8, title: "A Última Vigília" }, members: [], antagonists: [] }] as any[] }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ hunterCells: { mine: { invalidate } } }),
    hunterCells: {
      mine: { useQuery: () => ({ data: cellRecords, isLoading: false }) },
      create: { useMutation: () => ({ mutate: createMutate, isPending: false }) },
      configure: { useMutation: () => ({ mutate: configureMutate, isPending: false }) },
    },
    library: { mine: { useQuery: () => ({ data: [{ id: 13, name: "O Pastor", threatLevel: "major" }] }) } },
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { HunterCellConnectionsPanel } from "./HunterCellConnectionsPanel";

describe("mapa de vínculos de Caçador", () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it("conecta visualmente a célula, o integrante, a campanha e o antagonista selecionados", async () => {
    const user = userEvent.setup();
    render(<HunterCellConnectionsPanel hunters={[{ id: 21, name: "Mara", concept: "Paramédica", campaignId: null }]} campaigns={[{ id: 8, title: "A Última Vigília" }]} selectedHunterId={21} onSelectCellName={selectCellName} />);
    await user.click(screen.getByRole("checkbox", { name: /mara/i }));
    await user.click(screen.getByRole("checkbox", { name: /o pastor/i }));
    await user.click(screen.getByRole("button", { name: /preservar vínculos/i }));
    expect(configureMutate).toHaveBeenCalledWith({ cellId: 4, campaignId: 8, characterIds: [21], antagonistIds: [13] });
  });
});
