export const IPC_CHANNELS = {
  // Auth
  AUTH_UNLOCK: 'auth:unlock',
  AUTH_LOCK: 'auth:lock',
  AUTH_SETUP: 'auth:setup',
  AUTH_CHECK: 'auth:check',

  // Vault - Projects
  VAULT_GET_ALL_PROJECTS: 'vault:get-all-projects',
  VAULT_CREATE_PROJECT: 'vault:create-project',
  VAULT_UPDATE_PROJECT: 'vault:update-project',
  VAULT_DELETE_PROJECT: 'vault:delete-project',
  VAULT_TOGGLE_FAVORITE: 'vault:toggle-favorite',

  // Vault - Variables
  VAULT_ADD_VARIABLE: 'vault:add-variable',
  VAULT_UPDATE_VARIABLE: 'vault:update-variable',
  VAULT_DELETE_VARIABLE: 'vault:delete-variable',

  // Vault - Export/Import
  VAULT_EXPORT_ENV: 'vault:export-env',
  VAULT_IMPORT_ENV: 'vault:import-env',

  // Clipboard
  CLIPBOARD_COPY_SECRET: 'clipboard:copy-secret',

  // Window
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',

  // Events (renderer-bound)
  VAULT_CHANGED: 'vault:changed',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
