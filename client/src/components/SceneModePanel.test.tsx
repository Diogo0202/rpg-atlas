// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SceneModePanel } from "./SceneModePanel";

describe("SceneModePanel", () => {
  it("registra uma rolagem no histórico e permite trocar o foco", () => {
    render(<SceneModePanel />);
    expect(screen.queryByText("O Sino de Namar")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Rolar para Lívia Vesper/i }));
    expect(screen.queryByText(/agora · Lívia Vesper/)).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Vigia do Sino/i }));
    expect(screen.getByRole("button", { name: /Rolar para Vigia do Sino/i })).not.toBeNull();
  });

  it("alterna o estado da cena e aceita ações rápidas", () => {
    render(<SceneModePanel />);
    fireEvent.click(screen.getAllByRole("button", { name: /Pausar/i })[0]);
    expect(screen.queryByText("Pausada")).not.toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: /Registrar evento/i })[0]);
    expect(screen.queryByText(/registrou uma nota de cena/)).not.toBeNull();
  });
});
