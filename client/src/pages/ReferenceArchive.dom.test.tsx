import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const globalSearchState = vi.hoisted(() => ({ data: [] as Array<unknown>, isFetching: false, error: null as Error | null, refetch: vi.fn() }));

vi.mock("@/lib/trpc", () => ({
  trpc: { library: { globalSearch: { useQuery: () => globalSearchState } } },
}));
import { ReferenceArchiveContent } from "./ReferenceArchive";

describe("ReferenceArchiveContent", () => {
  afterEach(cleanup);

  it("filtra os clãs pelo índice de consulta e permite limpar a busca", () => {
    render(<ReferenceArchiveContent />);

    const search = screen.getByLabelText("Pesquisar o acervo e seus registros");
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

  it("informa falhas da busca global e permite uma nova tentativa", () => {
    globalSearchState.error = new Error("Arquivo indisponível");
    render(<ReferenceArchiveContent />);
    expect(screen.getByRole("alert").textContent).toContain("Arquivo indisponível");
    fireEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));
    expect(globalSearchState.refetch).toHaveBeenCalledOnce();
    globalSearchState.error = null;
  });
});
