import { describe, expect, it } from "vitest";
import { decodeEnvelope, encodeEnvelope, isRecord, isStringArray, listCodec, valueCodec } from "./persist";

const isNum = (v: unknown): v is number => typeof v === "number";

describe("persist envelope", () => {
  it("round-trips data", () => {
    expect(decodeEnvelope(encodeEnvelope({ a: 1 }))).toEqual({ a: 1 });
  });
  it("treats missing, corrupt and other-version data as nothing stored", () => {
    expect(decodeEnvelope(null)).toBeUndefined();
    expect(decodeEnvelope("{not json")).toBeUndefined();
    expect(decodeEnvelope(JSON.stringify({ v: 99, data: 1 }))).toBeUndefined();
    expect(decodeEnvelope(JSON.stringify([1, 2]))).toBeUndefined();
  });
});

describe("listCodec", () => {
  const codec = listCodec(isNum, 3);
  it("drops invalid entries and caps length", () => {
    const raw = encodeEnvelope([1, "x", 2, null, 3, 4]);
    expect(codec.decode(raw)).toEqual([1, 2, 3]);
    expect(codec.decode(codec.encode([5, 6, 7, 8]))).toEqual([5, 6, 7]);
  });
  it("rejects a non-list payload", () => {
    expect(codec.decode(encodeEnvelope({}))).toBeUndefined();
  });
});

describe("valueCodec and guards", () => {
  it("validates single values", () => {
    const codec = valueCodec(isStringArray);
    expect(codec.decode(codec.encode(["a"]))).toEqual(["a"]);
    expect(codec.decode(encodeEnvelope(["a", 1]))).toBeUndefined();
  });
  it("isRecord excludes arrays and null", () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
  });
});
