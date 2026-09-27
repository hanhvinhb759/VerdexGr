export type JournalEntry = {
  code: string;
  name: string;
  at: string;
  scores: Record<string, number>;
  hundred: number;
  comment: string;
  ledger: boolean;
};

const KEY = "verdex-customer-journal";

export function readJournal(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JournalEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function findReview(code: string): JournalEntry | null {
  return readJournal().find((item) => item.code === code) ?? null;
}

export function saveReview(entry: JournalEntry) {
  const next = readJournal().filter((item) => item.code !== entry.code);
  next.unshift(entry);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export type ProductJournalEntry = {
  id: string;
  name: string;
  at: string;
  scores: Record<string, number>;
  hundred: number;
  comment: string;
};

const PRODUCT_KEY = "verdex-product-journal";

export function readProductJournal(): ProductJournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PRODUCT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProductJournalEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function findProductReview(id: string): ProductJournalEntry | null {
  return readProductJournal().find((item) => item.id === id) ?? null;
}

export function saveProductReview(entry: ProductJournalEntry) {
  const next = readProductJournal().filter((item) => item.id !== entry.id);
  next.unshift(entry);
  window.localStorage.setItem(PRODUCT_KEY, JSON.stringify(next));
}
