// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: 1, name: "Diogo" } }) }));
const eventState = vi.hoisted(() => ({ data: [{ id: 44, sessionId: 31, title: "O sino responde", description: "A cidade escuta.", status: "consequence", factions: [{ id: 2, name: "Conselho dos Marcos" }] }], isLoading: false, error: null as { message: string } | null, refetch: vi.fn() }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ campaigns: { mine: { invalidate: vi.fn() } } }),
    campaigns: {
      mine: { useQuery: () => ({ data: [{ id: 12, title: "A Coroa Partida", description: "Véspera do Vau", systemId: "vampiro-v5" }], isLoading: false, error: null }) },
      create: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      sessions: { useQuery: () => ({ data: [{ id: 31, sequence: 4, title: "A ponte que não esquece", summary: "O grupo ouviu o sino.", status: "played", playedAt: null }], isLoading: false, error: null, refetch: vi.fn() }) },
      events: { useQuery: () => eventState },
    },
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import CampaignWorkbench from "./CampaignWorkbench";

afterEach(() => { cleanup(); window.localStorage.clear(); eventState.data = [{ id: 44, sessionId: 31, title: "O sino responde", description: "A cidade escuta.", status: "consequence", factions: [{ id: 2, name: "Conselho dos Marcos" }] }]; eventState.isLoading = false; eventState.error = null; eventState.refetch.mockReset(); });

it("usa a sessão persistente e os eventos vinculados no Workbench", () => {
  window.localStorage.setItem("rpg-atlas-active-campaign-v1", JSON.stringify("cloud-12"));
  render(<CampaignWorkbench />);
  expect(screen.getByText("Sessão persistente em foco")).toBeTruthy();
  expect((screen.getByLabelText("Sessão persistente em foco") as HTMLSelectElement).value).toBe("31");
  expect(screen.getAllByText("#4 · A ponte que não esquece").length).toBeGreaterThan(1);
  expect(screen.getByText(/o sino responde/i)).toBeTruthy();
  expect(screen.getByText(/1 evento\(s\) vinculado\(s\)/i)).toBeTruthy();
});

it("informa a falha de eventos e permite nova tentativa", async () => {
  const user = userEvent.setup();
  window.localStorage.setItem("rpg-atlas-active-campaign-v1", JSON.stringify("cloud-12"));
  eventState.data = [];
  eventState.error = { message: "Conexão interrompida." };
  render(<CampaignWorkbench />);
  expect(screen.getByRole("alert").textContent).toContain("Não foi possível carregar os eventos vinculados.");
  await user.click(screen.getByRole("button", { name: /tentar novamente/i }));
  expect(eventState.refetch).toHaveBeenCalledOnce();
});
