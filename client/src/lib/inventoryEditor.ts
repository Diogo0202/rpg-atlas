export type InventoryEditorSession = {
  isOpen: boolean;
  editingId: string | null;
};

export function resetInventoryEditorSession(): InventoryEditorSession {
  return { isOpen: false, editingId: null };
}
