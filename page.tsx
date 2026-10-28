import Link from "next/link";
import { listStories } from "@/lib/db";
import { quoteOfDay } from "@/lib/quotes";
import { funFact } from "@/lib/words";
import { SaveButton } from "@/components/SaveButton";
import { dateLine } from "@/lib/text";

export default async function HomePage() {
  const stories = listStories(200);
  const quote = quoteOfDay();
  const fact = await funFact();

  return (
    <main className="wrap main-layout">
      <div>
        <section className="quote-card">
          <div className="quote-kicker">Quote of the day</div>
          <div className="quote-mark" aria-hidden="true">&ldquo;</div>
          <blockquote>{quote.text}</blockquote>
          <div className="quote-author">
            <b>{quote.author}</b>
            {quote.context ? <span>{quote.context}</span> : null}
          </div>
          <div className="quote-date">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </section>

        {stories.length === 0 ? (
          <div className="empty">
            <p className="page-sub" style={{ margin: "0 auto 16px" }}>
              Nothing to read yet. Generate the first set of stories with:
            </p>
            <p>
              <code>npm run pipeline</code>
            </p>
          </div>
        ) : (
          <div className="story-list">
            {stories.map((s, i) => (
              <div key={s.slug} className="story-row">
                <Link href={`/article/${s.slug}/`} className="story-row-link">
                  <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <span className="row-tags">{s.tags.slice(0, 2).join("  ·  ")}</span>
                    <h2>{s.title}</h2>
                    <p>{s.dek}</p>
                    <div className="meta">
                      <span>{s.readingMinutes} min read</span>
                      <span className="dot">·</span>
                      <span>{s.sources.length} sources</span>
                      <span className="dot">·</span>
                      <span>{dateLine(s.storyDate)}</span>
                    </div>
                  </div>
                </Link>
                <SaveButton
                  compact
                  item={{
                    slug: s.slug,
                    title: s.title,
                    dek: s.dek,
                    storyDate: s.storyDate,
                    readingMinutes: s.readingMinutes,
                    tags: s.tags,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <aside>
        <div className="rail-box">
          <h2>Words from your reading</h2>
          <p>
            The unfamiliar words from each piece collect on the{" "}
            <Link href="/learn/">Learn page</Link>.
          </p>
        </div>
        <div className="rail-box">
          <h2>Curiosity</h2>
          <p>{fact}</p>
        </div>
      </aside>
    </main>
  );
}
