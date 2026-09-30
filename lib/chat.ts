/**
 * Pure logic for an offline chat playground: message list, token estimates,
 * transcript export and a deterministic local mock assistant (no network).
 */

export type Role = "system" | "user" | "assistant";
export type Message = { id: string; role: Role; content: string };

/** Rough token estimate (~4 characters per token, as commonly used for English). */
export function estimateTokens(text: string): number {
  const trimmed = text.trim();
  return trimmed ? Math.ceil(trimmed.length / 4) : 0;
}

export function conversationStats(messages: Message[]) {
  const count = (role: Role) => messages.filter((m) => m.role === role).length;
  return {
    user: count("user"),
    assistant: count("assistant"),
    tokens: messages.reduce((acc, m) => acc + estimateTokens(m.content), 0),
  };
}

/** Keep only the most recent messages whose estimated tokens fit the budget; the system message is always kept. */
export function trimToBudget(messages: Message[], budget: number): Message[] {
  const system = messages.filter((m) => m.role === "system");
  let used = system.reduce((a, m) => a + estimateTokens(m.content), 0);
  const kept: Message[] = [];
  for (const m of [...messages].reverse()) {
    if (m.role === "system") continue;
    const t = estimateTokens(m.content);
    if (used + t > budget) break;
    used += t;
    kept.unshift(m);
  }
  return [...system, ...kept];
}

// Code points that attach to the previous user-perceived character: combining
// marks (incl. Thai vowel/tone marks), Thai/Lao SARA AM, variation selectors,
// emoji skin tones and tag characters.
const EXTEND = /[\p{M}\u0E33\u0EB3\u200C\uFE00-\uFE0F\u{1F3FB}-\u{1F3FF}\u{E0020}-\u{E007F}]/u;
const REGIONAL = /^[\u{1F1E6}-\u{1F1FF}]$/u;

/**
 * Split text into user-perceived characters (a pragmatic subset of UAX #29
 * that covers combining marks, Thai, ZWJ emoji, skin tones, flags and CRLF).
 * Implemented by hand so Hermes (no Intl.Segmenter) behaves like the web.
 */
export function graphemes(text: string): string[] {
  const out: string[] = [];
  for (const c of text) {
    const i = out.length - 1;
    if (i >= 0) {
      const prev = out[i];
      const prevCps = Array.from(prev);
      if (
        EXTEND.test(c) ||
        c === "\u200D" ||
        prev.endsWith("\u200D") ||
        (c === "\n" && prev === "\r") ||
        (REGIONAL.test(c) && prevCps.length === 1 && REGIONAL.test(prev))
      ) {
        out[i] = prev + c;
        continue;
      }
    }
    out.push(c);
  }
  return out;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Deterministic rule-based reply so the playground works fully offline. */
export function mockReply(input: string, systemPrompt = ""): string {
  const text = input.trim();
  const lower = text.toLowerCase();
  const persona = systemPrompt.trim() ? ` (persona: ${graphemes(systemPrompt.trim()).slice(0, 40).join("")})` : "";
  if (!text) return "Say something and I will reply.";
  // \b is ASCII-only, so it never matched after the Thai greeting; use an
  // explicit "end, space or punctuation" lookahead instead.
  if (/^(hi|hello|hey|sawasdee|สวัสดี)(?=$|[\s\p{P}])/iu.test(text)) return `Hello! I'm the offline playground assistant${persona}. Try "/help".`;
  if (lower === "/help") {
    return "Commands: /reverse <text>, /count <text>, /upper <text>, /tokens <text>. Anything else is echoed back with stats.";
  }
  // Split on the first run of any whitespace (tab/newline too, not just " ").
  const [, cmd, arg] = /^(\S+)\s*([\s\S]*)$/.exec(text) ?? ["", text, ""];
  switch (cmd.toLowerCase()) {
    case "/reverse":
      // Reverse whole characters so accents, Thai marks and emoji stay intact.
      return graphemes(arg).reverse().join("");
    case "/upper":
      return arg.toUpperCase();
    case "/count": {
      const words = arg.trim() ? arg.trim().split(/\s+/).length : 0;
      return `${plural(words, "word", "words")}, ${plural(graphemes(arg).length, "character", "characters")}.`;
    }
    case "/tokens":
      return `≈${plural(estimateTokens(arg), "token", "tokens")}.`;
  }
  if (text.endsWith("?")) return `Good question${persona}. This offline mock can't look things up, but your question has ${plural(estimateTokens(text), "token", "tokens")}.`;
  return `You said: "${text}"${persona}`;
}

export function formatTranscript(messages: Message[]): string {
  return messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
}

let counter = 0;
export function makeMessage(role: Role, content: string): Message {
  counter += 1;
  return { id: `${Date.now().toString(36)}-${counter}`, role, content };
}

/** Keep the stored conversation bounded: only the most recent messages survive. */
export const MAX_STORED_MESSAGES = 200;

export function recentMessages(messages: Message[], max = MAX_STORED_MESSAGES): Message[] {
  return messages.length > max ? messages.slice(-max) : messages;
}

const ROLES: Role[] = ["system", "user", "assistant"];

/** Type guard used when loading the conversation from local storage. */
export function isMessage(value: unknown): value is Message {
  if (typeof value !== "object" || value === null) return false;
  const m = value as Record<string, unknown>;
  return typeof m.id === "string" && ROLES.includes(m.role as Role) && typeof m.content === "string";
}
