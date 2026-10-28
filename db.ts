import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "scientia.db"));
db.pragma("journal_mode = DELETE");

db.exec(`
CREATE TABLE IF NOT EXISTS stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  dek TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  key_terms TEXT NOT NULL DEFAULT '[]',
  sources TEXT NOT NULL DEFAULT '[]',
  story_date TEXT NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS terms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  example TEXT NOT NULL DEFAULT '',
  story_slug TEXT NOT NULL DEFAULT '',
  story_date TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS raw_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  published_at TEXT,
  fetched_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_stories_date ON stories(story_date);
CREATE INDEX IF NOT EXISTS idx_terms_date ON terms(story_date);
`);

export type KeyTerm = { term: string; definition: string; example: string };
export type SourceLink = { name: string; url: string };

export type Story = {
  slug: string;
  title: string;
  dek: string;
  body: string;
  tags: string[];
  keyTerms: KeyTerm[];
  sources: SourceLink[];
  storyDate: string;
  wordCount: number;
  readingMinutes: number;
  createdAt: string;
};

type StoryRow = {
  slug: string;
  title: string;
  dek: string;
  body: string;
  tags: string;
  key_terms: string;
  sources: string;
  story_date: string;
  word_count: number;
  created_at: string;
};

function parse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

function toStory(r: StoryRow): Story {
  return {
    slug: r.slug,
    title: r.title,
    dek: r.dek,
    body: r.body,
    tags: parse<string[]>(r.tags, []),
    keyTerms: parse<KeyTerm[]>(r.key_terms, []),
    sources: parse<SourceLink[]>(r.sources, []),
    storyDate: r.story_date,
    wordCount: r.word_count,
    readingMinutes: Math.max(1, Math.round(r.word_count / 220)),
    createdAt: r.created_at,
  };
}

export function upsertStory(s: Omit<Story, "readingMinutes">): void {
  db.prepare(
    `INSERT INTO stories (slug, title, dek, body, tags, key_terms, sources, story_date, word_count, created_at)
     VALUES (@slug, @title, @dek, @body, @tags, @keyTerms, @sources, @storyDate, @wordCount, @createdAt)
     ON CONFLICT(slug) DO UPDATE SET
       title = excluded.title, dek = excluded.dek, body = excluded.body,
       tags = excluded.tags, key_terms = excluded.key_terms,
       sources = excluded.sources, word_count = excluded.word_count`
  ).run({
    slug: s.slug,
    title: s.title,
    dek: s.dek,
    body: s.body,
    tags: JSON.stringify(s.tags),
    keyTerms: JSON.stringify(s.keyTerms),
    sources: JSON.stringify(s.sources),
    storyDate: s.storyDate,
    wordCount: s.wordCount,
    createdAt: s.createdAt,
  });
}

export function listStories(limit = 200): Story[] {
  const rows = db
    .prepare(`SELECT * FROM stories ORDER BY story_date DESC, created_at DESC LIMIT ?`)
    .all(limit) as StoryRow[];
  return rows.map(toStory);
}

export function getStory(slug: string): Story | undefined {
  const r = db.prepare(`SELECT * FROM stories WHERE slug = ?`).get(slug) as StoryRow | undefined;
  return r ? toStory(r) : undefined;
}

export function saveTerm(t: {
  term: string;
  definition: string;
  example: string;
  storySlug: string;
  storyDate: string;
}): void {
  db.prepare(
    `INSERT INTO terms (term, definition, example, story_slug, story_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(t.term, t.definition, t.example, t.storySlug, t.storyDate, new Date().toISOString());
}

export type Term = {
  term: string;
  definition: string;
  example: string;
  storySlug: string;
  storyDate: string;
};

export function listTerms(limit = 200): Term[] {
  const rows = db
    .prepare(
      `SELECT term, definition, example, story_slug, story_date FROM terms
       ORDER BY story_date DESC, id DESC LIMIT ?`
    )
    .all(limit) as {
    term: string;
    definition: string;
    example: string;
    story_slug: string;
    story_date: string;
  }[];
  return rows.map((r) => ({
    term: r.term,
    definition: r.definition,
    example: r.example,
    storySlug: r.story_slug,
    storyDate: r.story_date,
  }));
}

export function insertRawItems(
  items: { source: string; title: string; link: string; summary: string; publishedAt: string | null }[]
): void {
  const now = new Date().toISOString();
  const stmt = db.prepare(
    `INSERT INTO raw_items (source, title, link, summary, published_at, fetched_at) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const tx = db.transaction((rows: typeof items) => {
    for (const i of rows) stmt.run(i.source, i.title, i.link, i.summary, i.publishedAt, now);
  });
  tx(items);
}

export function markRawItemUsed(link: string): void {
  db.prepare(`UPDATE raw_items SET used = 1 WHERE link = ?`).run(link);
}
