import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";

type SyncState = "idle" | "syncing" | "synced" | "error";

interface UseSyncStatusResult {
  /** Current sync state */
  state: SyncState;
  /** Human-readable last sync time (e.g. "just now", "2 minutes ago") */
  lastSyncLabel: string;
  /** Timestamp of the last successful sync, or null if never synced */
  lastSyncTime: number | null;
  /** Manually trigger a sync status update */
  markSynced: () => void;
  /** Mark as currently syncing */
  markSyncing: () => void;
  /** Mark an error */
  markError: () => void;
}

/**
 * Simple sync status hook that tracks and displays the last sync time.
 *
 * Updates the human-readable label every 30 seconds. Automatically resets
 * when the vault is locked.
 */
export function useSyncStatus(): UseSyncStatusResult {
  const [state, setState] = useState<SyncState>("idle");
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [lastSyncLabel, setLastSyncLabel] = useState("Not synced");

  const markSynced = useCallback(() => {
    const now = Date.now();
    setLastSyncTime(now);
    setState("synced");
    setLastSyncLabel("Just now");
  }, []);

  const markSyncing = useCallback(() => {
    setState("syncing");
  }, []);

  const markError = useCallback(() => {
    setState("error");
  }, []);

  // Update the label periodically
  useEffect(() => {
    if (lastSyncTime === null) return;

    function updateLabel() {
      if (lastSyncTime === null) return;
      setLastSyncLabel(formatTimeAgo(lastSyncTime));
    }

    updateLabel();
    const interval = setInterval(updateLabel, 30_000);
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  // Reset when vault is locked
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((authState) => {
      if (authState.isLocked) {
        setState("idle");
        setLastSyncTime(null);
        setLastSyncLabel("Not synced");
      }
    });

    return unsubscribe;
  }, []);

  return { state, lastSyncLabel, lastSyncTime, markSynced, markSyncing, markError };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
