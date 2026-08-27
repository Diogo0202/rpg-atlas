// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadLocalSheet, saveLocalSheet } from "@/lib/localSheetVault";
import { LocalSheetManagerContent } from "./LocalSheetManager";

vi.mock("qrcode", () => ({ default: { toDataURL: vi.fn(async () => "data:image/png;base64,manager-qr") } }));

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:vault") });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
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


describe("LocalSheetManagerContent — busca e backup", () => {
  it("filtra por nome, sistema ou conceito", () => {
    saveLocalSheet("rpg-atlas-local-vampiro-v5-v1", { id: "v5-1", name: "Lívia", updatedAt: "2026-08-27T10:00:00.000Z", sheet: { name: "Lívia", concept: "Investigadora" } });
    saveLocalSheet("rpg-atlas-local-hunter-v1", { id: "hunter-1", name: "Mara", updatedAt: "2026-08-27T11:00:00.000Z", sheet: { name: "Mara", concept: "Vigilante" } });
    render(<LocalSheetManagerContent />);

    fireEvent.change(screen.getByRole("textbox", { name: "Pesquisar fichas locais" }), { target: { value: "vigilante" } });
    expect(screen.queryByText("Mara")).not.toBeNull();
    expect(screen.queryByText("Lívia")).toBeNull();
    expect(screen.getByText("1 de 2")).not.toBeNull();
  });

  it("ordena por nome e oferece exportação do backup", () => {
    saveLocalSheet("rpg-atlas-local-vampiro-v5-v1", { id: "v5-1", name: "Ari", createdAt: "2026-08-27T10:00:00.000Z", updatedAt: "2026-08-27T10:00:00.000Z", sheet: { name: "Ari" } });
    saveLocalSheet("rpg-atlas-local-hunter-v1", { id: "hunter-1", name: "Zara", createdAt: "2026-08-27T11:00:00.000Z", updatedAt: "2026-08-27T11:00:00.000Z", sheet: { name: "Zara" } });
    render(<LocalSheetManagerContent />);

    fireEvent.change(screen.getByRole("combobox", { name: "Ordenar fichas locais" }), { target: { value: "name-asc" } });
    expect(screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual(["Ari", "Zara"]);
    fireEvent.change(screen.getByRole("combobox", { name: "Ordenar fichas locais" }), { target: { value: "system-asc" } });
    expect(screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual(["Zara", "Ari"]);
    fireEvent.click(screen.getByRole("button", { name: "Exportar backup" }));
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it("importa uma ficha JSON sem sobrescrever o registro local existente", async () => {
    saveLocalSheet("rpg-atlas-local-vampiro-v5-v1", { id: "existing", name: "Lívia", updatedAt: "2026-08-27T10:00:00.000Z", sheet: { name: "Lívia" } });
    render(<LocalSheetManagerContent />);
    const file = new File([JSON.stringify({ format: "rpg-atlas-character-v1", version: 1, systemId: "vampiro-v5", character: { name: "Lívia", concept: "Cópia importada", createdAt: "2026-08-20T10:00:00.000Z", sheet: { hunger: 2 } } })], "livia.json", { type: "application/json" });
    fireEvent.change(screen.getByLabelText("Importar ficha ou backup JSON para o cofre"), { target: { files: [file] } });
    await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/importada\(s\) sem substituir/));
    expect(screen.getAllByRole("heading", { level: 3 }).filter((heading) => heading.textContent === "Lívia")).toHaveLength(2);
  });

  it("mostra feedback ao rejeitar um JSON inválido", async () => {
    render(<LocalSheetManagerContent />);
    const file = new File([JSON.stringify({ format: "arquivo-desconhecido" })], "invalido.json", { type: "application/json" });
    fireEvent.change(screen.getByLabelText("Importar ficha ou backup JSON para o cofre"), { target: { files: [file] } });
    await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/não foi reconhecido/));
  });
});

