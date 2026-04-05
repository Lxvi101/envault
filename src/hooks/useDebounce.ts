import { useEffect, useState } from "react";

/**
 * Debounce a rapidly changing value.
 *
 * Returns a debounced version of `value` that only updates after `delay`
 * milliseconds of inactivity.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default 200)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useState("");
 * const debouncedQuery = useDebounce(query, 300);
 *
 * useEffect(() => {
 *   // Only fires 300ms after the user stops typing
 *   search(debouncedQuery);
 * }, [debouncedQuery]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 200): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
