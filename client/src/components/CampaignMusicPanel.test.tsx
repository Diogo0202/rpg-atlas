// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const createBriefMutate = vi.fn();
const retryList = vi.fn();
const musicState = vi.hoisted(() => ({ data: [] as Array<any>, isLoading: false, error: null as { message: string } | null }));
let briefShouldFail = false;
const generatedBrief = { title: "Passagem sob o sino", bpm: 72, durationSeconds: 120, atmosphere: "Melancolia mineral junto ao rio.", instrumentation: ["violoncelo", "percussão"], soundscape: "Água e sinos distantes.", arrangement: [{ fromSeconds: 0, toSeconds: 45, intensity: 2, description: "A água introduz o presságio." }, { fromSeconds: 45, toSeconds: 120, intensity: 6, description: "Os sinos elevam a tensão." }], prompt: "Instrumental somente, sem vocais. Crie uma faixa de 120 segundos a 72 BPM, em tom menor, com violoncelo e percussão discreta. Água e sinos distantes em produção cinematográfica. [0:00 - 0:45] Presságio. [0:45 - 2:00] Travessia." };
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ music: { list: { invalidate: vi.fn() } } }),
    campaigns: { sessions: { useQuery: () => ({ data: [{ id: 31, sequence: 4, title: "A ponte que não esquece" }], isLoading: false, error: null }) } },
    music: {
      list: { useQuery: () => ({ ...musicState, refetch: retryList }) },
      createBrief: { useMutation: (options: any) => ({ mutate: (input: any) => { createBriefMutate(input); if (briefShouldFail) options.onError({ message: "A IA não respondeu." }); else options.onSuccess({ brief: generatedBrief, campaignTitle: "A Coroa Partida", sessionTitle: "A ponte que não esquece" }); }, isPending: false }) },
      create: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      update: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      remove: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { CampaignMusicPanel } from "./CampaignMusicPanel";

afterEach(() => { cleanup(); createBriefMutate.mockReset(); retryList.mockReset(); musicState.data = []; musicState.isLoading = false; musicState.error = null; briefShouldFail = false; });

it("solicita um brief de IA com a cena e a sessão persistente selecionada", async () => {
  const user = userEvent.setup();
  render(<CampaignMusicPanel campaigns={[{ id: 12, title: "A Coroa Partida", memberRole: "narrator" }]} initialCampaignId={12} />);
  await user.selectOptions(screen.getByLabelText("Sessão da trilha"), "31");
  await user.type(screen.getByLabelText("Descrição da cena musical"), "O grupo atravessa a ponte e o sino desperta.");
  await user.click(screen.getByRole("button", { name: /gerar brief musical/i }));
  expect(createBriefMutate).toHaveBeenCalledWith(expect.objectContaining({ campaignId: 12, sessionId: 31, sceneType: "exploration", durationSeconds: 120 }));
  expect((screen.getByLabelText("Brief musical") as HTMLTextAreaElement).value).toContain("Instrumental somente, sem vocais.");
  expect((screen.getByLabelText("Título da referência musical") as HTMLInputElement).value).toBe("Passagem sob o sino");
});

it("mantém a edição das referências somente para narradores", () => {
  render(<CampaignMusicPanel campaigns={[{ id: 12, title: "A Coroa Partida", memberRole: "player" }]} initialCampaignId={12} />);
  expect(screen.getByText(/apenas narradores podem preparar ou editar/i)).toBeTruthy();
  expect(screen.queryByLabelText("Descrição da cena musical")).toBeNull();
});

it("informa falha no carregamento das trilhas e permite tentar novamente", async () => {
  const user = userEvent.setup();
  musicState.error = { message: "Arquivo indisponível." };
  render(<CampaignMusicPanel campaigns={[{ id: 12, title: "A Coroa Partida", memberRole: "narrator" }]} initialCampaignId={12} />);
  expect(screen.getByRole("alert").textContent).toContain("Não foi possível carregar as trilhas.");
  await user.click(screen.getByRole("button", { name: /tentar novamente/i }));
  expect(retryList).toHaveBeenCalledOnce();
});

it("informa falha da geração de brief e permite uma nova tentativa", async () => {
  const user = userEvent.setup();
  briefShouldFail = true;
  render(<CampaignMusicPanel campaigns={[{ id: 12, title: "A Coroa Partida", memberRole: "narrator" }]} initialCampaignId={12} />);
  await user.type(screen.getByLabelText("Descrição da cena musical"), "O grupo atravessa a ponte e o sino desperta.");
  await user.click(screen.getByRole("button", { name: /gerar brief musical/i }));
  expect(screen.getByRole("alert").textContent).toContain("A geração não foi concluída.");
  await user.click(screen.getByRole("button", { name: /tentar novamente/i }));
  expect(createBriefMutate).toHaveBeenCalledTimes(2);
});
