import { describe, expect, it } from "vitest";
import { resetInventoryEditorSession } from "./inventoryEditor";

describe("sessão do editor de inventário", () => {
  it("descarta a edição ativa antes de carregar outra ficha", () => {
    expect(resetInventoryEditorSession()).toEqual({ isOpen: false, editingId: null });
  });
});
