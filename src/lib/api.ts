import type { EnvVariable, VaultProject } from "../types/vault";

/**
 * Typed wrapper around window.api for use in renderer components.
 * All methods swallow rejections and return typed results or throw
 * descriptive errors so callers can surface toasts.
 */

function getApi() {
  if (!window.api) {
    throw new Error("Electron API not available. Are you running outside of Electron?");
  }
  return window.api;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export async function checkAuth(): Promise<{ isLocked: boolean; isFirstRun: boolean }> {
  try {
    return await getApi().checkAuth();
  } catch (err) {
    throw new Error(`Failed to check auth status: ${errorMessage(err)}`);
  }
}

export async function unlock(
  password: string,
): Promise<{ success: boolean; projects?: VaultProject[] }> {
  try {
    return await getApi().unlock(password);
  } catch (err) {
    throw new Error(`Failed to unlock vault: ${errorMessage(err)}`);
  }
}

export async function lock(): Promise<void> {
  try {
    await getApi().lock();
  } catch (err) {
    throw new Error(`Failed to lock vault: ${errorMessage(err)}`);
  }
}

export async function setup(password: string): Promise<{ success: boolean }> {
  try {
    return await getApi().setup(password);
  } catch (err) {
    throw new Error(`Failed to set up vault: ${errorMessage(err)}`);
  }
}

// ── Projects ───────────────────────────────────────────────────────────────

export async function getAllProjects(): Promise<VaultProject[]> {
  try {
    return await getApi().getAllProjects();
  } catch (err) {
    throw new Error(`Failed to fetch projects: ${errorMessage(err)}`);
  }
}

export async function createProject(data: Partial<VaultProject>): Promise<VaultProject> {
  try {
    return await getApi().createProject(data);
  } catch (err) {
    throw new Error(`Failed to create project: ${errorMessage(err)}`);
  }
}

export async function updateProject(
  id: string,
  data: Partial<VaultProject>,
): Promise<VaultProject> {
  try {
    return await getApi().updateProject(id, data);
  } catch (err) {
    throw new Error(`Failed to update project: ${errorMessage(err)}`);
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await getApi().deleteProject(id);
  } catch (err) {
    throw new Error(`Failed to delete project: ${errorMessage(err)}`);
  }
}

export async function toggleFavorite(id: string): Promise<VaultProject> {
  try {
    return await getApi().toggleFavorite(id);
  } catch (err) {
    throw new Error(`Failed to toggle favorite: ${errorMessage(err)}`);
  }
}

// ── Variables ──────────────────────────────────────────────────────────────

export async function addVariable(
  projectId: string,
  envId: string,
  variable: Partial<EnvVariable>,
): Promise<EnvVariable> {
  try {
    return await getApi().addVariable(projectId, envId, variable);
  } catch (err) {
    throw new Error(`Failed to add variable: ${errorMessage(err)}`);
  }
}

export async function updateVariable(
  projectId: string,
  envId: string,
  varId: string,
  data: Partial<EnvVariable>,
): Promise<EnvVariable> {
  try {
    return await getApi().updateVariable(projectId, envId, varId, data);
  } catch (err) {
    throw new Error(`Failed to update variable: ${errorMessage(err)}`);
  }
}

export async function deleteVariable(
  projectId: string,
  envId: string,
  varId: string,
): Promise<void> {
  try {
    await getApi().deleteVariable(projectId, envId, varId);
  } catch (err) {
    throw new Error(`Failed to delete variable: ${errorMessage(err)}`);
  }
}

// ── Import / Export ────────────────────────────────────────────────────────

export async function exportEnv(
  projectId: string,
  envId: string,
): Promise<{ success: boolean; path?: string }> {
  try {
    return await getApi().exportEnv(projectId, envId);
  } catch (err) {
    throw new Error(`Failed to export .env file: ${errorMessage(err)}`);
  }
}

export async function importEnv(
  projectId: string,
  envId: string,
): Promise<{ success: boolean; count?: number }> {
  try {
    return await getApi().importEnv(projectId, envId);
  } catch (err) {
    throw new Error(`Failed to import .env file: ${errorMessage(err)}`);
  }
}

// ── Clipboard ──────────────────────────────────────────────────────────────

export async function copySecret(value: string): Promise<void> {
  try {
    await getApi().copySecret(value);
  } catch (err) {
    throw new Error(`Failed to copy to clipboard: ${errorMessage(err)}`);
  }
}

// ── Window Controls ────────────────────────────────────────────────────────

export function minimize(): void {
  getApi().minimize();
}

export function maximize(): void {
  getApi().maximize();
}

export function close(): void {
  getApi().close();
}

// ── Platform ───────────────────────────────────────────────────────────────

export async function getPlatform(): Promise<string> {
  try {
    return await getApi().getPlatform();
  } catch (err) {
    throw new Error(`Failed to get platform: ${errorMessage(err)}`);
  }
}

// ── Vault Changed Listener ─────────────────────────────────────────────────

export function onVaultChanged(callback: () => void): () => void {
  return getApi().onVaultChanged(callback);
}

// ── Helpers ────────────────────────────────────────────────────────────────

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}
