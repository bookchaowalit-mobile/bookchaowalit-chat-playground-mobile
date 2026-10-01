/**
 * Pure (React-Native-free) helpers for versioned local persistence.
 * The AsyncStorage wiring lives in `usePersistentState.ts`; everything here
 * is unit-tested so corrupt or outdated storage can never crash the app.
 */

export const STORAGE_VERSION = 1;

export interface Codec<T> {
  encode: (value: T) => string;
  decode: (raw: string | null) => T | undefined;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

/** Wraps data in a `{ v, data }` envelope so future schema changes can migrate. */
export function encodeEnvelope<T>(data: T, version = STORAGE_VERSION): string {
  return JSON.stringify({ v: version, data });
}

/** Returns the envelope payload, or `undefined` for missing/corrupt/other-version data. */
export function decodeEnvelope(raw: string | null, version = STORAGE_VERSION): unknown {
  if (raw == null) return undefined;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isRecord(parsed) && parsed.v === version && "data" in parsed) return parsed.data;
  } catch {
    // corrupt JSON: fall through to "nothing stored"
  }
  return undefined;
}

/** Codec for a list: invalid entries are dropped instead of failing the whole load. */
export function listCodec<T>(isItem: (value: unknown) => value is T, maxItems = 5000): Codec<T[]> {
  return {
    encode: (items) => encodeEnvelope(items.slice(0, maxItems)),
    decode: (raw) => {
      const data = decodeEnvelope(raw);
      if (!Array.isArray(data)) return undefined;
      return data.filter(isItem).slice(0, maxItems);
    },
  };
}

/** Codec for a single value validated by a type guard. */
export function valueCodec<T>(isValue: (value: unknown) => value is T): Codec<T> {
  return {
    encode: (value) => encodeEnvelope(value),
    decode: (raw) => {
      const data = decodeEnvelope(raw);
      return isValue(data) ? data : undefined;
    },
  };
}
