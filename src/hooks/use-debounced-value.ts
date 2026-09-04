"use client";

import { useEffect, useState } from "react";

/**
 * Debounce a fast-changing value (e.g. a search box) so expensive
 * consumers (server-action queries) fire only after typing settles.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
