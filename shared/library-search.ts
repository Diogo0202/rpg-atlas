export type SearchableLibraryEntry = {
  id: number;
  kind: "dossier" | "material";
  title: string;
  body: string;
  metadata: string;
};

export type RankedLibraryEntry = SearchableLibraryEntry & { score: number };

const contextExpansions: Record<string, string[]> = {
  sangue: ["fome", "vampiro", "máscara"],
  fome: ["sangue", "besta", "vampiro"],
  carne: ["vicissitude", "tzimisce", "forma"],
  porto: ["docas", "contrabando", "abismo"],
  kane: ["valerius", "ferro", "caçada"],
  sombra: ["valerius", "abismo", "segredo"],
};

export function normalizeLibraryText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

export function expandLibraryQuery(query: string) {
  const terms = normalizeLibraryText(query).split(/\s+/).filter((term) => term.length >= 2);
  return Array.from(new Set(terms.flatMap((term) => [term, ...(contextExpansions[term] || [])])));
}

export function rankLibraryEntries(entries: readonly SearchableLibraryEntry[], query: string): RankedLibraryEntry[] {
  const terms = expandLibraryQuery(query);
  if (!terms.length) return [];
  return entries.map((entry) => {
    const title = normalizeLibraryText(entry.title);
    const body = normalizeLibraryText(entry.body);
    const metadata = normalizeLibraryText(entry.metadata);
    const score = terms.reduce((total, term) => total + (title.includes(term) ? 6 : 0) + (body.includes(term) ? 3 : 0) + (metadata.includes(term) ? 1 : 0), 0);
    return { ...entry, score };
  }).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "pt-BR"));
}
