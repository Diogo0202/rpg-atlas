// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const createSessionMutate = vi.fn();
const updateSessionMutate = vi.fn();
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ campaigns: { sessions: { invalidate: vi.fn() } } }),
    campaigns: {
      sessions: { useQuery: () => ({ isLoading: false, data: [] }) },
      createSession: { useMutation: () => ({ mutate: createSessionMutate, isPending: false }) },
      updateSession: { useMutation: () => ({ mutate: updateSessionMutate, isPending: false }) },
    },
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { CampaignSessionsPanel } from "./CampaignSessionsPanel";

afterEach(() => cleanup());

it("permite ao narrador registrar uma sessão com diário", async () => {
  const user = userEvent.setup();
  render(<CampaignSessionsPanel campaigns={[{ id: 12, title: "A Coroa Partida", memberRole: "narrator" }]} initialCampaignId={12} />);
  await user.type(screen.getByLabelText("Título da sessão"), "A ponte que não esquece");
  await user.type(screen.getByLabelText("Resumo da sessão"), "O grupo atravessou o Vau e encontrou o sino.");
  await user.click(screen.getByRole("button", { name: /registrar sessão/i }));
  expect(createSessionMutate).toHaveBeenCalledWith({ campaignId: 12, title: "A ponte que não esquece", summary: "O grupo atravessou o Vau e encontrou o sino." });
});

it("mantém o diário disponível somente para leitura aos jogadores", () => {
  render(<CampaignSessionsPanel campaigns={[{ id: 13, title: "O Sino Afogado", memberRole: "player" }]} initialCampaignId={13} />);
  expect(screen.getByText(/o diário só pode ser modificado por um narrador/i)).toBeTruthy();
  expect(screen.queryByLabelText("Título da sessão")).toBeNull();
});
