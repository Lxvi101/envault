import type { EnvVariable, VaultProject } from "./vault";

export interface ElectronAPI {
  unlock: (password: string) => Promise<{ success: boolean; projects?: VaultProject[] }>;
  lock: () => Promise<void>;
  setup: (password: string) => Promise<{ success: boolean }>;
  checkAuth: () => Promise<{ isLocked: boolean; isFirstRun: boolean }>;
  getAllProjects: () => Promise<VaultProject[]>;
  createProject: (data: Partial<VaultProject>) => Promise<VaultProject>;
  updateProject: (id: string, data: Partial<VaultProject>) => Promise<VaultProject>;
  deleteProject: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<VaultProject>;
  addVariable: (projectId: string, envId: string, variable: Partial<EnvVariable>) => Promise<EnvVariable>;
  updateVariable: (
    projectId: string,
    envId: string,
    varId: string,
    data: Partial<EnvVariable>,
  ) => Promise<EnvVariable>;
  deleteVariable: (projectId: string, envId: string, varId: string) => Promise<void>;
  exportEnv: (projectId: string, envId: string) => Promise<{ success: boolean; path?: string }>;
  importEnv: (projectId: string, envId: string) => Promise<{ success: boolean; count?: number }>;
  copySecret: (value: string) => Promise<void>;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  onVaultChanged: (callback: () => void) => () => void;
  getPlatform: () => Promise<string>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};
