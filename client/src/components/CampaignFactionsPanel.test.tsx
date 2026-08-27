// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const createFactionMutate = vi.fn();
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ campaigns: { factions: { invalidate: vi.fn() } } }),
    campaigns: {
      factions: { useQuery: () => ({ isLoading: false, data: [] }) },
      createFaction: { useMutation: () => ({ mutate: createFactionMutate, isPending: false }) },
      setFactionTension: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { CampaignFactionsPanel } from "./CampaignFactionsPanel";

afterEach(() => cleanup());

it("permite ao narrador registrar uma facção e sua consequência", async () => {
  const user = userEvent.setup();
  render(<CampaignFactionsPanel campaigns={[{ id: 3, title: "A Coroa Partida", memberRole: "narrator" }]} initialCampaignId={3} />);
  await user.type(screen.getByLabelText("Nome da facção"), "Companhia do Sal Negro");
  await user.type(screen.getByLabelText("Objetivo da facção"), "Controlar o Vau");
  await user.type(screen.getByLabelText("Consequência de Ruptura"), "Fecha a ponte");
  await user.click(screen.getByRole("button", { name: /criar/i }));
  expect(createFactionMutate).toHaveBeenCalledWith({ campaignId: 3, name: "Companhia do Sal Negro", objective: "Controlar o Vau", maxTension: 6, ruptureConsequence: "Fecha a ponte" });
});

it("mantém os relógios em leitura para jogadores", () => {
  render(<CampaignFactionsPanel campaigns={[{ id: 4, title: "O Sino Afogado", memberRole: "player" }]} initialCampaignId={4} />);
  expect(screen.getByText(/apenas narradores podem criar facções/i)).toBeTruthy();
  expect(screen.queryByLabelText("Nome da facção")).toBeNull();
});
