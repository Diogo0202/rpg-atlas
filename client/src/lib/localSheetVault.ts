export type LocalSheetRecord<T> = {
  id: string;
  name: string;
  updatedAt: string;
  sheet: T;
};

function readRecords<T>(storageKey: string): LocalSheetRecord<T>[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function listLocalSheets<T>(storageKey: string): LocalSheetRecord<T>[] {
  return readRecords<T>(storageKey).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveLocalSheet<T>(storageKey: string, record: LocalSheetRecord<T>, limit = 24): LocalSheetRecord<T>[] {
  const records = readRecords<T>(storageKey).filter((entry) => entry.id !== record.id);
  const next = [record, ...records].slice(0, limit);
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    throw new Error("Não foi possível salvar a ficha localmente. Reduza o tamanho dos dados e tente novamente.");
  }
  return next;
}

export function loadLocalSheet<T>(storageKey: string, id: string): LocalSheetRecord<T> | undefined {
  return readRecords<T>(storageKey).find((record) => record.id === id);
}

export function removeLocalSheet(storageKey: string, id: string) {
  const next = readRecords<unknown>(storageKey).filter((record) => record.id !== id);
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // A remoção não precisa interromper o fluxo se o navegador já estiver sem espaço.
  }
  return next;
}

export function createLocalSheetId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
