import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { MAX_ARTICLE_CHARS, READABILITY_TIMEOUT_MS } from "./config";

const UA = "Mozilla/5.0 (compatible; ScientiaPersonalReader/1.0; personal-use news reader)";

export async function extractArticle(url: string, fallback: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), READABILITY_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) return fallback.slice(0, MAX_ARTICLE_CHARS);

    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const parsed = new Readability(dom.window.document).parse();
    const text = (parsed?.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
    return (text.length > 400 ? text : fallback).slice(0, MAX_ARTICLE_CHARS);
  } catch {
    return fallback.slice(0, MAX_ARTICLE_CHARS);
  } finally {
    clearTimeout(timer);
  }
}
