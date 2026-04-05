import { useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useSearchStore } from "../stores/useSearchStore";

interface KeyboardCallbacks {
  onNewProject?: () => void;
  onCloseModal?: () => void;
}

/**
 * Global keyboard shortcut handler.
 *
 * Registers the following shortcuts:
 * - Cmd/Ctrl + K: Toggle search palette
 * - Cmd/Ctrl + L: Lock the vault
 * - Cmd/Ctrl + N: Create new project (callback provided by consumer)
 * - Escape: Close search or modals
 */
export function useKeyboard(callbacks?: KeyboardCallbacks) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd+K: Toggle search
      if (isMod && e.key === "k") {
        e.preventDefault();
        const { isLocked } = useAuthStore.getState();
        if (!isLocked) {
          useSearchStore.getState().toggle();
        }
        return;
      }

      // Cmd+L: Lock vault
      if (isMod && e.key === "l") {
        e.preventDefault();
        const { isLocked, lock } = useAuthStore.getState();
        if (!isLocked) {
          lock();
        }
        return;
      }

      // Cmd+N: New project
      if (isMod && e.key === "n") {
        e.preventDefault();
        const { isLocked } = useAuthStore.getState();
        if (!isLocked && callbacks?.onNewProject) {
          callbacks.onNewProject();
        }
        return;
      }

      // Escape: Close search or modals
      if (e.key === "Escape") {
        const { isOpen, close } = useSearchStore.getState();
        if (isOpen) {
          e.preventDefault();
          close();
          return;
        }
        if (callbacks?.onCloseModal) {
          e.preventDefault();
          callbacks.onCloseModal();
        }
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callbacks]);
}
