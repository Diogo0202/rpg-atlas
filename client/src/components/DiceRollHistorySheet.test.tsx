// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";

const refetch = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    characters: {
      rollHistory: { useQuery: () => ({ data: [{ id: 41, context: "Briga · dificuldade 2", resultData: { pool: 5, successes: 3, verdict: "Êxito" }, createdAt: new Date("2026-08-26T12:00:00Z") }], isLoading: false, error: null, refetch }) },
    },
  },
}));

import { DiceRollHistorySheet } from "./DiceRollHistorySheet";

describe("histórico lateral de rolagens", () => {
  it("abre os registros completos da ficha ativa", async () => {
    const user = userEvent.setup();
    render(<DiceRollHistorySheet characterId={9} characterName="Mara" />);
    await user.click(screen.getByRole("button", { name: /histórico de rolagens/i }));
    expect(screen.getByText("Mara")).toBeTruthy();
    expect(screen.getByText("Briga · dificuldade 2")).toBeTruthy();
    expect(screen.getByText(/Êxito · 3 sucesso\(s\) · reserva 5/i)).toBeTruthy();
  });
});
