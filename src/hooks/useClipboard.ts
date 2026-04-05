import { useCallback, useRef, useState } from "react";
import { CLIPBOARD_CLEAR_MS } from "../lib/constants";
import { useToastStore } from "../stores/useToastStore";

interface UseClipboardResult {
  /** Copy a value to the clipboard via the secure Electron IPC bridge */
  copy: (value: string, label?: string) => Promise<void>;
  /** Whether a copy operation is in flight */
  isCopying: boolean;
  /** Whether the last copy was successful (resets after clear timeout) */
  hasCopied: boolean;
}

/**
 * Clipboard hook that uses the Electron preload bridge to copy secrets.
 *
 * - Shows a success toast on copy
 * - Tracks `hasCopied` state that auto-resets after CLIPBOARD_CLEAR_MS
 * - Errors are surfaced as error toasts
 */
export function useClipboard(): UseClipboardResult {
  const [isCopying, setIsCopying] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (value: string, label?: string) => {
    setIsCopying(true);

    try {
      await window.api.copySecret(value);

      setHasCopied(true);
      useToastStore.getState().addToast("success", label ? `Copied ${label}` : "Copied to clipboard");

      // Reset hasCopied after the clear timeout
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
      clearTimerRef.current = setTimeout(() => {
        setHasCopied(false);
      }, CLIPBOARD_CLEAR_MS);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to copy";
      useToastStore.getState().addToast("error", message);
    } finally {
      setIsCopying(false);
    }
  }, []);

  return { copy, isCopying, hasCopied };
}
