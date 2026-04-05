import { useMemo } from "react";

interface SearchHighlightProps {
  text: string;
  query: string;
}

export function SearchHighlight({ text, query }: SearchHighlightProps) {
  const parts = useMemo(() => {
    if (!query.trim()) return [{ text, isMatch: false }];

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const segments: { text: string; isMatch: boolean }[] = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          text: text.slice(lastIndex, match.index),
          isMatch: false,
        });
      }
      segments.push({ text: match[0], isMatch: true });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      segments.push({ text: text.slice(lastIndex), isMatch: false });
    }

    return segments.length > 0
      ? segments
      : [{ text, isMatch: false }];
  }, [text, query]);

  return (
    <span>
      {parts.map((part, i) =>
        part.isMatch ? (
          <mark
            key={i}
            className="bg-vault-accent/25 text-vault-text rounded-sm px-0.5"
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </span>
  );
}
