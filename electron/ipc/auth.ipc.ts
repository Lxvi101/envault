import { ipcMain } from 'electron';
import { IPC_CHANNELS } from './channels';
import { authService } from '../services/auth.service';
import { logger } from '../utils/logger';

export function registerAuthHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.AUTH_UNLOCK, async (_event, password: string) => {
    try {
      const result = await authService.unlock(password);
      logger.info('Vault unlock attempt:', result.success ? 'success' : 'failed');
      return result;
    } catch (error) {
      logger.error('Auth unlock error:', error);
      return { success: false, error: 'Failed to unlock vault' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_LOCK, async () => {
    try {
      authService.lock();
      logger.info('Vault locked');
      return { success: true };
    } catch (error) {
      logger.error('Auth lock error:', error);
      return { success: false, error: 'Failed to lock vault' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_SETUP, async (_event, password: string) => {
    try {
      const result = await authService.setup(password);
      logger.info('Vault setup:', result.success ? 'success' : 'failed');
      return result;
    } catch (error) {
      logger.error('Auth setup error:', error);
      return { success: false, error: 'Failed to setup vault' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_CHECK, async () => {
    try {
      const result = await authService.checkAuth();
      return result;
    } catch (error) {
      logger.error('Auth check error:', error);
      return { isLocked: true, isFirstRun: true };
    }
  });
}
