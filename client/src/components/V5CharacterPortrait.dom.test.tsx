import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { V5CharacterPortrait } from "./V5CharacterPortrait";

describe("V5CharacterPortrait", () => {
  it("mantém o símbolo do clã ao lado de um retrato existente", () => {
    render(<V5CharacterPortrait clanId="toreador" portraitUrl="https://example.test/retrato.jpg" name="Lívia" />);

    expect(screen.queryByRole("img", { name: "Retrato de Lívia" })).not.toBeNull();
    expect(screen.queryByTestId("clan-sigil-toreador")).not.toBeNull();
  });

  it("preenche a área do retrato com o símbolo quando não existe foto", () => {
    render(<V5CharacterPortrait clanId="brujah" name="Caio" />);

    expect(screen.queryByTestId("clan-sigil-brujah")).not.toBeNull();
    expect(screen.queryByRole("img", { name: "Retrato de Caio" })).toBeNull();
  });
});
