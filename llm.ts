import { LLM_TIMEOUT_MS } from "./config";

type Opts = { maxTokens?: number; temperature?: number };

export async function complete(system: string, user: string, opts: Opts = {}): Promise<string> {
  const provider = (process.env.LLM_PROVIDER ?? "gemini").toLowerCase();
  const maxTokens = opts.maxTokens ?? 4000;
  const temperature = opts.temperature ?? 0.5;

  if (provider === "gemini") return callGemini(system, user, maxTokens, temperature);
  if (provider === "openai") return callOpenAI(system, user, maxTokens, temperature);
  return callAnthropic(system, user, maxTokens, temperature);
}

async function callGemini(system: string, user: string, maxTokens: number, temperature: number): Promise<string> {
  const model = process.env.GEMINI_MODEL ?? "gemini-3-flash";
  const key = process.env.GEMINI_API_KEY ?? "";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const res = await request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: "application/json",
      },
    }),
  });

  const data = await readJson(res, "Gemini");
  return (data.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? "")
    .join("");
}

async function callOpenAI(system: string, user: string, maxTokens: number, temperature: number): Promise<string> {
  const model = process.env.LLM_MODEL ?? "gpt-4.1";
  const res = await request("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const data = await readJson(res, "OpenAI");
  return data.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(system: string, user: string, maxTokens: number, temperature: number): Promise<string> {
  const model = process.env.LLM_MODEL ?? "claude-sonnet-4-5";
  const res = await request("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  const data = await readJson(res, "Anthropic");
  return (data.content ?? []).map((b: { text?: string }) => b.text ?? "").join("");
}

async function request(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function readJson(res: Response, label: string): Promise<any> {
  const text = await res.text();
  if (!res.ok) throw new Error(`${label} error ${res.status}: ${text.slice(0, 400)}`);
  return JSON.parse(text);
}

export function parseJSON<T>(raw: string): T {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const s = cleaned.indexOf("{");
    const e = cleaned.lastIndexOf("}");
    if (s >= 0 && e > s) return JSON.parse(cleaned.slice(s, e + 1));
    throw new Error(`Could not parse JSON: ${raw.slice(0, 200)}`);
  }
}

export async function completeJSON<T>(system: string, user: string, opts: Opts = {}): Promise<T> {
  return parseJSON<T>(await complete(system, user, opts));
}
