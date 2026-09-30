import { describe, expect, it } from "vitest";
import { conversationStats, estimateTokens, formatTranscript, makeMessage, mockReply, trimToBudget, type Message } from "./chat";

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
    expect(mockReply("/count one two  three")).toBe("3 word(s), 14 character(s).");
    expect(mockReply("/tokens abcdefgh")).toBe("≈2 token(s).");
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
