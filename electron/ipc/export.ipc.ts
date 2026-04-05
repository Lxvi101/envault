import { ipcMain, dialog, BrowserWindow } from 'electron';
import { writeFile, readFile } from 'node:fs/promises';
import { IPC_CHANNELS } from './channels';
import { vaultService } from '../services/vault.service';
import { logger } from '../utils/logger';

export function registerExportHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.VAULT_EXPORT_ENV, async (_event, projectId: string, envId: string) => {
    try {
      const envContent = vaultService.exportEnv(projectId, envId);
      if (!envContent) {
        return { success: false, error: 'No environment data found' };
      }

      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (!focusedWindow) {
        return { success: false, error: 'No active window' };
      }

      const result = await dialog.showSaveDialog(focusedWindow, {
        title: 'Export Environment Variables',
        defaultPath: '.env',
        filters: [
          { name: 'Environment Files', extensions: ['env'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Export cancelled' };
      }

      await writeFile(result.filePath, envContent, 'utf-8');
      logger.info('Environment exported to:', result.filePath);
      return { success: true, filePath: result.filePath };
    } catch (error) {
      logger.error('Export env error:', error);
      return { success: false, error: 'Failed to export environment' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.VAULT_IMPORT_ENV, async (_event, projectId: string, envId: string) => {
    try {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (!focusedWindow) {
        return { success: false, error: 'No active window' };
      }

      const result = await dialog.showOpenDialog(focusedWindow, {
        title: 'Import Environment Variables',
        filters: [
          { name: 'Environment Files', extensions: ['env', 'env.local', 'env.development', 'env.production', 'env.staging'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'Import cancelled' };
      }

      const content = await readFile(result.filePaths[0], 'utf-8');
      const variables = await vaultService.importEnv(content, projectId, envId);
      logger.info(`Imported ${variables.length} variables from:`, result.filePaths[0]);
      return { success: true, data: variables, count: variables.length };
    } catch (error) {
      logger.error('Import env error:', error);
      return { success: false, error: 'Failed to import environment' };
    }
  });
}
