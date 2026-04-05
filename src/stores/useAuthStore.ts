import { create } from "zustand";
import * as api from "../lib/api";
import { useVaultStore } from "./useVaultStore";

interface AuthState {
  isLocked: boolean;
  isFirstRun: boolean;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  unlock: (password: string) => Promise<boolean>;
  lock: () => Promise<void>;
  setup: (password: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLocked: true,
  isFirstRun: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.checkAuth();
      set({
        isLocked: result.isLocked,
        isFirstRun: result.isFirstRun,
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to check auth status",
      });
    }
  },

  unlock: async (password: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.unlock(password);
      if (result.success) {
        // Populate the vault store with decrypted projects
        if (result.projects) {
          useVaultStore.getState().setProjects(result.projects);
        }
        set({ isLocked: false, isLoading: false, error: null });
        return true;
      } else {
        set({ isLoading: false, error: "Incorrect password" });
        return false;
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to unlock vault",
      });
      return false;
    }
  },

  lock: async () => {
    try {
      await api.lock();
    } catch {
      // Best effort - lock locally even if IPC fails
    }
    // Always clear local state
    set({ isLocked: true, error: null });
    useVaultStore.getState().setProjects([]);
    useVaultStore.getState().selectProject(null);
    useVaultStore.getState().selectEnvironment(null);
  },

  setup: async (password: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.setup(password);
      if (result.success) {
        set({ isFirstRun: false, isLocked: false, isLoading: false, error: null });
        return true;
      } else {
        set({ isLoading: false, error: "Failed to set up vault" });
        return false;
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to set up vault",
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
