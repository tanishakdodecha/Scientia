import Parser from "rss-parser";
import { FEEDS } from "./config";

export type NewsItem = {
  id: number;
  source: string;
  title: string;
  link: string;
  summary: string;
  publishedAt: string;
};

export function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchAllItems(hoursBack = 30): Promise<NewsItem[]> {
  const parser = new Parser({ timeout: 15000 });
  const cutoff = Date.now() - hoursBack * 3600_000;
  const items: NewsItem[] = [];
  const seen = new Set<string>();

  for (const feed of FEEDS) {
    try {
      const data = await parser.parseURL(feed.url);
      for (const it of data.items ?? []) {
        const title = stripHtml(it.title ?? "");
        const link = (it.link ?? "").trim();
        if (!title || !link) continue;
        const key = title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
        if (seen.has(key)) continue;
        const publishedAt = it.isoDate ?? it.pubDate ?? new Date().toISOString();
        if (new Date(publishedAt).getTime() < cutoff) continue;
        seen.add(key);
        items.push({
          id: items.length,
          source: feed.name,
          title,
          link,
          summary: stripHtml(it.contentSnippet ?? it.summary ?? "").slice(0, 350),
          publishedAt,
        });
      }
    } catch (err) {
      console.warn(`[rss] ${feed.name} failed: ${(err as Error).message}`);
    }
  }

  console.log(`[rss] ${items.length} items`);
  return items;
}
