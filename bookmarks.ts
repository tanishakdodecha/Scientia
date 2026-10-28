export type SavedItem = {
  slug: string;
  title: string;
  dek: string;
  storyDate: string;
  readingMinutes: number;
  tags: string[];
};

const KEY = "scientia:saved";

export function getSaved(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as SavedItem[];
  } catch {
    return [];
  }
}

export function writeSaved(items: SavedItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("scientia:saved"));
}

export function isSaved(slug: string): boolean {
  return getSaved().some((i) => i.slug === slug);
}

export function toggleSaved(item: SavedItem): boolean {
  const items = getSaved();
  const exists = items.some((i) => i.slug === item.slug);
  const next = exists ? items.filter((i) => i.slug !== item.slug) : [item, ...items];
  writeSaved(next);
  return !exists;
}

export function removeSaved(slug: string): void {
  writeSaved(getSaved().filter((i) => i.slug !== slug));
}
