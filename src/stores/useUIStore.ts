import { create } from "zustand";
import {
  DEFAULT_LIST_WIDTH,
  DEFAULT_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_LIST_WIDTH,
  MAX_LIST_WIDTH,
  UI_PREFS_KEY,
} from "../lib/constants";
import type { ProjectCategory } from "../types/vault";

type ActiveCategory = "all" | "favorites" | ProjectCategory;

interface UIState {
  sidebarWidth: number;
  listWidth: number;
  activeCategory: ActiveCategory;
  activeTag: string | null;
  sidebarCollapsed: boolean;
  setSidebarWidth: (width: number) => void;
  setListWidth: (width: number) => void;
  setActiveCategory: (category: ActiveCategory) => void;
  setActiveTag: (tag: string | null) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

function loadPersistedState(): Partial<UIState> {
  try {
    const raw = localStorage.getItem(UI_PREFS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      sidebarWidth:
        typeof parsed.sidebarWidth === "number" ? parsed.sidebarWidth : DEFAULT_SIDEBAR_WIDTH,
      listWidth: typeof parsed.listWidth === "number" ? parsed.listWidth : DEFAULT_LIST_WIDTH,
      activeCategory: parsed.activeCategory || "all",
      sidebarCollapsed: typeof parsed.sidebarCollapsed === "boolean" ? parsed.sidebarCollapsed : false,
    };
  } catch {
    return {};
  }
}

function persistState(state: Partial<UIState>): void {
  try {
    const current = loadPersistedState();
    localStorage.setItem(
      UI_PREFS_KEY,
      JSON.stringify({
        ...current,
        sidebarWidth: state.sidebarWidth,
        listWidth: state.listWidth,
        activeCategory: state.activeCategory,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    );
  } catch {
    // Silently ignore localStorage errors
  }
}

const persisted = loadPersistedState();

export const useUIStore = create<UIState>((set, get) => ({
  sidebarWidth: persisted.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH,
  listWidth: persisted.listWidth ?? DEFAULT_LIST_WIDTH,
  activeCategory: (persisted.activeCategory as ActiveCategory) ?? "all",
  activeTag: null,
  sidebarCollapsed: persisted.sidebarCollapsed ?? false,

  setSidebarWidth: (width) => {
    const clamped = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, width));
    set({ sidebarWidth: clamped });
    persistState({ ...get(), sidebarWidth: clamped });
  },

  setListWidth: (width) => {
    const clamped = Math.min(MAX_LIST_WIDTH, Math.max(MIN_LIST_WIDTH, width));
    set({ listWidth: clamped });
    persistState({ ...get(), listWidth: clamped });
  },

  setActiveCategory: (category) => {
    set({ activeCategory: category, activeTag: null });
    persistState({ ...get(), activeCategory: category });
  },

  setActiveTag: (tag) => {
    set({ activeTag: tag });
  },

  toggleSidebar: () => {
    const collapsed = !get().sidebarCollapsed;
    set({ sidebarCollapsed: collapsed });
    persistState({ ...get(), sidebarCollapsed: collapsed });
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
    persistState({ ...get(), sidebarCollapsed: collapsed });
  },
}));
