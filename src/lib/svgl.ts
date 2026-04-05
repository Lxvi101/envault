import type { CachedSvglEntry, SvglIcon, SvglThemeRoute } from "../types/svgl";
import { SVGL_API_URL, SVGL_CACHE_KEY, SVGL_CACHE_TTL } from "./constants";

/** In-memory cache to avoid hitting localStorage on every render */
const memoryCache = new Map<string, string>();

/**
 * Fetch an SVG icon from the svgl API by service name.
 * Results are cached in localStorage with a 7-day TTL and mirrored in memory.
 *
 * @param query - Service name to search for (e.g. "vercel", "stripe")
 * @returns The SVG markup string, or null if not found
 */
export async function fetchIcon(query: string): Promise<string | null> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return null;

  // Check in-memory cache first
  const memHit = memoryCache.get(normalizedQuery);
  if (memHit !== undefined) return memHit;

  // Check localStorage cache
  const diskHit = getFromDiskCache(normalizedQuery);
  if (diskHit !== null) {
    memoryCache.set(normalizedQuery, diskHit);
    return diskHit;
  }

  // Fetch from API
  try {
    const url = `${SVGL_API_URL}?search=${encodeURIComponent(normalizedQuery)}`;
    const res = await fetch(url);

    if (!res.ok) return null;

    const icons: SvglIcon[] = await res.json();
    if (!icons.length) return null;

    const icon = icons[0];
    const svgUrl = resolveSvgUrl(icon);
    if (!svgUrl) return null;

    const svgRes = await fetch(svgUrl);
    if (!svgRes.ok) return null;

    const svg = await svgRes.text();
    if (!svg || !svg.includes("<svg")) return null;

    // Store in both caches
    memoryCache.set(normalizedQuery, svg);
    saveToDiskCache(normalizedQuery, svg);

    return svg;
  } catch {
    return null;
  }
}

/**
 * Clear the entire svgl icon cache (both memory and disk).
 */
export function clearIconCache(): void {
  memoryCache.clear();
  try {
    localStorage.removeItem(SVGL_CACHE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Pre-warm the memory cache from localStorage on app start.
 */
export function warmIconCache(): void {
  const cache = readDiskCache();
  const now = Date.now();

  for (const [key, entry] of Object.entries(cache)) {
    if (now - entry.fetchedAt < SVGL_CACHE_TTL) {
      memoryCache.set(key, entry.svg);
    }
  }
}

// ── Internal helpers ───────────────────────────────────────────────────────

function resolveSvgUrl(icon: SvglIcon): string | null {
  const route = icon.route;

  if (typeof route === "string") {
    return route;
  }

  if (route && typeof route === "object") {
    const themeRoute = route as SvglThemeRoute;
    // Prefer dark variant for our dark UI
    return themeRoute.dark || themeRoute.light || null;
  }

  return null;
}

function readDiskCache(): Record<string, CachedSvglEntry> {
  try {
    const raw = localStorage.getItem(SVGL_CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, CachedSvglEntry>;
  } catch {
    return {};
  }
}

function writeDiskCache(cache: Record<string, CachedSvglEntry>): void {
  try {
    localStorage.setItem(SVGL_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage might be full; silently fail
  }
}

function getFromDiskCache(key: string): string | null {
  const cache = readDiskCache();
  const entry = cache[key];

  if (!entry) return null;

  // Check TTL
  if (Date.now() - entry.fetchedAt > SVGL_CACHE_TTL) {
    // Expired - remove from cache
    delete cache[key];
    writeDiskCache(cache);
    return null;
  }

  return entry.svg;
}

function saveToDiskCache(key: string, svg: string): void {
  const cache = readDiskCache();

  // Prune expired entries to keep cache size manageable
  const now = Date.now();
  for (const [k, entry] of Object.entries(cache)) {
    if (now - entry.fetchedAt > SVGL_CACHE_TTL) {
      delete cache[k];
    }
  }

  cache[key] = { svg, fetchedAt: now };
  writeDiskCache(cache);
}
