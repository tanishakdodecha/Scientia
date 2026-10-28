import type { Story } from "./db";

const STOPWORDS = new Set(
  "a an and are as at be by for from has have in into is it its of on or that the this to was were will with what how why new says".split(" ")
);

export function titleKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

function daysAgo(date: string): number {
  return (Date.now() - new Date(date).getTime()) / 86_400_000;
}

export type RelatedItem = Story & { reason: string; score: number };

export function findRelated(story: Story, all: Story[], limit = 4): RelatedItem[] {
  const tags = new Set(story.tags);
  const kw = new Set(titleKeywords(story.title));
  const scored: RelatedItem[] = [];

  for (const s of all) {
    if (s.slug === story.slug) continue;
    const sharedTags = s.tags.filter((t) => tags.has(t));
    const sharedKw = titleKeywords(s.title).filter((k) => kw.has(k));
    const sameDay = s.storyDate === story.storyDate;

    let score = sharedTags.length * 2 + sharedKw.length * 1.5 + (sameDay ? 1 : 0);
    score += Math.max(0, 1 - daysAgo(s.storyDate) / 30);

    let reason = "From the archive";
    if (sharedTags.length) reason = `Same topic · ${sharedTags[0]}`;
    else if (sharedKw.length >= 2) reason = "Same subject";
    else if (sameDay) reason = "Also today";

    scored.push({ ...s, reason, score });
  }

  const hits = scored.sort((a, b) => b.score - a.score).filter((s) => s.score >= 1);
  if (hits.length >= limit) return hits.slice(0, limit);
  const rest = scored
    .sort((a, b) => b.storyDate.localeCompare(a.storyDate))
    .slice(0, limit - hits.length);
  return [...hits, ...rest].slice(0, limit);
}

export function allTags(stories: Story[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const s of stories) for (const t of s.tags) map.set(t, (map.get(t) ?? 0) + 1);
  return [...map.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
}
