import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react";
import type { Codec } from "./persist";

/**
 * `useState` backed by AsyncStorage. Loads once on mount (keeping `initial`
 * when nothing valid is stored), then saves after every change. Edits made
 * before the load finishes win over the stored value. If the read fails the
 * app keeps working in memory and never writes, so a transient storage error
 * cannot overwrite saved data with `initial`.
 */
export function usePersistentState<T>(key: string, initial: T, codec: Codec<T>) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const touched = useRef(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (cancelled) return;
        const stored = codec.decode(raw);
        if (!touched.current && stored !== undefined) setValue(stored);
        setHydrated(true);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [key, codec]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(key, codec.encode(value)).catch(() => undefined);
  }, [hydrated, key, codec, value]);

  const update = useCallback((next: SetStateAction<T>) => {
    touched.current = true;
    setValue(next);
  }, []);

  return [value, update, hydrated] as const;
}
