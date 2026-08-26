import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AttributeSkillRollPicker } from "./AttributeSkillRollPicker";

describe("AttributeSkillRollPicker", () => {
  it("combina atributo e habilidade selecionados ao rolar", () => {
    const onRoll = vi.fn();
    render(<AttributeSkillRollPicker attributes={{ Força: 3, Destreza: 2 }} skills={{ Briga: 2, Furtividade: 1 }} onRoll={onRoll} />);
    fireEvent.change(screen.getByLabelText("Atributo"), { target: { value: "Destreza" } });
    fireEvent.change(screen.getByLabelText("Habilidade"), { target: { value: "Furtividade" } });
    fireEvent.click(screen.getByRole("button", { name: /rolar destreza \+ furtividade/i }));
    expect(onRoll).toHaveBeenCalledWith("Destreza", "Furtividade");
  });
});
