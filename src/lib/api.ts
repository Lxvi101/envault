import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { type } from "@tauri-apps/plugin-os";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { EnvVariable, VaultProject } from "../types/vault";

/**
 * Typed wrapper around Tauri `invoke` for use in renderer components.
 * All methods swallow rejections and return typed results or throw
 * descriptive errors so callers can surface toasts.
 *
 * Command names match the Rust #[tauri::command] function names
 * (snake_case is automatically converted from camelCase by Tauri).
 */

// ── Auth ───────────────────────────────────────────────────────────────────

export async function checkAuth(): Promise<{ isLocked: boolean; isFirstRun: boolean; yoloMode: boolean; projects?: VaultProject[] }> {
  try {
    return await invoke<{ isLocked: boolean; isFirstRun: boolean; yoloMode: boolean; projects?: VaultProject[] }>("check_auth");
  } catch (err) {
    throw new Error(`Failed to check auth status: ${errorMessage(err)}`);
  }
}

export async function unlock(
  password: string,
): Promise<{ success: boolean; projects?: VaultProject[] }> {
  try {
    return await invoke<{ success: boolean; projects?: VaultProject[] }>("unlock", { password });
  } catch (err) {
    throw new Error(`Failed to unlock vault: ${errorMessage(err)}`);
  }
}

export async function lock(): Promise<void> {
  try {
    await invoke("lock");
  } catch (err) {
    throw new Error(`Failed to lock vault: ${errorMessage(err)}`);
  }
}

export async function setup(password: string): Promise<{ success: boolean; projects?: VaultProject[] }> {
  try {
    return await invoke<{ success: boolean; projects?: VaultProject[] }>("setup", { password });
  } catch (err) {
    throw new Error(`Failed to set up vault: ${errorMessage(err)}`);
  }
}

// ── YOLO Mode ─────────────────────────────────────────────────────────────

export async function enableYoloMode(password: string): Promise<{ success: boolean; enabled: boolean; error?: string }> {
  try {
    return await invoke<{ success: boolean; enabled: boolean; error?: string }>("enable_yolo_mode", { password });
  } catch (err) {
    throw new Error(`Failed to enable YOLO mode: ${errorMessage(err)}`);
  }
}

export async function disableYoloMode(): Promise<{ success: boolean; enabled: boolean; error?: string }> {
  try {
    return await invoke<{ success: boolean; enabled: boolean; error?: string }>("disable_yolo_mode");
  } catch (err) {
    throw new Error(`Failed to disable YOLO mode: ${errorMessage(err)}`);
  }
}

// ── Projects ───────────────────────────────────────────────────────────────

type IpcResult<T> = { success: boolean; data?: T; error?: string };

export async function getAllProjects(): Promise<VaultProject[]> {
  try {
    const result = await invoke<IpcResult<VaultProject[]>>("get_all_projects");
    if (!result.success || !result.data) throw new Error(result.error ?? "Failed to get projects");
    return result.data;
  } catch (err) {
    throw new Error(`Failed to fetch projects: ${errorMessage(err)}`);
  }
}

export async function createProject(data: Partial<VaultProject>): Promise<VaultProject> {
  try {
    const result = await invoke<IpcResult<VaultProject>>("create_project", { data });
    if (!result.success || !result.data) throw new Error(result.error ?? "Failed to create project");
    return result.data;
  } catch (err) {
    throw new Error(`Failed to create project: ${errorMessage(err)}`);
  }
}

export async function updateProject(
  id: string,
  data: Partial<VaultProject>,
): Promise<VaultProject> {
  try {
    const result = await invoke<IpcResult<VaultProject>>("update_project", { id, data });
    if (!result.success || !result.data) throw new Error(result.error ?? "Failed to update project");
    return result.data;
  } catch (err) {
    throw new Error(`Failed to update project: ${errorMessage(err)}`);
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const result = await invoke<{ success: boolean; error?: string }>("delete_project", { id });
    if (!result.success) throw new Error(result.error ?? "Failed to delete project");
  } catch (err) {
    throw new Error(`Failed to delete project: ${errorMessage(err)}`);
  }
}

