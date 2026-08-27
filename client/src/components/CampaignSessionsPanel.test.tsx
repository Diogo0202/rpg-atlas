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
      sessions: { useQuery: () => ({ isLoading: false, data: [{ id: 31, sequence: 1, title: "A ponte que não esquece", summary: "Travessia do Vau", status: "played", playedAt: null }, { id: 32, sequence: 2, title: "O farol apagado", summary: "O sino silenciou", status: "planned", playedAt: null }] }) },
      events: { useQuery: () => ({ isLoading: false, data: [] }) },
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
  expect(screen.getByText(/apenas narradores podem modificar suas sessões/i)).toBeTruthy();
  expect(screen.queryByLabelText("Título da sessão")).toBeNull();
});

it("filtra o diário por um registro de sessão específico", async () => {
  const user = userEvent.setup();
  render(<CampaignSessionsPanel campaigns={[{ id: 12, title: "A Coroa Partida", memberRole: "narrator" }]} initialCampaignId={12} />);
  await user.selectOptions(screen.getByLabelText("Filtrar registro de sessão"), "32");
  expect((screen.getByLabelText("Filtrar registro de sessão") as HTMLSelectElement).value).toBe("32");
  expect(screen.getByText("1 de 2 registro(s).")).toBeTruthy();
});
