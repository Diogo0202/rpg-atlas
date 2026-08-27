// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const createMutate = vi.fn();

vi.mock("@/lib/trpc", () => ({ trpc: { characters: { createShareLink: { useMutation: () => ({ mutate: createMutate, isPending: false }) }, shareLinkStatus: { useQuery: () => ({ data: null, isLoading: false, refetch: vi.fn() }) }, revokeShareLink: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) } } } }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { CharacterShareLinkButton } from "./CharacterShareLinkButton";

it("envia a data de expiração personalizada ao gerar um link", async () => {
  const user = userEvent.setup();
  render(<CharacterShareLinkButton characterId={42} />);
  await user.type(screen.getByLabelText("Nome do link"), "Mestre — sessão 4");
  await user.type(screen.getByLabelText("Nota do link"), "Acesso para a revisão da sessão");
  await user.type(screen.getByLabelText("Expiração do link"), "2030-12-31T23:59");
  await user.click(screen.getByRole("button", { name: /gerar link/i }));
  expect(createMutate).toHaveBeenCalledWith({ characterId: 42, expiresAt: new Date("2030-12-31T23:59"), label: "Mestre — sessão 4", description: "Acesso para a revisão da sessão" });
});
