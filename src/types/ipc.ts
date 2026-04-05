import type { EnvVariable, VaultProject } from "./vault";

// ── Auth channels ──────────────────────────────────────────────────────────

export interface UnlockRequest {
  password: string;
}

export interface UnlockResponse {
  success: boolean;
  projects?: VaultProject[];
  error?: string;
}

export interface SetupRequest {
  password: string;
}

export interface SetupResponse {
  success: boolean;
  error?: string;
}

export interface CheckAuthResponse {
  isLocked: boolean;
  isFirstRun: boolean;
}

// ── Project channels ───────────────────────────────────────────────────────

export interface CreateProjectRequest {
  data: Partial<VaultProject>;
}

export interface CreateProjectResponse {
  project: VaultProject;
}

export interface UpdateProjectRequest {
  id: string;
  data: Partial<VaultProject>;
}

export interface UpdateProjectResponse {
  project: VaultProject;
}

export interface DeleteProjectRequest {
  id: string;
}

export interface ToggleFavoriteRequest {
  id: string;
}

export interface ToggleFavoriteResponse {
  project: VaultProject;
}

// ── Variable channels ──────────────────────────────────────────────────────

export interface AddVariableRequest {
  projectId: string;
  envId: string;
  variable: Partial<EnvVariable>;
}

export interface AddVariableResponse {
  variable: EnvVariable;
}

export interface UpdateVariableRequest {
  projectId: string;
  envId: string;
  varId: string;
  data: Partial<EnvVariable>;
}

export interface UpdateVariableResponse {
  variable: EnvVariable;
}

export interface DeleteVariableRequest {
  projectId: string;
  envId: string;
  varId: string;
}

// ── Import / Export channels ───────────────────────────────────────────────

export interface ExportEnvRequest {
  projectId: string;
  envId: string;
}

export interface ExportEnvResponse {
  success: boolean;
  path?: string;
  error?: string;
}

export interface ImportEnvRequest {
  projectId: string;
  envId: string;
}

export interface ImportEnvResponse {
  success: boolean;
  count?: number;
  error?: string;
}

// ── Clipboard channel ──────────────────────────────────────────────────────

export interface CopySecretRequest {
  value: string;
}

// ── Window controls ────────────────────────────────────────────────────────

export type WindowAction = "minimize" | "maximize" | "close";

// ── Platform channel ───────────────────────────────────────────────────────

export interface GetPlatformResponse {
  platform: string;
}

// ── Channel map ────────────────────────────────────────────────────────────

export interface IPCChannelMap {
  "vault:unlock": { request: UnlockRequest; response: UnlockResponse };
  "vault:lock": { request: void; response: void };
  "vault:setup": { request: SetupRequest; response: SetupResponse };
  "vault:check-auth": { request: void; response: CheckAuthResponse };
  "projects:get-all": { request: void; response: VaultProject[] };
  "projects:create": { request: CreateProjectRequest; response: CreateProjectResponse };
  "projects:update": { request: UpdateProjectRequest; response: UpdateProjectResponse };
  "projects:delete": { request: DeleteProjectRequest; response: void };
  "projects:toggle-favorite": { request: ToggleFavoriteRequest; response: ToggleFavoriteResponse };
  "variables:add": { request: AddVariableRequest; response: AddVariableResponse };
  "variables:update": { request: UpdateVariableRequest; response: UpdateVariableResponse };
  "variables:delete": { request: DeleteVariableRequest; response: void };
  "env:export": { request: ExportEnvRequest; response: ExportEnvResponse };
  "env:import": { request: ImportEnvRequest; response: ImportEnvResponse };
  "clipboard:copy-secret": { request: CopySecretRequest; response: void };
  "window:minimize": { request: void; response: void };
  "window:maximize": { request: void; response: void };
  "window:close": { request: void; response: void };
  "platform:get": { request: void; response: GetPlatformResponse };
}

export type IPCChannel = keyof IPCChannelMap;
