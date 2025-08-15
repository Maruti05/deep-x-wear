"use client";

import { useEffect, useState } from "react";

/**
 * Debounces a value so it only updates after the delay has passed without changes.
 * @param value The value to debounce
 * @param delay Delay in ms (default 400ms)
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
