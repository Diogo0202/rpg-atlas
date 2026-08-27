import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocalSheetVaultPanel } from "./LocalSheetVaultPanel";

describe("LocalSheetVaultPanel", () => {
  beforeEach(() => window.localStorage.clear());

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
