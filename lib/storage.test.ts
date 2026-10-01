import { describe, expect, it } from "vitest";
import { isMessage, makeMessage, MAX_STORED_MESSAGES, recentMessages } from "./chat";
import { encodeEnvelope, listCodec } from "./persist";

describe("conversation persistence", () => {
  const codec = listCodec(isMessage);

  it("round-trips messages and drops malformed ones", () => {
    const msgs = [makeMessage("user", "hi"), makeMessage("assistant", "hello")];
    expect(codec.decode(codec.encode(msgs))).toEqual(msgs);
    const raw = encodeEnvelope([...msgs, { id: "x", role: "tool", content: "?" }, { id: 1, role: "user", content: "" }]);
    expect(codec.decode(raw)).toEqual(msgs);
  });

  it("recentMessages keeps only the newest messages", () => {
    const msgs = Array.from({ length: MAX_STORED_MESSAGES + 5 }, (_, i) => makeMessage("user", String(i)));
    const kept = recentMessages(msgs);
    expect(kept).toHaveLength(MAX_STORED_MESSAGES);
    expect(kept[0].content).toBe("5");
    expect(recentMessages(msgs.slice(0, 3))).toHaveLength(3);
  });
});
