// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/trpc", () => ({
  trpc: { characters: { sharedByToken: { useQuery: () => ({ data: null, isLoading: false }) } } },
}));
vi.mock("wouter", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useRoute: (pattern: string) => [pattern.includes("/ficha/") ? true : false, { token: "token-de-teste-comprido-123456" }],
}));

import SharedCharacterSheet from "./SharedCharacterSheet";

it("exibe uma mensagem segura quando o link exclusivo não existe ou foi revogado", () => {
  render(<SharedCharacterSheet />);
  expect(screen.getByText("Link indisponível")).toBeTruthy();
  expect(screen.getByText(/pode ter gerado um novo link ou revogado/i)).toBeTruthy();
});
