// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createV5SheetData } from "@shared/vampire-v5";
import { FaithfulOneRingCreationPanel, FaithfulV5CreationPanel } from "./FaithfulSheetCreationPanels";

describe("FaithfulSheetCreationPanels", () => {
  it("organiza e edita os blocos centrais de Vampiro V5", () => {
    const sheet = createV5SheetData();
    const onChange = vi.fn();
    render(<FaithfulV5CreationPanel sheet={sheet} name="Mara" concept="Investigadora" onNameChange={vi.fn()} onConceptChange={vi.fn()} onChange={onChange} onRatingChange={vi.fn()} onClanChange={vi.fn()} />);
    expect(screen.getByRole("region", { name: "Folha principal de criação Vampiro V5" })).not.toBeNull();
    expect(screen.getByText("Habilidades")).not.toBeNull();
    expect(screen.getByText("Disciplinas")).not.toBeNull();
    fireEvent.change(screen.getByLabelText("Fome na folha principal"), { target: { value: "3" } });
    expect(onChange).toHaveBeenCalledWith({ hunger: 3 });
  });

  it("preserva a estrutura de origem, comunidade e jornada de O Um Anel", () => {
    const sheet = { culture: "Anões", calling: "Guardião", shadowPath: "Ganância", community: "Companhia do Norte", attributes: { strength: 2, heart: 2, wits: 2 }, skills: { Viagem: 1 }, endurance: 24, hope: 8, shadow: 0, load: 2, notes: "O caminho começa." };
    const onChange = vi.fn();
    render(<FaithfulOneRingCreationPanel sheet={sheet} name="Balin" concept="Guardião" onNameChange={vi.fn()} onConceptChange={vi.fn()} onChange={onChange} onRatingChange={vi.fn()} />);
    expect(screen.getByRole("region", { name: "Folha principal de criação de O Um Anel" })).not.toBeNull();
    expect(screen.getByDisplayValue("Companhia do Norte")).not.toBeNull();
    expect(screen.getByText("Perícias de aventura")).not.toBeNull();
    fireEvent.change(screen.getByLabelText("Registro principal da jornada"), { target: { value: "Atravessar o Anduin." } });
    expect(onChange).toHaveBeenCalledWith({ notes: "Atravessar o Anduin." });
  });
});
