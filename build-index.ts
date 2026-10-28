import fs from "node:fs";
import path from "node:path";
import { listStories } from "../src/lib/db";

const stories = listStories(500).map((s) => ({
  slug: s.slug,
  title: s.title,
  dek: s.dek,
  tags: s.tags,
  storyDate: s.storyDate,
}));

const dir = path.join(process.cwd(), "public");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "search-index.json"), JSON.stringify(stories));
console.log(`search index: ${stories.length} stories`);
