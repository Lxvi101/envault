import { clipboard } from 'electron';
import { logger } from '../utils/logger';

const AUTO_CLEAR_DELAY_MS = 30000;

class ClipboardService {
  private static instance: ClipboardService;
  private clearTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor() {}

  static getInstance(): ClipboardService {
    if (!ClipboardService.instance) {
      ClipboardService.instance = new ClipboardService();
    }
    return ClipboardService.instance;
  }

  copyToClipboard(text: string): void {
    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
      this.clearTimer = null;
    }

    clipboard.writeText(text);
    logger.info('Text copied to clipboard');

    this.clearTimer = setTimeout(() => {
      this.clearClipboard();
      this.clearTimer = null;
      logger.info('Clipboard auto-cleared after 30 seconds');
    }, AUTO_CLEAR_DELAY_MS);
  }

  clearClipboard(): void {
    clipboard.writeText('');

    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
      this.clearTimer = null;
    }

    logger.info('Clipboard cleared');
  }
}

export const clipboardService = ClipboardService.getInstance();
