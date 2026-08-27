// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.stubGlobal("ResizeObserver", class {
  observe() {}
  unobserve() {}
  disconnect() {}
});

const createMapMutate = vi.fn();
const updateMarkerMutate = vi.fn();
const generateImageMutate = vi.fn();
const mapsState = vi.hoisted(() => ({ data: [] as Array<any> }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ maps: { list: { invalidate: vi.fn() } } }),
    maps: {
      list: { useQuery: () => ({ data: mapsState.data, isLoading: false, error: null, refetch: vi.fn() }) },
      create: { useMutation: () => ({ mutate: createMapMutate, isPending: false }) },
      update: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      uploadImage: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      generateImage: { useMutation: () => ({ mutate: generateImageMutate, isPending: false }) },
      createMarker: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      updateMarker: { useMutation: () => ({ mutate: updateMarkerMutate, isPending: false }) },
      moveMarker: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      removeMarker: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { CampaignMapTabletop } from "./CampaignMapTabletop";

afterEach(() => {
  cleanup();
  createMapMutate.mockReset();
  updateMarkerMutate.mockReset();
  generateImageMutate.mockReset();
  mapsState.data = [];
});

it("permite ao narrador criar o primeiro mapa persistente da campanha", async () => {
  const user = userEvent.setup();
  render(<CampaignMapTabletop campaigns={[{ id: 12, title: "A Coroa Partida", memberRole: "narrator" }]} initialCampaignId={12} />);
  await user.type(screen.getByLabelText("Primeiro mapa da campanha"), "Ruínas sob a chuva");
  await user.click(screen.getByRole("button", { name: /criar mapa/i }));
  expect(createMapMutate).toHaveBeenCalledWith({ campaignId: 12, title: "Ruínas sob a chuva" });
});

it("mantém a criação da mesa em modo de leitura para jogadores", () => {
  render(<CampaignMapTabletop campaigns={[{ id: 13, title: "O Sino Afogado", memberRole: "player" }]} initialCampaignId={13} />);
  expect(screen.getByText(/somente o narrador pode abrir uma mesa nova/i)).toBeTruthy();
  expect(screen.getByLabelText("Primeiro mapa da campanha")).toHaveProperty("disabled", true);
});

it("exibe controles e marcadores de um mapa disponível à campanha", () => {
  mapsState.data = [{ id: 17, title: "Ruínas sob a chuva", imageUrl: null, gridEnabled: 1, gridSize: 50, markers: [{ id: 28, label: "Vigia do portão", description: "Ameaça visível.", markerType: "threat", color: "#b55b32", positionX: 3750, positionY: 4600 }] }];
  render(<CampaignMapTabletop campaigns={[{ id: 12, title: "A Coroa Partida", memberRole: "narrator" }]} initialCampaignId={12} />);
  expect(screen.getByRole("button", { name: "Aumentar zoom" })).toBeTruthy();
  expect(screen.getByLabelText("Ameaça: Vigia do portão")).toBeTruthy();
  expect(screen.getByText("Ameaça visível.")).toBeTruthy();
  expect(screen.getByRole("button", { name: /adicionar mapa/i })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Editar Vigia do portão" })).toBeTruthy();
});

it("permite ao narrador editar os metadados de um marcador persistente", async () => {
  const user = userEvent.setup();
  mapsState.data = [{ id: 17, title: "Ruínas sob a chuva", imageUrl: null, gridEnabled: 1, gridSize: 50, markers: [{ id: 28, label: "Vigia do portão", description: "Ameaça visível.", markerType: "threat", color: "#b55b32", positionX: 3750, positionY: 4600 }] }];
  render(<CampaignMapTabletop campaigns={[{ id: 12, title: "A Coroa Partida", memberRole: "narrator" }]} initialCampaignId={12} />);
  await user.click(screen.getByRole("button", { name: "Editar Vigia do portão" }));
  await user.clear(screen.getByLabelText("Identificação"));
  await user.type(screen.getByLabelText("Identificação"), "Vigia ferido");
  await user.click(screen.getByRole("button", { name: /salvar marcador/i }));
  expect(updateMarkerMutate).toHaveBeenCalledWith({ campaignId: 12, mapId: 17, markerId: 28, label: "Vigia ferido", description: "Ameaça visível.", markerType: "threat", color: "#b55b32" });
});

it("permite ao narrador gerar uma imagem procedural para o mapa selecionado", async () => {
  const user = userEvent.setup();
  mapsState.data = [{ id: 17, title: "Ruínas sob a chuva", imageUrl: null, gridEnabled: 1, gridSize: 50, markers: [] }];
  render(<CampaignMapTabletop campaigns={[{ id: 12, title: "A Coroa Partida", memberRole: "narrator" }]} initialCampaignId={12} />);
  await user.type(screen.getByLabelText("Direção do terreno"), "Ruínas costeiras alagadas com névoa baixa e passarelas de madeira.");
  await user.selectOptions(screen.getByLabelText("Proporção"), "4:3");
  await user.click(screen.getByRole("button", { name: /gerar imagem do mapa/i }));
  expect(generateImageMutate).toHaveBeenCalledWith({ campaignId: 12, mapId: 17, creativeDirection: "Ruínas costeiras alagadas com névoa baixa e passarelas de madeira.", aspectRatio: "4:3" });
});

it("informa que a imagem atual foi criada pela rota sincronizada", () => {
  mapsState.data = [{ id: 17, title: "Ruínas sob a chuva", imageUrl: "/manus-storage/mapa.png", imageProvider: "gemini", gridEnabled: 1, gridSize: 50, markers: [] }];
  render(<CampaignMapTabletop campaigns={[{ id: 12, title: "A Coroa Partida", memberRole: "narrator" }]} initialCampaignId={12} />);
  expect(screen.getByText(/imagem atual gerada via gemini/i)).toBeTruthy();
});
