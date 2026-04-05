import { create } from "zustand";
import { MAX_TOASTS, TOAST_DISMISS_MS } from "../lib/constants";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  createdAt: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

let nextId = 0;

function generateId(): string {
  nextId += 1;
  return `toast-${nextId}-${Date.now()}`;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (type, message) => {
    const id = generateId();
    const toast: Toast = {
      id,
      type,
      message,
      createdAt: Date.now(),
    };

    set((state) => {
      // Trim to max toasts, removing the oldest first
      const updated = [...state.toasts, toast];
      if (updated.length > MAX_TOASTS) {
        return { toasts: updated.slice(updated.length - MAX_TOASTS) };
      }
      return { toasts: updated };
    });

    // Auto-dismiss after the configured delay
    setTimeout(() => {
      const { toasts } = get();
      if (toasts.some((t) => t.id === id)) {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }
    }, TOAST_DISMISS_MS);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => set({ toasts: [] }),
}));
