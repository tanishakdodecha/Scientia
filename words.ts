const FALLBACK_FACTS = [
  "Honey found in Egyptian tombs over three thousand years old was still perfectly edible.",
  "Octopuses have three hearts and blue blood.",
  "A day on Venus is longer than a year on Venus.",
  "Sharks are older than trees — they appeared roughly four hundred million years ago.",
  "There are more possible chess games than atoms in the observable universe.",
  "Bananas are berries. Strawberries are not.",
];

export async function funFact(): Promise<string> {
  try {
    const res = await fetch("http://numbersapi.com/random/trivia?json", {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = (await res.json()) as { text?: string };
      if (data.text) return data.text;
    }
  } catch {
    /* offline is fine */
  }
  return FALLBACK_FACTS[Math.floor(Date.now() / 86_400_000) % FALLBACK_FACTS.length];
}

export type HistoryEvent = { year: number; text: string };

export async function onThisDay(): Promise<HistoryEvent[]> {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  try {
    const res = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${mm}/${dd}`, {
      signal: AbortSignal.timeout(6000),
      headers: { "user-agent": "ScientiaPersonalReader/1.0" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { events?: HistoryEvent[] };
    return (data.events ?? []).filter((e) => e.year > 1000).slice(0, 6);
  } catch {
    return [];
  }
}
