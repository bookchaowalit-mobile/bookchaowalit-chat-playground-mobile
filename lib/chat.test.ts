import { describe, expect, it } from "vitest";
import { conversationStats, estimateTokens, graphemes, formatTranscript, makeMessage, mockReply, trimToBudget, type Message } from "./chat";

const msg = (id: string, role: Message["role"], content: string): Message => ({ id, role, content });

describe("estimateTokens", () => {
  it("uses ~4 chars per token", () => {
    expect(estimateTokens("")).toBe(0);
    expect(estimateTokens("   ")).toBe(0);
    expect(estimateTokens("abcd")).toBe(1);
    expect(estimateTokens("abcde")).toBe(2);
  });
});

describe("mockReply", () => {
  it("greets and mentions the persona", () => {
    expect(mockReply("hello there")).toMatch(/^Hello!/);
    expect(mockReply("hi", "Pirate")).toContain("persona: Pirate");
  });
  it("runs commands", () => {
    expect(mockReply("/reverse abc")).toBe("cba");
    expect(mockReply("/upper hi you")).toBe("HI YOU");
    expect(mockReply("/count one two  three")).toBe("3 words, 14 characters.");
    expect(mockReply("/tokens abcdefgh")).toBe("≈2 tokens.");
    expect(mockReply("/help")).toMatch(/Commands/);
  });
  it("handles questions, echo and empty input", () => {
    expect(mockReply("what is this?")).toMatch(/^Good question/);
    expect(mockReply("just text")).toBe('You said: "just text"');
    expect(mockReply("  ")).toMatch(/Say something/);
  });
  it("is deterministic", () => {
    expect(mockReply("repeat me")).toBe(mockReply("repeat me"));
  });
});

describe("conversation helpers", () => {
  const convo = [
    msg("s", "system", "Be brief"),
    msg("1", "user", "aaaaaaaa"), // 2 tokens
    msg("2", "assistant", "bbbbbbbbbbbb"), // 3 tokens
    msg("3", "user", "cccc"), // 1 token
  ];
  it("counts messages and tokens", () => {
    expect(conversationStats(convo)).toEqual({ user: 2, assistant: 1, tokens: 8 });
  });
  it("keeps the system prompt and newest messages within budget", () => {
    expect(trimToBudget(convo, 6).map((m) => m.id)).toEqual(["s", "2", "3"]);
    expect(trimToBudget(convo, 2).map((m) => m.id)).toEqual(["s"]);
  });
  it("formats a transcript", () => {
    expect(formatTranscript(convo.slice(0, 2))).toBe("SYSTEM: Be brief\n\nUSER: aaaaaaaa");
  });
  it("creates unique ids", () => {
    expect(makeMessage("user", "a").id).not.toBe(makeMessage("user", "a").id);
  });
});

describe("pass 3 edge cases", () => {
  it("recognises the Thai greeting (\\b never matched after Thai letters)", () => {
    expect(mockReply("สวัสดี")).toMatch(/^Hello!/);
    expect(mockReply("สวัสดี ครับ")).toMatch(/^Hello!/);
    expect(mockReply("hi!")).toMatch(/^Hello!/);
    expect(mockReply("history")).not.toMatch(/^Hello!/);
  });
  it("reverses whole characters, keeping accents, Thai marks and emoji intact", () => {
    expect(mockReply("/reverse e\u0301a")).toBe("ae\u0301");
    expect(mockReply("/reverse สวัสดี")).toBe("ดีสวัส");
    expect(mockReply("/reverse 👍🏽x")).toBe("x👍🏽");
    expect(mockReply("/reverse 👨\u200D👩\u200D👧!")).toBe("!👨\u200D👩\u200D👧");
    expect(mockReply("/reverse 🇹🇭🇯🇵")).toBe("🇯🇵🇹🇭");
  });
  it("counts user-perceived characters and pluralises", () => {
    expect(mockReply("/count 👍🏽")).toBe("1 word, 1 character.");
    expect(mockReply("/tokens a")).toBe("≈1 token.");
    expect(graphemes("a\r\nb")).toEqual(["a", "\r\n", "b"]);
  });
  it("accepts a tab or newline after the command", () => {
    expect(mockReply("/upper\thello")).toBe("HELLO");
    expect(mockReply("/upper\nhello")).toBe("HELLO");
  });
});
