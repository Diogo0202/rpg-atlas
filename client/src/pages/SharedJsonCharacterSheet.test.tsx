// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createCharacterJsonEnvelope, createCharacterShareUrl } from "@/lib/sheetJson";
import SharedJsonCharacterSheet from "./SharedJsonCharacterSheet";

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

afterEach(() => { cleanup(); window.history.replaceState({}, "", "/"); });

describe("SharedJsonCharacterSheet", () => {
  it("abre e resume uma ficha codificada na URL", () => {
    const payload = createCharacterJsonEnvelope({ systemId: "vampiro-v5", name: "Lívia Vesper", concept: "Investigadora", level: 6, tags: ["jogador"], sheet: { hunger: 2 } });
    const url = createCharacterShareUrl(payload, window.location.origin);
    window.history.replaceState({}, "", new URL(url).pathname + new URL(url).search);
    render(<SharedJsonCharacterSheet />);
    expect(screen.getByRole("heading", { name: "Lívia Vesper" })).not.toBeNull();
    expect(screen.getByText("Nível 6")).not.toBeNull();
    expect(screen.getByText("#jogador")).not.toBeNull();
  });

  it("informa quando o payload não pode ser lido", () => {
    window.history.replaceState({}, "", "/compartilhar/json?payload=quebrado");
    render(<SharedJsonCharacterSheet />);
    expect(screen.getByRole("heading", { name: "Link de ficha inválido" })).not.toBeNull();
  });
});
