// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/components/SystemRuleTooltip", () => ({ SystemRuleTooltip: () => <span>Regra do Um Anel</span>, AttributeRuleTooltip: () => <span>Regra de atributo</span> }));
vi.mock("@/components/SheetSystemSwitcher", () => ({ SheetSystemSwitcher: () => <span>Seletor de sistema</span> }));
vi.mock("@/components/SheetCreationGuide", () => ({ SheetCreationGuide: () => <aside>Guia de criação</aside> }));
vi.mock("@/components/QuickRollPanel", () => ({ QuickRollPanel: () => <div>Rolagens rápidas</div> }));
vi.mock("@/components/CustomArchetypePanel", () => ({ CustomArchetypePanel: () => <div>Arquétipos</div> }));
vi.mock("@/components/CharacterShareLinkButton", () => ({ CharacterShareLinkButton: () => <button type="button">Compartilhar ficha</button> }));
vi.mock("@/components/DiceRollHistorySheet", () => ({ DiceRollHistorySheet: () => <button type="button">Histórico</button> }));
vi.mock("@/components/DiceRollFeedback", () => ({ DiceRollFeedback: () => null, DiceRollInProgress: () => null }));
vi.mock("@/components/DiceSoundControl", () => ({ DiceSoundControl: () => null, useDiceRollSound: () => ({ enabled: false, setEnabled: vi.fn(), volume: 0.5, setVolume: vi.fn(), playDiceSound: vi.fn() }) }));
vi.mock("@/components/DiceAnimationControl", () => ({ DiceAnimationControl: () => null, useDiceAnimationPreference: () => ({ animationsEnabled: false, setAnimationsEnabled: vi.fn() }) }));
vi.mock("@/components/DiceStyleControl", () => ({ DiceStyleControl: () => null, useDiceStyle: () => ({ diceStyle: "classic", setDiceStyle: vi.fn() }) }));
vi.mock("@/components/OneRingJourneyState", () => ({ OneRingJourneyState: ({ endurance, load }: { endurance: number; load: number }) => <div aria-label="Estado da jornada">Resistência {endurance} · Carga {load}</div> }));
vi.mock("@/components/TemporaryModifiersPanel", () => ({ TemporaryModifiersPanel: () => <div>Modificadores temporários</div> }));
vi.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button> }));
vi.mock("@/lib/trpc", () => ({ trpc: { useUtils: () => ({ characters: { mine: { invalidate: vi.fn() } } }), characters: { mine: { useQuery: () => ({ data: [] }), }, create: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) }, update: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) }, recordRoll: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) } }, campaigns: { mine: { useQuery: () => ({ data: [] }) } } } }));
vi.mock("@/lib/oneRingPdf", () => ({ createOneRingPdfFile: vi.fn(), downloadOneRingPdf: vi.fn() }));
vi.mock("wouter", () => ({ Link: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

import OneRingSheet from "./OneRingSheet";

afterEach(() => cleanup());

describe("OneRingSheet — folha de jornada", () => {
  it("exibe a hierarquia do sistema e edita comunidade e recursos centrais", () => {
    render(<OneRingSheet />);
    expect(screen.getByRole("heading", { name: "O companheiro na estrada" })).not.toBeNull();
    expect(screen.getByRole("navigation", { name: "Fluxo de criação de O Um Anel" })).not.toBeNull();
    expect(screen.getByText("A jornada é coletiva.")).not.toBeNull();
    fireEvent.change(screen.getByLabelText("Comunidade da companhia"), { target: { value: "Companhia do Norte" } });
    fireEvent.change(screen.getAllByLabelText("Esperança")[0], { target: { value: "6" } });
    expect((screen.getByLabelText("Comunidade da companhia") as HTMLTextAreaElement).value).toBe("Companhia do Norte");
    expect((screen.getAllByLabelText("Esperança")[0] as HTMLInputElement).value).toBe("6");
  });
});


it("exercita cofre, exportação JSON, compartilhamento e carregamento na ficha remodelada", async () => {
  const user = userEvent.setup();
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:sheet") });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  Object.defineProperty(window, "prompt", { configurable: true, value: vi.fn(() => "") });
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn() } });
  render(<OneRingSheet />);
  expect(screen.getByText(/Cofre local/i)).not.toBeNull();
  expect(screen.getByRole("button", { name: "Compartilhar ficha" })).not.toBeNull();
  expect(screen.getByRole("button", { name: /Exportar para impressão/i })).not.toBeNull();
  expect(screen.getByRole("region", { name: "Folha principal de criação de O Um Anel" })).not.toBeNull();
  await user.type(screen.getByLabelText("Nome do companheiro"), "Balin");
  await user.click(screen.getAllByRole("button").find((button) => button.textContent?.includes("Exportar ficha atual sem salvar"))!);
  await user.click(screen.getAllByRole("button").find((button) => button.textContent?.includes("Copiar link JSON"))!);
  await waitFor(() => expect(screen.getByText("Link JSON pronto")).not.toBeNull());
  await user.click(screen.getByRole("button", { name: /salvar localmente/i }));
  const savedCharacterButtons = screen.getAllByRole("button").filter((button) => button.textContent?.trim() === "Balin");
  await user.click(savedCharacterButtons[savedCharacterButtons.length - 1]);
  expect((screen.getByLabelText("Nome do companheiro") as HTMLInputElement).value).toBe("Balin");
});
