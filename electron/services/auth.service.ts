import { vaultService } from './vault.service';
import { storageService } from './storage.service';
import { logger } from '../utils/logger';

interface AuthState {
  isLocked: boolean;
  isFirstRun: boolean;
}

interface AuthResult {
  success: boolean;
  projects?: unknown[];
  error?: string;
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async setup(password: string): Promise<AuthResult> {
    try {
      if (!password || password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters' };
      }

      const projects = await vaultService.initializeWithDemoData(password);

      logger.info('Vault setup complete with demo data');
      return { success: true, projects };
    } catch (error) {
      logger.error('Vault setup failed:', error);
      return { success: false, error: 'Failed to setup vault' };
    }
  }

  async unlock(password: string): Promise<AuthResult> {
    try {
      if (!password) {
        return { success: false, error: 'Password is required' };
      }

      const result = await vaultService.unlock(password);

      if (!result.success) {
        return { success: false, error: 'Invalid password' };
      }

      logger.info('Vault unlocked successfully');
      return { success: true, projects: result.projects };
    } catch (error) {
      logger.error('Vault unlock failed:', error);
      return { success: false, error: 'Failed to unlock vault' };
    }
  }

  lock(): void {
    vaultService.lock();
    logger.info('Vault locked via auth service');
  }

  async checkAuth(): Promise<AuthState> {
    const exists = storageService.vaultExists();
    const isUnlocked = vaultService.isUnlocked();

    return {
      isLocked: !isUnlocked,
      isFirstRun: !exists,
    };
  }
}

export const authService = AuthService.getInstance();