it("filtra por nível e tag personalizada e edita a organização da ficha", () => {
  saveLocalSheet("rpg-atlas-local-vampiro-v5-v1", { id: "v5-1", name: "Lívia", level: 5, tags: ["investigação", "jogador"], updatedAt: "2026-08-27T10:00:00.000Z", sheet: { name: "Lívia", concept: "Investigadora" } });
  saveLocalSheet("rpg-atlas-local-hunter-v1", { id: "hunter-1", name: "Mara", level: 7, tags: ["ameaça"], updatedAt: "2026-08-27T11:00:00.000Z", sheet: { name: "Mara", concept: "Vigilante" } });
  render(<LocalSheetManagerContent />);

  fireEvent.change(screen.getByRole("combobox", { name: "Filtrar fichas por nível" }), { target: { value: "5" } });
  expect(screen.queryByText("Lívia")).not.toBeNull();
  expect(screen.queryByText("Mara")).toBeNull();
  fireEvent.change(screen.getByRole("combobox", { name: "Filtrar fichas por tag" }), { target: { value: "investigação" } });
  expect(screen.getByText("1 de 2")).not.toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Editar nível e tags de Lívia" }));
  fireEvent.change(screen.getByRole("spinbutton", { name: "Nível de Lívia" }), { target: { value: "6" } });
  fireEvent.change(screen.getByRole("textbox", { name: "Tags de Lívia" }), { target: { value: "investigação, protagonista" } });
  fireEvent.click(screen.getAllByRole("button", { name: "Salvar" }).at(-1)!);
  expect(screen.getByText("Nível 6")).not.toBeNull();
  expect(screen.getByText(/protagonista/)).not.toBeNull();
});

it("compartilha diretamente uma ficha do cofre por link JSON e QR code", async () => {
  saveLocalSheet("rpg-atlas-local-vampiro-v5-v1", { id: "v5-share", name: "Lívia", level: 5, tags: ["jogador"], updatedAt: new Date().toISOString(), sheet: { name: "Lívia", concept: "Investigadora", sheet: { hunger: 2 } } });
  Object.assign(navigator, { clipboard: { writeText: vi.fn(async () => undefined) } });
  render(<LocalSheetManagerContent />);
  fireEvent.click(screen.getByRole("button", { name: "Compartilhar Lívia por link JSON" }));
  expect(await screen.findByAltText("QR code da ficha JSON compartilhada no cofre")).not.toBeNull();
  expect(screen.getByRole("status").textContent).toMatch(/Link JSON de “Lívia” copiado/);
});

it("salva, aplica e exclui uma visualização combinada do cofre", async () => {
  saveLocalSheet("rpg-atlas-local-vampiro-v5-v1", { id: "view-record", name: "Lívia", level: 5, tags: ["jogador"], updatedAt: new Date().toISOString(), sheet: { name: "Lívia", concept: "Investigadora", sheet: { hunger: 2 } } });
  render(<LocalSheetManagerContent />);
  fireEvent.change(screen.getByLabelText("Pesquisar fichas locais"), { target: { value: "Lívia" } });
  fireEvent.change(screen.getByLabelText("Filtrar fichas por nível"), { target: { value: "5" } });
  fireEvent.change(screen.getByLabelText("Filtrar fichas por tag"), { target: { value: "jogador" } });
  fireEvent.change(screen.getByLabelText("Ordenar fichas locais"), { target: { value: "name-asc" } });
  fireEvent.change(screen.getByLabelText("Nome da nova visualização"), { target: { value: "Jogadores V5" } });
  fireEvent.click(screen.getByRole("button", { name: /salvar visão/i }));
  expect((await screen.findByRole("status")).textContent).toContain("Visualização “Jogadores V5” salva.");
  const viewSelect = screen.getByLabelText("Visualizações salvas do cofre") as HTMLSelectElement;
  expect(viewSelect.options[1]?.textContent).toBe("Jogadores V5");
  fireEvent.change(viewSelect, { target: { value: viewSelect.options[1]?.value } });
  expect((screen.getByLabelText("Pesquisar fichas locais") as HTMLInputElement).value).toBe("Lívia");
  fireEvent.click(screen.getByRole("button", { name: /excluir visão/i }));
  expect(screen.getByRole("status").textContent).toContain("Visualização “Jogadores V5” excluída.");
});
