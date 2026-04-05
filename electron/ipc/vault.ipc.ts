import { ipcMain } from 'electron';
import { IPC_CHANNELS } from './channels';
import { vaultService } from '../services/vault.service';
import { logger } from '../utils/logger';

export function registerVaultHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.VAULT_GET_ALL_PROJECTS, async () => {
    try {
      const projects = vaultService.getAllProjects();
      return { success: true, data: projects };
    } catch (error) {
      logger.error('Get all projects error:', error);
      return { success: false, error: 'Failed to get projects' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.VAULT_CREATE_PROJECT, async (_event, data: Record<string, unknown>) => {
    try {
      const project = await vaultService.createProject(data);
      return { success: true, data: project };
    } catch (error) {
      logger.error('Create project error:', error);
      return { success: false, error: 'Failed to create project' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.VAULT_UPDATE_PROJECT, async (_event, id: string, data: Record<string, unknown>) => {
    try {
      const project = await vaultService.updateProject(id, data);
      return { success: true, data: project };
    } catch (error) {
      logger.error('Update project error:', error);
      return { success: false, error: 'Failed to update project' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.VAULT_DELETE_PROJECT, async (_event, id: string) => {
    try {
      await vaultService.deleteProject(id);
      return { success: true };
    } catch (error) {
      logger.error('Delete project error:', error);
      return { success: false, error: 'Failed to delete project' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.VAULT_TOGGLE_FAVORITE, async (_event, id: string) => {
    try {
      const project = await vaultService.toggleFavorite(id);
      return { success: true, data: project };
    } catch (error) {
      logger.error('Toggle favorite error:', error);
      return { success: false, error: 'Failed to toggle favorite' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.VAULT_ADD_VARIABLE, async (_event, projectId: string, envId: string, variable: Record<string, unknown>) => {
    try {
      const result = await vaultService.addVariable(projectId, envId, variable);
      return { success: true, data: result };
    } catch (error) {
      logger.error('Add variable error:', error);
      return { success: false, error: 'Failed to add variable' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.VAULT_UPDATE_VARIABLE, async (_event, projectId: string, envId: string, varId: string, data: Record<string, unknown>) => {
    try {
      const result = await vaultService.updateVariable(projectId, envId, varId, data);
      return { success: true, data: result };
    } catch (error) {
      logger.error('Update variable error:', error);
      return { success: false, error: 'Failed to update variable' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.VAULT_DELETE_VARIABLE, async (_event, projectId: string, envId: string, varId: string) => {
    try {
      await vaultService.deleteVariable(projectId, envId, varId);
      return { success: true };
    } catch (error) {
      logger.error('Delete variable error:', error);
      return { success: false, error: 'Failed to delete variable' };
    }
  });
}
