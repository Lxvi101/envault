import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from './channels';
import { logger } from '../utils/logger';

export function registerWindowHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        window.minimize();
      }
      return { success: true };
    } catch (error) {
      logger.error('Window minimize error:', error);
      return { success: false, error: 'Failed to minimize window' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        if (window.isMaximized()) {
          window.unmaximize();
        } else {
          window.maximize();
        }
      }
      return { success: true };
    } catch (error) {
      logger.error('Window maximize error:', error);
      return { success: false, error: 'Failed to maximize window' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        window.close();
      }
      return { success: true };
    } catch (error) {
      logger.error('Window close error:', error);
      return { success: false, error: 'Failed to close window' };
    }
  });
}
