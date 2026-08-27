// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const createEventMutate = vi.fn();
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ campaigns: { events: { invalidate: vi.fn() } } }),
    campaigns: {
      events: { useQuery: () => ({ isLoading: false, data: [] }) },
      sessions: { useQuery: () => ({ data: [] }) },
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
  await user.click(screen.getByRole("button", { name: /registrar evento/i }));
  expect(createEventMutate).toHaveBeenCalledWith(expect.objectContaining({ campaignId: 20, title: "O sino voltou a soar", description: "A cidade ouviu o chamado.", status: "active", sessionId: null }));
});

it("mantém a linha do tempo somente em leitura para jogadores", () => {
  render(<CampaignTimelinePanel campaigns={[{ id: 21, title: "O Sino Afogado", memberRole: "player" }]} initialCampaignId={21} />);
  expect(screen.getByText(/apenas narradores criam e atualizam registros/i)).toBeTruthy();
  expect(screen.queryByLabelText("Título do evento")).toBeNull();
});
