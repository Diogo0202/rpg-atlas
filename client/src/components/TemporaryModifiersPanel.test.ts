import { describe, expect, it } from "vitest";
import { getTemporaryModifierTotal } from "./TemporaryModifiersPanel";

const modifiers = [
  { id: "all", label: "Ajuda", value: 2, scope: "all" as const, enabled: true },
  { id: "attribute", label: "Ferido", value: -1, scope: "attributes" as const, enabled: true },
  { id: "skill", label: "Ferramentas", value: 3, scope: "skills" as const, enabled: true },
  { id: "off", label: "Inativo", value: 9, scope: "all" as const, enabled: false },
];

describe("getTemporaryModifierTotal", () => {
  it("combina somente modificadores gerais e do escopo do traço", () => {
    expect(getTemporaryModifierTotal(modifiers, "attributes")).toBe(1);
    expect(getTemporaryModifierTotal(modifiers, "skills")).toBe(5);
  });

  it("combina cada condição habilitada uma única vez em testes compostos", () => {
    expect(getTemporaryModifierTotal(modifiers, "test")).toBe(4);
  });
});
