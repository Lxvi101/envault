import { useEffect, useRef } from "react";
import { AUTO_LOCK_MS } from "../lib/constants";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * Auto-lock the vault after a period of inactivity.
 *
 * Monitors mousemove, keydown, and pointerdown events.
 * Resets the timer on any user activity. When the timer expires,
 * the vault is locked automatically.
 *
 * Only active when the vault is unlocked.
 */
export function useAutoLock(timeoutMs: number = AUTO_LOCK_MS) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function resetTimer() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const { isLocked } = useAuthStore.getState();
      if (isLocked) return;

      timerRef.current = setTimeout(() => {
        const { isLocked: stillLocked, lock } = useAuthStore.getState();
        if (!stillLocked) {
          lock();
        }
      }, timeoutMs);
    }

    function handleActivity() {
      const { isLocked } = useAuthStore.getState();
      if (!isLocked) {
        resetTimer();
      }
    }

    // Start the timer
    resetTimer();

    // Listen for user activity
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("pointerdown", handleActivity);

    // Also subscribe to auth state changes to start/stop the timer
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.isLocked) {
        // Vault just locked - clear the timer
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      } else {
        // Vault just unlocked - start the timer
        resetTimer();
      }
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("pointerdown", handleActivity);
      unsubscribe();
    };
  }, [timeoutMs]);
}
