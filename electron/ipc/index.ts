import { registerAuthHandlers } from './auth.ipc';
import { registerVaultHandlers } from './vault.ipc';
import { registerClipboardHandlers } from './clipboard.ipc';
import { registerExportHandlers } from './export.ipc';
import { registerWindowHandlers } from './window.ipc';
import { logger } from '../utils/logger';

export function registerAllIpcHandlers(): void {
  registerAuthHandlers();
  registerVaultHandlers();
  registerClipboardHandlers();
  registerExportHandlers();
  registerWindowHandlers();
  logger.info('All IPC handlers registered');
}
