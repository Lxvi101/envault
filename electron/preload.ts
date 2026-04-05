import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from './ipc/channels';

const api = {
  // Auth
  unlock: (password: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_UNLOCK, password),
  lock: () =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOCK),
  setup: (password: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_SETUP, password),
  checkAuth: () =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_CHECK),

  // Vault - Projects
  getAllProjects: () =>
    ipcRenderer.invoke(IPC_CHANNELS.VAULT_GET_ALL_PROJECTS),
  createProject: (data: Record<string, unknown>) =>
    ipcRenderer.invoke(IPC_CHANNELS.VAULT_CREATE_PROJECT, data),
  updateProject: (id: string, data: Record<string, unknown>) =>
    ipcRenderer.invoke(IPC_CHANNELS.VAULT_UPDATE_PROJECT, id, data),
  deleteProject: (id: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.VAULT_DELETE_PROJECT, id),
  toggleFavorite: (id: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.VAULT_TOGGLE_FAVORITE, id),

  // Vault - Environment Variables
  addVariable: (projectId: string, envId: string, variable: Record<string, unknown>) =>
    ipcRenderer.invoke(IPC_CHANNELS.VAULT_ADD_VARIABLE, projectId, envId, variable),
  updateVariable: (projectId: string, envId: string, varId: string, data: Record<string, unknown>) =>
    ipcRenderer.invoke(IPC_CHANNELS.VAULT_UPDATE_VARIABLE, projectId, envId, varId, data),
  deleteVariable: (projectId: string, envId: string, varId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.VAULT_DELETE_VARIABLE, projectId, envId, varId),

  // Export/Import
  exportEnv: (projectId: string, envId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.VAULT_EXPORT_ENV, projectId, envId),
  importEnv: (projectId: string, envId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.VAULT_IMPORT_ENV, projectId, envId),

  // Clipboard
  copySecret: (value: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_COPY_SECRET, value),

  // Window controls
  minimize: () =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximize: () =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
  close: () =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),

  // Events
  onVaultChanged: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on(IPC_CHANNELS.VAULT_CHANGED, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.VAULT_CHANGED, handler);
    };
  },

  // Platform
  getPlatform: () => process.platform,
};

contextBridge.exposeInMainWorld('api', api);

export type ElectronAPI = typeof api;
