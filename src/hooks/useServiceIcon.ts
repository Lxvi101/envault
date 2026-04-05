import { useEffect, useRef, useState } from "react";
import { fetchIcon } from "../lib/svgl";

interface UseServiceIconResult {
  /** The raw SVG markup string, or null if not loaded / not found */
  svg: string | null;
  /** Whether the icon is currently being fetched */
  isLoading: boolean;
  /** Error message if the fetch failed */
  error: string | null;
}

/**
 * Fetch an svgl icon by service name with in-memory + localStorage caching.
 *
 * The underlying `fetchIcon` handles both cache layers. This hook simply
 * wraps it with React state for loading, error, and result tracking.
 *
 * @param serviceName - The service identifier (e.g. "vercel", "stripe")
 * @returns The SVG string, loading state, and any error
 */
export function useServiceIcon(serviceName: string | undefined): UseServiceIconResult {
  const [svg, setSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);
  const lastQueryRef = useRef<string>("");

  useEffect(() => {
    const query = serviceName?.trim().toLowerCase() ?? "";

    // Skip if the query hasn't changed
    if (query === lastQueryRef.current) return;
    lastQueryRef.current = query;

    // Reset for empty queries
    if (!query) {
      setSvg(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    abortRef.current = false;
    setIsLoading(true);
    setError(null);

    fetchIcon(query)
      .then((result) => {
        if (!abortRef.current) {
          setSvg(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!abortRef.current) {
          setError(err instanceof Error ? err.message : "Failed to fetch icon");
          setSvg(null);
          setIsLoading(false);
        }
      });

    return () => {
      abortRef.current = true;
    };
  }, [serviceName]);

  return { svg, isLoading, error };
}
