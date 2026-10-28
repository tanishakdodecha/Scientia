export type Feed = { name: string; url: string };

export const FEEDS: Feed[] = [
  { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { name: "NPR World", url: "https://feeds.npr.org/1004/rss.xml" },
  { name: "The Guardian World", url: "https://www.theguardian.com/world/rss" },
  { name: "DW News", url: "https://rss.dw.com/rdf/rss-en-world" },
  { name: "France 24", url: "https://www.france24.com/en/rss" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { name: "CBC World", url: "https://www.cbc.ca/webfeed/rss/rss-world" },
  { name: "ABC AU World", url: "https://www.abc.net.au/news/feed/51120/rss.xml" },
];

export const MAX_ARTICLE_CHARS = 14000;
export const READABILITY_TIMEOUT_MS = 12000;
export const LLM_TIMEOUT_MS = 150000;
