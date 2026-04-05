import type { EnvVariable } from "../types/vault";

/**
 * Parse a .env file string into a key-value record.
 *
 * Handles:
 *  - Blank lines and comment lines (starting with #)
 *  - Unquoted, single-quoted, and double-quoted values
 *  - Inline comments after unquoted values
 *  - Multi-line double-quoted values (escaped newlines)
 *  - Leading/trailing whitespace trimming on keys
 *  - `export KEY=VALUE` prefix
 */
export function parseEnvString(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.split(/\r?\n/);

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    i++;

    // Skip empty lines and comments
    if (!line || line.startsWith("#")) continue;

    // Strip optional `export` prefix
    const stripped = line.startsWith("export ") ? line.slice(7).trimStart() : line;

    // Find the first `=` separator
    const eqIndex = stripped.indexOf("=");
    if (eqIndex === -1) continue;

    const key = stripped.slice(0, eqIndex).trim();
    if (!key) continue;

    let rawValue = stripped.slice(eqIndex + 1);

    // Double-quoted value
    if (rawValue.startsWith('"')) {
      let value = rawValue.slice(1);

      // Handle multi-line double-quoted strings
      while (!hasClosingDoubleQuote(value) && i < lines.length) {
        value += "\n" + lines[i];
        i++;
      }

      const closingIndex = findClosingDoubleQuote(value);
      if (closingIndex !== -1) {
        value = value.slice(0, closingIndex);
      }

      // Process escape sequences
      value = value
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");

      result[key] = value;
      continue;
    }

    // Single-quoted value (no escape processing)
    if (rawValue.startsWith("'")) {
      let value = rawValue.slice(1);
      const closingIndex = value.indexOf("'");
      if (closingIndex !== -1) {
        value = value.slice(0, closingIndex);
      }
      result[key] = value;
      continue;
    }

    // Unquoted value - strip inline comments and trim
    const commentIndex = rawValue.indexOf(" #");
    if (commentIndex !== -1) {
      rawValue = rawValue.slice(0, commentIndex);
    }
    result[key] = rawValue.trim();
  }

  return result;
}

/**
 * Serialize an array of EnvVariable objects into a .env file string.
 *
 * Rules:
 *  - Values containing newlines, quotes, or `#` are double-quoted with escapes
 *  - Variable descriptions are emitted as comments above each entry
 *  - Secret variables get a `# [secret]` annotation in the comment
 */
export function serializeEnvVars(vars: EnvVariable[]): string {
  const lines: string[] = [];

  for (const variable of vars) {
    // Emit description as a comment
    if (variable.description) {
      const prefix = variable.isSecret ? "# [secret] " : "# ";
      lines.push(`${prefix}${variable.description}`);
    } else if (variable.isSecret) {
      lines.push("# [secret]");
    }

    const formattedValue = formatValue(variable.value);
    lines.push(`${variable.key}=${formattedValue}`);
    lines.push(""); // blank line between entries for readability
  }

  // Remove trailing blank line
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines.join("\n") + "\n";
}

// ── Internal helpers ───────────────────────────────────────────────────────

/**
 * Determine if a value needs quoting and return the properly formatted string.
 */
function formatValue(value: string): string {
  // Empty value
  if (!value) return '""';

  // Needs double-quoting if it contains special characters
  const needsQuoting =
    value.includes("\n") ||
    value.includes("\r") ||
    value.includes('"') ||
    value.includes("'") ||
    value.includes("#") ||
    value.includes(" ") ||
    value.startsWith(" ") ||
    value.endsWith(" ");

  if (!needsQuoting) return value;

  // Escape special characters and wrap in double quotes
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");

  return `"${escaped}"`;
}

/**
 * Check whether a string (after the opening quote was stripped) contains
 * an unescaped closing double quote.
 */
function hasClosingDoubleQuote(s: string): boolean {
  return findClosingDoubleQuote(s) !== -1;
}

/**
 * Find the index of the first unescaped double quote in a string.
 */
function findClosingDoubleQuote(s: string): number {
  let i = 0;
  while (i < s.length) {
    if (s[i] === "\\" && i + 1 < s.length) {
      i += 2; // skip escaped char
      continue;
    }
    if (s[i] === '"') return i;
    i++;
  }
  return -1;
}
