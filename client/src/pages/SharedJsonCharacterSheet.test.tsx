// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createCharacterJsonEnvelope, createCharacterShareUrl } from "@/lib/sheetJson";
import SharedJsonCharacterSheet from "./SharedJsonCharacterSheet";

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

afterEach(() => { cleanup(); window.history.replaceState({}, "", "/"); });

describe("SharedJsonCharacterSheet", () => {
  it("abre um modal de pré-visualização e importa uma cópia local após confirmação", async () => {
    const payload = createCharacterJsonEnvelope({ systemId: "vampiro-v5", name: "Lívia Vesper", concept: "Investigadora", level: 6, tags: ["jogador"], sheet: { hunger: 2 } });
    const url = createCharacterShareUrl(payload, window.location.origin);
    window.history.replaceState({}, "", new URL(url).pathname + new URL(url).search);
    render(<SharedJsonCharacterSheet />);
    expect(screen.getByRole("heading", { name: "Lívia Vesper" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Antes de importar" })).not.toBeNull();
    expect(screen.getByText("Investigadora")).not.toBeNull();
    await userEvent.setup().click(screen.getByRole("button", { name: /importar cópia local/i }));
    expect(screen.queryByRole("heading", { name: "Antes de importar" })).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("Lívia Vesper");
    expect(window.localStorage.getItem("rpg-atlas-local-vampiro-v5-v1")).toContain("Lívia Vesper");
  });

  it("informa quando o payload não pode ser lido", () => {
    window.history.replaceState({}, "", "/compartilhar/json?payload=quebrado");
    render(<SharedJsonCharacterSheet />);
    expect(screen.getByRole("heading", { name: "Link de ficha inválido" })).not.toBeNull();
  });
});
