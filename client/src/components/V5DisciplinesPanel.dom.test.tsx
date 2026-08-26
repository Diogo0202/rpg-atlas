import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { V5_CLANS } from "@shared/vampire-v5";
import { V5DisciplinesPanel } from "./V5DisciplinesPanel";

describe("V5DisciplinesPanel", () => {
  it("mostra automaticamente apenas as disciplinas iniciais do clã escolhido", () => {
    const clan = V5_CLANS.find((entry) => entry.id === "toreador");
    render(<V5DisciplinesPanel clan={clan} disciplines={{ Auspícios: [], Celeridade: [], Presença: [] }} onToggleManualDiscipline={vi.fn()} onTogglePower={vi.fn()} />);

    expect(screen.getAllByText("Disciplina inicial de Toreador")).toHaveLength(3);
    expect(screen.queryByText("Auspícios")).not.toBeNull();
    expect(screen.queryByText("Celeridade")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Selecionar Potência" })).toBeNull();
  });

  it("permite que um personagem sem clã selecione suas próprias disciplinas", () => {
    const clan = V5_CLANS.find((entry) => entry.id === "caitiff");
    const onToggleManualDiscipline = vi.fn();
    render(<V5DisciplinesPanel clan={clan} disciplines={{}} onToggleManualDiscipline={onToggleManualDiscipline} onTogglePower={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Selecionar Potência" }));
    expect(onToggleManualDiscipline).toHaveBeenCalledWith("Potência");
  });
});
