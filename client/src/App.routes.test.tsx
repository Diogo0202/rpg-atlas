// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App, { APP_ROUTES } from "./App";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({ matches: false, media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() })),
});

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ loading: false, user: { id: 1, name: "Cronista" }, isAuthenticated: true }),
}));

afterEach(cleanup);
beforeEach(() => {
  window.history.pushState({}, "", "/");
});

describe("rotas da interface principal", () => {
  it("renderiza o Modo de Cena ao acessar sua rota", () => {
    window.history.pushState({}, "", APP_ROUTES.sceneMode);
    render(<App />);
    expect(screen.queryByText("O Sino de Namar")).not.toBeNull();
    expect(screen.queryByText("Painel de rolagem")).not.toBeNull();
  });

  it("renderiza o Cofre Local ao acessar sua rota", () => {
    window.history.pushState({}, "", APP_ROUTES.localVault);
    render(<App />);
    expect(screen.queryByText("Biblioteca do navegador")).not.toBeNull();
    expect(screen.queryByText("O cofre está vazio.")).not.toBeNull();
  });
});
