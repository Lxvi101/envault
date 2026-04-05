import { ipcMain } from 'electron';
import { IPC_CHANNELS } from './channels';
import { clipboardService } from '../services/clipboard.service';
import { logger } from '../utils/logger';

export function registerClipboardHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_COPY_SECRET, async (_event, value: string) => {
    try {
      clipboardService.copyToClipboard(value);
      logger.info('Secret copied to clipboard (will auto-clear in 30s)');
      return { success: true };
    } catch (error) {
      logger.error('Clipboard copy error:', error);
      return { success: false, error: 'Failed to copy to clipboard' };
    }
  });
}
