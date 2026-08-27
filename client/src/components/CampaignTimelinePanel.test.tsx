// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const createEventMutate = vi.fn();
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ campaigns: { events: { invalidate: vi.fn() }, factions: { invalidate: vi.fn() } } }),
    campaigns: {
      events: { useQuery: () => ({ isLoading: false, data: [{ id: 70, title: "O sino volta", description: "A Ordem se moveu.", status: "active", occurredAt: new Date("2026-08-27T12:00:00.000Z"), sessionId: null, factions: [{ id: 5, name: "Ordem da Cinza", tension: 2, maxTension: 6 }] }] }) },
      sessions: { useQuery: () => ({ data: [] }) },
      factions: { useQuery: () => ({ data: [{ id: 5, name: "Ordem da Cinza", tension: 2, maxTension: 6 }] }) },
      createEvent: { useMutation: () => ({ mutate: createEventMutate, isPending: false }) },
      updateEvent: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { CampaignTimelinePanel } from "./CampaignTimelinePanel";

afterEach(() => cleanup());

it("permite ao narrador registrar um evento na linha do tempo", async () => {
  const user = userEvent.setup();
  render(<CampaignTimelinePanel campaigns={[{ id: 20, title: "A Coroa Partida", memberRole: "narrator" }]} initialCampaignId={20} />);
  await user.type(screen.getByLabelText("Título do evento"), "O sino voltou a soar");
  await user.type(screen.getByLabelText("Descrição do evento"), "A cidade ouviu o chamado.");
  await user.click(screen.getByLabelText("Vincular facção Ordem da Cinza"));
  await user.click(screen.getByRole("button", { name: /registrar evento/i }));
  expect(createEventMutate).toHaveBeenCalledWith(expect.objectContaining({ campaignId: 20, title: "O sino voltou a soar", description: "A cidade ouviu o chamado.", status: "active", sessionId: null, factionIds: [5] }));
});

it("permite consultar eventos pela facção vinculada", async () => {
  const user = userEvent.setup();
  render(<CampaignTimelinePanel campaigns={[{ id: 20, title: "A Coroa Partida", memberRole: "narrator" }]} initialCampaignId={20} />);
  await user.type(screen.getByLabelText("Pesquisar eventos"), "Ordem da Cinza");
  expect(screen.getByText("O sino volta")).toBeTruthy();
});

it("mantém a linha do tempo somente em leitura para jogadores", () => {
  render(<CampaignTimelinePanel campaigns={[{ id: 21, title: "O Sino Afogado", memberRole: "player" }]} initialCampaignId={21} />);
  expect(screen.getByText(/apenas narradores criam e atualizam registros/i)).toBeTruthy();
  expect(screen.queryByLabelText("Título do evento")).toBeNull();
});
