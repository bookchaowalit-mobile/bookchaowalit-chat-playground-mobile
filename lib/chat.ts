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

/** Deterministic rule-based reply so the playground works fully offline. */
export function mockReply(input: string, systemPrompt = ""): string {
  const text = input.trim();
  const lower = text.toLowerCase();
  const persona = systemPrompt.trim() ? ` (persona: ${systemPrompt.trim().slice(0, 40)})` : "";
  if (!text) return "Say something and I will reply.";
  if (/^(hi|hello|hey|sawasdee|สวัสดี)\b/i.test(text)) return `Hello! I'm the offline playground assistant${persona}. Try "/help".`;
  if (lower === "/help") {
    return "Commands: /reverse <text>, /count <text>, /upper <text>, /tokens <text>. Anything else is echoed back with stats.";
  }
  const [cmd, ...rest] = text.split(" ");
  const arg = rest.join(" ");
  switch (cmd.toLowerCase()) {
    case "/reverse":
      return [...arg].reverse().join("");
    case "/upper":
      return arg.toUpperCase();
    case "/count": {
      const words = arg.trim() ? arg.trim().split(/\s+/).length : 0;
      return `${words} word(s), ${[...arg].length} character(s).`;
    }
    case "/tokens":
      return `≈${estimateTokens(arg)} token(s).`;
  }
  if (text.endsWith("?")) return `Good question${persona}. This offline mock can't look things up, but your question has ${estimateTokens(text)} token(s).`;
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
