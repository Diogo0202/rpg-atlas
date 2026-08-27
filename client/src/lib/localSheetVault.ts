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

export function renameLocalSheet(storageKey: string, id: string, name: string) {
  const normalizedName = name.trim();
  if (normalizedName.length < 2) throw new Error("O nome precisa ter pelo menos 2 caracteres.");
  const records = readRecords<unknown>(storageKey);
  const target = records.find((record) => record.id === id);
  if (!target) return records;
  const next = records.map((record) => record.id === id ? { ...record, name: normalizedName, updatedAt: new Date().toISOString(), sheet: record.sheet && typeof record.sheet === "object" && "name" in record.sheet ? { ...record.sheet, name: normalizedName } : record.sheet } : record);
  window.localStorage.setItem(storageKey, JSON.stringify(next));
  return next;
}

export function duplicateLocalSheet<T>(storageKey: string, id: string, name?: string) {
  const records = readRecords<T>(storageKey);
  const target = records.find((record) => record.id === id);
  if (!target) return records;
  const copy: LocalSheetRecord<T> = { ...target, id: createLocalSheetId(storageKey), name: name?.trim() || `${target.name} (cópia)`, updatedAt: new Date().toISOString(), sheet: structuredClone(target.sheet) };
  const next = [copy, ...records];
  window.localStorage.setItem(storageKey, JSON.stringify(next));
  return next;
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
