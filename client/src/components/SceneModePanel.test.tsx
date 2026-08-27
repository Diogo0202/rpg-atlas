// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SceneModePanel } from "./SceneModePanel";

describe("SceneModePanel", () => {
  beforeEach(() => {
    cleanup();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:scene") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  });

  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

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

  it("aplica condições e efeitos ao foco, removendo o efeito ao expirar", () => {
    render(<SceneModePanel />);
    fireEvent.change(screen.getByRole("textbox", { name: "Nome da condição" }), { target: { value: "Ferido" } });
    fireEvent.click(screen.getByRole("button", { name: /^Aplicar$/ }));
    expect(screen.queryByText("Ferido")).not.toBeNull();

    fireEvent.change(screen.getByRole("textbox", { name: "Nome do efeito temporário" }), { target: { value: "Cobertura" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Duração do efeito temporário" }), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar efeito" }));
    expect(screen.queryByText("Cobertura")).not.toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: /Avançar turno/i })[0]);
    expect(screen.queryByText("Cobertura")).toBeNull();
    expect(screen.queryByText(/efeito\(s\) expirado\(s\): Cobertura/)).not.toBeNull();
    const expiryNotice = screen.getByRole("status");
    expect(expiryNotice.textContent).toContain("Efeito temporário expirado");
    expect(expiryNotice.className).toContain("scene-expiry-alert");
  });

  it("exporta o histórico com o estado da sessão", () => {
    render(<SceneModePanel />);
    fireEvent.click(screen.getByRole("button", { name: "Exportar histórico" }));
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/exportou o histórico completo da sessão/)).not.toBeNull();
  });
});
