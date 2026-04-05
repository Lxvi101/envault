import { create } from "zustand";
import * as api from "../lib/api";
import type { EnvVariable, Environment, VaultProject } from "../types/vault";

interface VaultState {
  projects: VaultProject[];
  selectedProjectId: string | null;
  selectedEnvironmentId: string | null;
  isLoading: boolean;

  // Setters
  setProjects: (projects: VaultProject[]) => void;
  selectProject: (id: string | null) => void;
  selectEnvironment: (id: string | null) => void;

  // CRUD
  createProject: (data: Partial<VaultProject>) => Promise<void>;
  updateProject: (id: string, data: Partial<VaultProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addVariable: (projectId: string, envId: string, variable: Partial<EnvVariable>) => Promise<void>;
  updateVariable: (
    projectId: string,
    envId: string,
    varId: string,
    data: Partial<EnvVariable>,
  ) => Promise<void>;
  deleteVariable: (projectId: string, envId: string, varId: string) => Promise<void>;

  // Refresh
  refreshProjects: () => Promise<void>;

  // Computed accessors
  selectedProject: () => VaultProject | undefined;
  selectedEnvironment: () => Environment | undefined;
  favoriteProjects: () => VaultProject[];
}

export const useVaultStore = create<VaultState>((set, get) => ({
  projects: [],
  selectedProjectId: null,
  selectedEnvironmentId: null,
  isLoading: false,

  // ── Setters ────────────────────────────────────────────────────────────

  setProjects: (projects) => set({ projects }),

  selectProject: (id) => {
    const state = get();
    set({ selectedProjectId: id });

    // Auto-select the first environment of the newly selected project
    if (id) {
      const project = state.projects.find((p) => p.id === id);
      if (project && project.environments.length > 0) {
        set({ selectedEnvironmentId: project.environments[0].id });
      } else {
        set({ selectedEnvironmentId: null });
      }
    } else {
      set({ selectedEnvironmentId: null });
    }
  },

  selectEnvironment: (id) => set({ selectedEnvironmentId: id }),

  // ── Project CRUD ───────────────────────────────────────────────────────

  createProject: async (data) => {
    set({ isLoading: true });
    try {
      const project = await api.createProject(data);
      set((state) => ({
        projects: [...state.projects, project],
        selectedProjectId: project.id,
        selectedEnvironmentId:
          project.environments.length > 0 ? project.environments[0].id : null,
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to create project");
    }
  },

  updateProject: async (id, data) => {
    set({ isLoading: true });
    try {
      const updated = await api.updateProject(id, data);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updated : p)),
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to update project");
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true });
    try {
      await api.deleteProject(id);
      set((state) => {
        const projects = state.projects.filter((p) => p.id !== id);
        const wasSelected = state.selectedProjectId === id;
        return {
          projects,
          selectedProjectId: wasSelected ? (projects[0]?.id ?? null) : state.selectedProjectId,
          selectedEnvironmentId: wasSelected
            ? (projects[0]?.environments[0]?.id ?? null)
            : state.selectedEnvironmentId,
          isLoading: false,
        };
      });
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to delete project");
    }
  },

  toggleFavorite: async (id) => {
    try {
      const updated = await api.toggleFavorite(id);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updated : p)),
      }));
    } catch {
      throw new Error("Failed to toggle favorite");
    }
  },

  // ── Variable CRUD ──────────────────────────────────────────────────────

  addVariable: async (projectId, envId, variable) => {
    try {
      const created = await api.addVariable(projectId, envId, variable);
      set((state) => ({
        projects: state.projects.map((p) => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            environments: p.environments.map((env) => {
              if (env.id !== envId) return env;
              return { ...env, variables: [...env.variables, created] };
            }),
          };
        }),
      }));
    } catch {
      throw new Error("Failed to add variable");
    }
  },

  updateVariable: async (projectId, envId, varId, data) => {
    try {
      const updated = await api.updateVariable(projectId, envId, varId, data);
      set((state) => ({
        projects: state.projects.map((p) => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            environments: p.environments.map((env) => {
              if (env.id !== envId) return env;
              return {
                ...env,
                variables: env.variables.map((v) => (v.id === varId ? updated : v)),
              };
            }),
          };
        }),
      }));
    } catch {
      throw new Error("Failed to update variable");
    }
  },

  deleteVariable: async (projectId, envId, varId) => {
    try {
      await api.deleteVariable(projectId, envId, varId);
      set((state) => ({
        projects: state.projects.map((p) => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            environments: p.environments.map((env) => {
              if (env.id !== envId) return env;
              return {
                ...env,
                variables: env.variables.filter((v) => v.id !== varId),
              };
            }),
          };
        }),
      }));
    } catch {
      throw new Error("Failed to delete variable");
    }
  },

  // ── Refresh ────────────────────────────────────────────────────────────

  refreshProjects: async () => {
    set({ isLoading: true });
    try {
      const projects = await api.getAllProjects();
      set({ projects, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // ── Computed ───────────────────────────────────────────────────────────

  selectedProject: () => {
    const state = get();
    return state.projects.find((p) => p.id === state.selectedProjectId);
  },

  selectedEnvironment: () => {
    const state = get();
    const project = state.projects.find((p) => p.id === state.selectedProjectId);
    if (!project) return undefined;
    return project.environments.find((e) => e.id === state.selectedEnvironmentId);
  },

  favoriteProjects: () => {
    return get().projects.filter((p) => p.isFavorite);
  },
}));