export async function toggleFavorite(id: string): Promise<VaultProject> {
  try {
    const result = await invoke<IpcResult<VaultProject>>("toggle_favorite", { id });
    if (!result.success || !result.data) throw new Error(result.error ?? "Failed to toggle favorite");
    return result.data;
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
    const result = await invoke<IpcResult<EnvVariable>>("add_variable", {
      projectId,
      envId,
      variable,
    });
    if (!result.success || !result.data) throw new Error(result.error ?? "Failed to add variable");
    return result.data;
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
    const result = await invoke<IpcResult<EnvVariable>>("update_variable", {
      projectId,
      envId,
      varId,
      data,
    });
    if (!result.success || !result.data) throw new Error(result.error ?? "Failed to update variable");
    return result.data;
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
    const result = await invoke<{ success: boolean; error?: string }>("delete_variable", {
      projectId,
      envId,
      varId,
    });
    if (!result.success) throw new Error(result.error ?? "Failed to delete variable");
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
    const result = await invoke<{ success: boolean; filePath?: string; error?: string }>(
      "export_env",
      { projectId, envId },
    );
    if (!result.success) {
      if (result.error === "Export cancelled") {
        return { success: false };
      }
      throw new Error(result.error ?? "Failed to export .env file");
    }
    return { success: true, path: result.filePath };
  } catch (err) {
    throw new Error(`Failed to export .env file: ${errorMessage(err)}`);
  }
}

export async function importEnv(
  projectId: string,
  envId: string,
): Promise<{ success: boolean; count?: number }> {
  try {
    const result = await invoke<{ success: boolean; count?: number; error?: string }>("import_env", {
      projectId,
      envId,
    });
    if (!result.success) {
      if (result.error === "Import cancelled") {
        return { success: false };
      }
      throw new Error(result.error ?? "Failed to import .env file");
    }
    return result;
  } catch (err) {
    throw new Error(`Failed to import .env file: ${errorMessage(err)}`);
  }
}

// ── Clipboard ──────────────────────────────────────────────────────────────

export async function copySecret(value: string): Promise<void> {
  try {
    const result = await invoke<{ success: boolean; error?: string }>("copy_secret", { value });
    if (!result.success) {
      throw new Error(result.error ?? "Failed to copy to clipboard");
    }
  } catch (err) {
    throw new Error(`Failed to copy to clipboard: ${errorMessage(err)}`);
  }
}

// ── Window Controls ────────────────────────────────────────────────────────

export function minimize(): void {
  getCurrentWindow().minimize().catch(console.error);
}

export function maximize(): void {
  getCurrentWindow()
    .isMaximized()
    .then((maximized) => {
      if (maximized) {
        getCurrentWindow().unmaximize();
      } else {
        getCurrentWindow().maximize();
      }
    })
    .catch(console.error);
}

export function close(): void {
  getCurrentWindow().close().catch(console.error);
}

// ── Platform ───────────────────────────────────────────────────────────────

export async function getPlatform(): Promise<string> {
  try {
    // tauri-plugin-os returns values like 'macos', 'linux', 'windows'
    // Map to match the original Electron values: 'darwin', 'linux', 'win32'
    const osType = await type();
    if (osType === "macos") return "darwin";
    if (osType === "windows") return "win32";
    return osType;
  } catch (err) {
    throw new Error(`Failed to get platform: ${errorMessage(err)}`);
  }
}

// ── Vault Changed Listener ─────────────────────────────────────────────────

export function onVaultChanged(callback: () => void): () => void {
  // Use Tauri's event system instead of Electron IPC channel.
  // `listen` returns a Promise<UnlistenFn>; we hold the unlisten fn in a
  // closure so the caller can clean up synchronously.
  let unlisten: (() => void) | null = null;

  listen("vault-changed", callback).then((fn) => {
    unlisten = fn;
  });

  return () => {
    if (unlisten) unlisten();
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}
