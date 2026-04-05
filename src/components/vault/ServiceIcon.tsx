import { useState, useEffect, useMemo } from "react";
import clsx from "clsx";
import { SVGL_API_URL, SVGL_CACHE_KEY, SVGL_CACHE_TTL } from "@/lib/constants";

interface ServiceIconProps {
  name: string;
  size?: number;
  className?: string;
}

interface CachedIcon {
  svg: string;
  fetchedAt: number;
}

function getCache(): Record<string, CachedIcon> {
  try {
    const raw = localStorage.getItem(SVGL_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCache(key: string, svg: string) {
  try {
    const cache = getCache();
    cache[key] = { svg, fetchedAt: Date.now() };
    localStorage.setItem(SVGL_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage full, clear and retry
    localStorage.removeItem(SVGL_CACHE_KEY);
  }
}

function getCachedSvg(name: string): string | null {
  const cache = getCache();
  const entry = cache[name.toLowerCase()];
  if (entry && Date.now() - entry.fetchedAt < SVGL_CACHE_TTL) {
    return entry.svg;
  }
  return null;
}

export function ServiceIcon({ name, size = 32, className }: ServiceIconProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const normalizedName = name.toLowerCase().trim();

  useEffect(() => {
    if (!normalizedName) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    const cached = getCachedSvg(normalizedName);
    if (cached) {
      setSvgContent(cached);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchIcon() {
      try {
        const res = await fetch(
          `${SVGL_API_URL}?search=${encodeURIComponent(normalizedName)}`
        );
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        if (cancelled) return;

        if (data && data.length > 0) {
          const entry = data[0];
          const svgUrl =
            typeof entry.route === "string"
              ? entry.route
              : entry.route?.dark || entry.route?.light;

          if (svgUrl) {
            const svgRes = await fetch(svgUrl);
            if (!svgRes.ok) throw new Error("Failed to fetch SVG");
            const svg = await svgRes.text();
            if (cancelled) return;

            if (svg.includes("<svg")) {
              setCache(normalizedName, svg);
              setSvgContent(svg);
              setIsLoading(false);
              return;
            }
          }
        }

        if (!cancelled) {
          setHasError(true);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    }

    fetchIcon();
    return () => {
      cancelled = true;
    };
  }, [normalizedName]);

  const fallbackColor = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 50%)`;
  }, [name]);

  const fallbackLetter = name.charAt(0).toUpperCase() || "?";

  if (isLoading) {
    return (
      <div
        className={clsx(
          "rounded-lg overflow-hidden bg-vault-raised animate-pulse flex-shrink-0",
          className
        )}
        style={{ width: size, height: size }}
      />
    );
  }

  if (hasError || !svgContent) {
    return (
      <div
        className={clsx(
          "rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0 border border-white/10",
          className
        )}
        style={{
          width: size,
          height: size,
          backgroundColor: fallbackColor,
          fontSize: size * 0.42,
        }}
      >
        {fallbackLetter}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "rounded-lg overflow-hidden flex-shrink-0 border border-vault-border/40 bg-white/5 flex items-center justify-center p-1",
        className
      )}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{
        __html: svgContent.replace(
          /<svg/,
          `<svg width="${size - 8}" height="${size - 8}" style="display:block"`
        ),
      }}
    />
  );
}
