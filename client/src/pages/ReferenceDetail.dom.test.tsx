import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ReferenceDetailContent } from "./ReferenceDetail";

describe("ReferenceDetailContent", () => {
  afterEach(cleanup);

  it("exibe o dossiê completo de um clã e suas disciplinas", () => {
    render(<ReferenceDetailContent category="clas" id="tremere" />);

    expect(screen.queryByRole("heading", { name: "Tremere" })).not.toBeNull();
    expect(screen.queryByText("Feitiçaria de Sangue")).not.toBeNull();
    expect(screen.queryByText("Perdição")).not.toBeNull();
  });

  it("exibe os dossiês de credo e linhagem em suas categorias", () => {
    const { rerender } = render(<ReferenceDetailContent category="credos" id="marcial" />);
    expect(screen.queryByRole("heading", { name: "Marcial" })).not.toBeNull();
    expect(screen.queryByText("Arquétipos de referência")).not.toBeNull();

    rerender(<ReferenceDetailContent category="linhagens" id="bri" />);
    expect(screen.queryByRole("heading", { name: "Homens de Bri" })).not.toBeNull();
    expect(screen.queryByText("Bênção cultural")).not.toBeNull();
  });
});
