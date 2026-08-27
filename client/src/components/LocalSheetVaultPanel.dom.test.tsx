import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocalSheetVaultPanel } from "./LocalSheetVaultPanel";

vi.mock("qrcode", () => ({ default: { toDataURL: vi.fn(async () => "data:image/png;base64,qr") } }));

describe("LocalSheetVaultPanel", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:panel") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  });

  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it("exporta a ficha atual sem exigir que ela seja salva primeiro", () => {
    const props = { storageKey: "panel-test", systemLabel: "Vampiro V5", name: "Lívia", concept: "Investigadora", campaignId: "", sheet: { hunger: 2 }, onLoad: vi.fn() };
    render(<LocalSheetVaultPanel {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Exportar ficha atual sem salvar" }));
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it("gera link JSON e QR code para a ficha atual sem salvar", async () => {
    const props = { storageKey: "panel-test", systemLabel: "Vampiro V5", name: "Lívia", concept: "Investigadora", campaignId: "", sheet: { hunger: 2 }, onLoad: vi.fn() };
    Object.assign(navigator, { clipboard: { writeText: vi.fn(async () => undefined) } });
    render(<LocalSheetVaultPanel {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Copiar link JSON" }));
    expect(await screen.findByAltText("QR code da ficha JSON compartilhada")).not.toBeNull();
    expect(screen.getByText("Link JSON pronto")).not.toBeNull();
  });

  it("salva a ficha e permite carregá-la novamente no mesmo navegador", () => {
    const onLoad = vi.fn();
    const props = { storageKey: "panel-test", systemLabel: "Vampiro V5", name: "Lívia", concept: "Investigadora", campaignId: "", sheet: { hunger: 2 }, onLoad };
    const { rerender } = render(<LocalSheetVaultPanel {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Salvar localmente" }));
    expect(screen.queryByText("Lívia")).not.toBeNull();
    const savedButton = screen.getByText("Lívia").closest("button");
    if (!savedButton) throw new Error("Registro local não encontrado");
    fireEvent.click(savedButton);
    expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({ name: "Lívia", sheet: { hunger: 2 } }));

    rerender(<LocalSheetVaultPanel {...props} name="Rafael" />);
    fireEvent.click(screen.getByRole("button", { name: "Salvar localmente" }));
    expect(screen.queryByText("Rafael")).not.toBeNull();
  });
});
