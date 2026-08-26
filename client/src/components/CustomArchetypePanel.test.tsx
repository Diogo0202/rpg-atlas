// @vitest-environment jsdom
import userEvent from "@testing-library/user-event";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mutate = vi.fn();
const updateMutate = vi.fn();
const invalidate = vi.fn();
const onApply = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ archetypes: { mine: { invalidate } } }),
    archetypes: {
      mine: { useQuery: () => ({ data: [{ id: 7, title: "Batedor da Estrada", summary: "Viagem e percepção", payload: { skills: { travel: 3 } } }], isLoading: false }) },
      create: { useMutation: () => ({ mutate, isPending: false }) },
      update: { useMutation: () => ({ mutate: updateMutate, isPending: false }) },
      remove: { useMutation: () => ({ mutate, isPending: false }) },
    },
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { CustomArchetypePanel } from "./CustomArchetypePanel";

describe("arquétipos personalizados", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("salva o retrato atual e permite reaplicar um modelo preservado", async () => {
    const user = userEvent.setup();
    render(<CustomArchetypePanel systemId="vampiro-v5" snapshot={{ attributes: { "Força": 3 } }} onApply={onApply} />);
    await user.type(screen.getByPlaceholderText("Ex.: Investigadora do Elysium"), "Guardião de ferro");
    await user.click(screen.getByRole("button", { name: /^salvar$/i }));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ systemId: "vampiro-v5", title: "Guardião de ferro", payload: { attributes: { "Força": 3 } } }));
    await user.click(screen.getByRole("button", { name: /aplicar/i }));
    expect(onApply).toHaveBeenCalledWith({ skills: { travel: 3 } }, "Batedor da Estrada");
  });

  it("permite editar o texto sem trocar a configuração persistida", async () => {
    const user = userEvent.setup();
    render(<CustomArchetypePanel systemId="vampiro-v5" snapshot={{ attributes: { "Força": 4 } }} onApply={onApply} />);
    await user.click(screen.getByRole("button", { name: /^editar$/i }));
    await user.clear(screen.getByPlaceholderText("Uma nota curta sobre o estilo"));
    await user.type(screen.getByPlaceholderText("Uma nota curta sobre o estilo"), "Vigilância e estrada");
    await user.click(screen.getByRole("button", { name: /^atualizar$/i }));
    expect(updateMutate).toHaveBeenCalledWith({ archetypeId: 7, title: "Batedor da Estrada", summary: "Vigilância e estrada", payload: { skills: { travel: 3 } } });
  });

  it("permite atualizar explicitamente o retrato com a ficha atual", async () => {
    const user = userEvent.setup();
    render(<CustomArchetypePanel systemId="vampiro-v5" snapshot={{ attributes: { "Força": 5 } }} onApply={onApply} />);
    await user.click(screen.getByRole("button", { name: /^editar$/i }));
    await user.click(screen.getByRole("button", { name: /atualizar retrato/i }));
    expect(updateMutate).toHaveBeenCalledWith({ archetypeId: 7, title: "Batedor da Estrada", summary: "Viagem e percepção", payload: { attributes: { "Força": 5 } } });
  });
});
