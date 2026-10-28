export type Quote = { text: string; author: string; context?: string };

export const QUOTES: Quote[] = [
  {
    text: "It is not that we have a short time to live, but that we waste a lot of it.",
    author: "Seneca",
    context: "On the Shortness of Life",
  },
  {
    text: "We suffer more often in imagination than in reality.",
    author: "Seneca",
    context: "Letters to Lucilius",
  },
  {
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    author: "Marcus Aurelius",
    context: "Meditations",
  },
  {
    text: "Waste no more time arguing what a good man should be. Be one.",
    author: "Marcus Aurelius",
    context: "Meditations",
  },
  {
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche",
  },
  {
    text: "Do what you can, with what you have, where you are.",
    author: "Theodore Roosevelt",
    context: "An Autobiography",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    text: "The time is always right to do what is right.",
    author: "Martin Luther King Jr.",
    context: "Strength to Love",
  },
  {
    text: "Alone we can do so little; together we can so much.",
    author: "Helen Keller",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    context: "Stanford commencement address, 2005",
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Will Durant",
    context: "summarizing Aristotle",
  },
  {
    text: "Well done is better than well said.",
    author: "Benjamin Franklin",
    context: "Poor Richard's Almanack",
  },
];

export function quoteOfDay(now: Date = new Date()): Quote {
  const startOfYear = Date.UTC(now.getUTCFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - startOfYear) / 86_400_000);
  return QUOTES[day % QUOTES.length];
}
