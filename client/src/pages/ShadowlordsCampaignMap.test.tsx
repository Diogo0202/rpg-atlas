// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ShadowlordsCampaignMap from "./ShadowlordsCampaignMap";

vi.mock("@/lib/trpc", () => {
  const query = () => ({ data: [], isLoading: false, error: null, refetch: vi.fn() });
  const mutation = () => ({ isPending: false, mutate: vi.fn(), mutateAsync: vi.fn(async () => ({ id: 1 })) });
  return {
    trpc: {
      campaigns: { mine: { useQuery: query } },
      campaignAtlas: {
        get: { useQuery: () => ({ data: undefined, isLoading: false, error: null, refetch: vi.fn() }) },
        saveState: { useMutation: mutation },
        saveEncounter: { useMutation: mutation },
        removeEncounter: { useMutation: mutation },
      },
    },
  };
});

describe("ShadowlordsCampaignMap", () => {
  afterEach(cleanup);

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("abre no marco de Arys e revela o estado inicial da campanha", () => {
    render(<ShadowlordsCampaignMap />);

    expect(screen.getByRole("heading", { name: "Arys" })).toBeTruthy();
    expect(screen.getByLabelText("Tensão 0 de 6")).toBeTruthy();
    expect(screen.getByText("Nenhum encontro catalogado")).toBeTruthy();
  });

  it("seleciona a Estrada da Colina e mostra o encontro de Chuva de Sangue", () => {
    render(<ShadowlordsCampaignMap />);

    fireEvent.click(screen.getByRole("button", { name: "Consultar Estrada da Colina" }));

    expect(screen.getByRole("heading", { name: "Estrada da Colina" })).toBeTruthy();
    expect(screen.getAllByText("A Estrada que Sangra").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Chuva de Sangue/)).toBeTruthy();
    expect(screen.getByText("Dificuldade 13")).toBeTruthy();
  });

  it("avança o relógio, resolve um encontro e persiste o estado", () => {
    render(<ShadowlordsCampaignMap />);

    fireEvent.click(screen.getByRole("button", { name: "Avançar o relógio" }));
    expect(screen.getByLabelText("Tensão 1 de 6")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Consultar Floresta do Miasma" }));
    fireEvent.click(screen.getByRole("button", { name: "Marcar encontro resolvido" }));

    expect(screen.getByText(/Miasma do Abismo/)).toBeTruthy();
    expect(window.localStorage.getItem("rpg-atlas-shadowlords-map-state")).toContain('"tension":1');
    expect(window.localStorage.getItem("rpg-atlas-shadowlords-map-state")).toContain("miasma");
  });

  it("reinicia o relógio e os encontros resolvidos", () => {
    render(<ShadowlordsCampaignMap />);

    fireEvent.click(screen.getByRole("button", { name: "Avançar o relógio" }));
    fireEvent.click(screen.getByRole("button", { name: "Reiniciar" }));

    expect(screen.getByLabelText("Tensão 0 de 6")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Arys" })).toBeTruthy();
  });

  it("adiciona uma região customizada pelo editor e a seleciona", () => {
    render(<ShadowlordsCampaignMap />);

    fireEvent.change(screen.getByLabelText("Nome da nova região"), { target: { value: "Ponte dos Ossos" } });
    fireEvent.change(screen.getByLabelText("Subtítulo da nova região"), { target: { value: "Passagem instável" } });
    fireEvent.change(screen.getByLabelText("Detalhe da nova região"), { target: { value: "A ponte exige uma promessa antes de aceitar peso." } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar região" }));

    expect(screen.getByRole("heading", { name: "Ponte dos Ossos" })).toBeTruthy();
    expect(screen.getByText("Passagem instável")).toBeTruthy();
    expect(window.localStorage.getItem("rpg-atlas-shadowlords-map-state")).toContain("Ponte dos Ossos");
  });

  it("registra uma rota customizada entre dois marcos e exibe seu rótulo", () => {
    render(<ShadowlordsCampaignMap />);

    fireEvent.change(screen.getByLabelText("Nome da nova rota"), { target: { value: "Atalho pelo sal" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar rota" }));

    expect(screen.getByText("Atalho pelo sal")).toBeTruthy();
    expect(window.localStorage.getItem("rpg-atlas-shadowlords-map-state")).toContain("Atalho pelo sal");
  });
});
