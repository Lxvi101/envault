import { join } from 'node:path';
import { homedir, platform } from 'node:os';

const VAULT_FILENAME = 'vault.envault';
const ICLOUD_CONTAINER = 'com~apple~CloudDocs';
const APP_FOLDER = 'EnVault';
const FALLBACK_DIR = '.envault';
const FALLBACK_SUBDIR = 'data';

export function getVaultDirectory(): string {
  const home = homedir();
  const currentPlatform = platform();

  if (currentPlatform === 'darwin') {
    return join(home, 'Library', 'Mobile Documents', ICLOUD_CONTAINER, APP_FOLDER);
  }

  return join(home, FALLBACK_DIR, FALLBACK_SUBDIR);
}

export function getVaultFilePath(): string {
  return join(getVaultDirectory(), VAULT_FILENAME);
}
