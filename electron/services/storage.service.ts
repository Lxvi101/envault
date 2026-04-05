import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import chokidar from 'chokidar';
import { getVaultFilePath, getVaultDirectory } from '../utils/paths';
import { logger } from '../utils/logger';

interface EncryptedVault {
  version: number;
  salt: string;
  iv: string;
  authTag: string;
  ciphertext: string;
  createdAt: string;
  modifiedAt: string;
}

class StorageService {
  private static instance: StorageService;
  private watcher: chokidar.FSWatcher | null = null;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  getVaultDir(): string {
    return getVaultDirectory();
  }

  ensureVaultDir(): void {
    const dir = this.getVaultDir();
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      logger.info('Created vault directory:', dir);
    }
  }

  readVaultFile(): EncryptedVault | null {
    const filePath = getVaultFilePath();
    if (!existsSync(filePath)) {
      return null;
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as EncryptedVault;
    } catch (error) {
      logger.error('Failed to read vault file:', error);
      return null;
    }
  }

  writeVaultFile(data: EncryptedVault): void {
    this.ensureVaultDir();
    const filePath = getVaultFilePath();
    const dir = dirname(filePath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    try {
      writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      logger.info('Vault file written successfully');
    } catch (error) {
      logger.error('Failed to write vault file:', error);
      throw new Error('Failed to write vault file');
    }
  }

  watchForChanges(callback: () => void): void {
    const filePath = getVaultFilePath();

    if (this.watcher) {
      this.watcher.close();
    }

    this.ensureVaultDir();

    this.watcher = chokidar.watch(filePath, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100,
      },
    });

    this.watcher.on('change', () => {
      logger.info('Vault file changed externally');
      callback();
    });

    this.watcher.on('error', (error) => {
      logger.error('Watcher error:', error);
    });

    logger.info('Watching vault file for changes');
  }

  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      logger.info('Stopped watching vault file');
    }
  }

  vaultExists(): boolean {
    return existsSync(getVaultFilePath());
  }
}

export const storageService = StorageService.getInstance();
