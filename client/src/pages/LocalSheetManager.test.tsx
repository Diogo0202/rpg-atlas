// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadLocalSheet, saveLocalSheet } from "@/lib/localSheetVault";
import { LocalSheetManagerContent } from "./LocalSheetManager";

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("LocalSheetManagerContent", () => {
  it("renomeia e duplica uma ficha local", () => {
    saveLocalSheet("rpg-atlas-local-vampiro-v5-v1", { id: "v5-1", name: "Lívia", updatedAt: new Date().toISOString(), sheet: { name: "Lívia", concept: "Investigadora", sheet: {} } });
    render(<LocalSheetManagerContent />);

    fireEvent.click(screen.getByRole("button", { name: "Renomear Lívia" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Novo nome" }), { target: { value: "Lívia Vesper" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.queryByText("Lívia Vesper")).not.toBeNull();
    expect(loadLocalSheet<{ name: string; concept?: string; campaignId?: string; sheet: unknown }>("rpg-atlas-local-vampiro-v5-v1", "v5-1")?.sheet.name).toBe("Lívia Vesper");

    fireEvent.click(screen.getByRole("button", { name: "Duplicar Lívia Vesper" }));
    expect(screen.getAllByText("Lívia Vesper (cópia)").length).toBe(1);
  });

  it("exclui uma ficha local após confirmação", () => {
    saveLocalSheet("rpg-atlas-local-hunter-v1", { id: "hunter-1", name: "Mara", updatedAt: new Date().toISOString(), sheet: { name: "Mara", sheet: {} } });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<LocalSheetManagerContent />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir Mara" }));
    expect(screen.queryByText("Mara")).toBeNull();
    expect(screen.queryByText("O cofre está vazio.")).not.toBeNull();
  });

  it("oferece links para abrir cada sistema a partir do cofre", () => {
    saveLocalSheet("rpg-atlas-local-o-um-anel-v1", { id: "ring-1", name: "Eldar", updatedAt: new Date().toISOString(), sheet: { name: "Eldar", sheet: {} } });
    render(<LocalSheetManagerContent />);

    expect(screen.getAllByRole("link", { name: /O Um Anel/i }).some((link) => link.getAttribute("href") === "/ficha-um-anel")).toBe(true);
    expect(screen.getAllByRole("link", { name: /Abrir sistema/i }).some((link) => link.getAttribute("href") === "/ficha-um-anel")).toBe(true);
  });
});
