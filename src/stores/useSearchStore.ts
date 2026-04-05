import { create } from "zustand";
import type { VaultProject } from "../types/vault";
import { useVaultStore } from "./useVaultStore";

interface SearchResult {
  project: VaultProject;
  matchedField: "name" | "description" | "tag" | "variable";
  matchedValue: string;
}

interface SearchState {
  query: string;
  isOpen: boolean;
  setQuery: (query: string) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  reset: () => void;
  filteredResults: () => SearchResult[];
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  isOpen: false,

  setQuery: (query) => set({ query }),

  open: () => set({ isOpen: true, query: "" }),

  close: () => set({ isOpen: false, query: "" }),

  toggle: () => {
    const { isOpen } = get();
    if (isOpen) {
      set({ isOpen: false, query: "" });
    } else {
      set({ isOpen: true, query: "" });
    }
  },

  reset: () => set({ query: "", isOpen: false }),

  filteredResults: () => {
    const { query } = get();
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    const projects = useVaultStore.getState().projects;
    const results: SearchResult[] = [];

    for (const project of projects) {
      // Match on project name
      if (project.name.toLowerCase().includes(normalizedQuery)) {
        results.push({
          project,
          matchedField: "name",
          matchedValue: project.name,
        });
        continue; // Only add each project once, prioritize name match
      }

      // Match on description
      if (project.description.toLowerCase().includes(normalizedQuery)) {
        results.push({
          project,
          matchedField: "description",
          matchedValue: project.description,
        });
        continue;
      }

      // Match on tags
      const matchedTag = project.tags.find((tag) => tag.toLowerCase().includes(normalizedQuery));
      if (matchedTag) {
        results.push({
          project,
          matchedField: "tag",
          matchedValue: matchedTag,
        });
        continue;
      }

      // Match on variable keys across all environments
      let matchedVar: string | null = null;
      for (const env of project.environments) {
        for (const variable of env.variables) {
          if (variable.key.toLowerCase().includes(normalizedQuery)) {
            matchedVar = `${env.name} / ${variable.key}`;
            break;
          }
        }
        if (matchedVar) break;
      }

      if (matchedVar) {
        results.push({
          project,
          matchedField: "variable",
          matchedValue: matchedVar,
        });
      }
    }

    return results;
  },
}));
