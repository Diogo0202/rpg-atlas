import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ReferenceArchiveContent } from "./ReferenceArchive";

describe("ReferenceArchiveContent", () => {
  afterEach(cleanup);

  it("filtra os clãs pelo índice de consulta e permite limpar a busca", () => {
    render(<ReferenceArchiveContent />);

    const search = screen.getByLabelText("Pesquisar o acervo");
    fireEvent.change(search, { target: { value: "Tremere" } });
    expect(screen.queryByText("Tremere")).not.toBeNull();
    expect(screen.queryByText("Brujah")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /limpar/i }));
    expect((search as HTMLInputElement).value).toBe("");
    expect(screen.queryByText("Brujah")).not.toBeNull();
  });

  it("expõe as abas de consulta com papéis e estados ARIA corretos", () => {
    render(<ReferenceArchiveContent />);

    const hunterTab = screen.getByRole("tab", { name: "Caçador" });
    const vampireTab = screen.getByRole("tab", { name: "Vampiro V5" });

    expect(vampireTab.getAttribute("aria-selected")).toBe("true");
    expect(hunterTab.getAttribute("aria-selected")).toBe("false");
    expect(hunterTab.getAttribute("aria-controls")).toContain("cacador");
  });
});
