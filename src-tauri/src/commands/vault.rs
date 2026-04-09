use serde::{Deserialize, Serialize};
use tauri::State;

use crate::{
    services::vault::{EnvVariable, Environment, VaultProject},
    state::VaultState,
};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IpcResult<T: Serialize> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T: Serialize> IpcResult<T> {
    fn ok(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    fn err(e: impl Into<String>) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(e.into()),
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VoidResult {
    pub success: bool,
    pub error: Option<String>,
}

impl VoidResult {
    fn ok() -> Self {
        Self { success: true, error: None }
    }
    fn err(e: impl Into<String>) -> Self {
        Self { success: false, error: Some(e.into()) }
    }
}

// ── Project commands ─────────────────────────────────────────────────────────

#[tauri::command]
pub fn get_all_projects(state: State<VaultState>) -> IpcResult<Vec<VaultProject>> {
    let guard = state.lock();
    match guard.vault.get_all_projects() {
        Ok(projects) => IpcResult::ok(projects),
        Err(e) => IpcResult::err(e),
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProjectArgs {
    pub name: Option<String>,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub category: Option<String>,
    pub tags: Option<Vec<String>>,
    pub environments: Option<Vec<Environment>>,
}

#[tauri::command]
pub fn create_project(
    data: CreateProjectArgs,
    state: State<VaultState>,
) -> IpcResult<VaultProject> {
    let mut guard = state.lock();
    match guard.vault.create_project(
        data.name.unwrap_or_else(|| "Untitled Project".to_string()),
        data.description.unwrap_or_default(),
        data.icon.unwrap_or_else(|| "folder".to_string()),
        data.category.unwrap_or_else(|| "other".to_string()),
        data.tags.unwrap_or_default(),
        data.environments,
    ) {
        Ok(project) => IpcResult::ok(project),
        Err(e) => IpcResult::err(e),
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateProjectArgs {
    pub name: Option<String>,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub category: Option<String>,
    pub tags: Option<Vec<String>>,
    pub environments: Option<Vec<Environment>>,
}

#[tauri::command]
pub fn update_project(
    id: String,
    data: UpdateProjectArgs,
    state: State<VaultState>,
) -> IpcResult<VaultProject> {
    let mut guard = state.lock();
    match guard.vault.update_project(
        &id,
        data.name,
        data.description,
        data.icon,
        data.category,
        data.tags,
        data.environments,
    ) {
        Ok(project) => IpcResult::ok(project),
        Err(e) => IpcResult::err(e),
    }
}

#[tauri::command]
pub fn delete_project(id: String, state: State<VaultState>) -> VoidResult {
    let mut guard = state.lock();
    match guard.vault.delete_project(&id) {
        Ok(()) => VoidResult::ok(),
        Err(e) => VoidResult::err(e),
    }
}

#[tauri::command]
pub fn toggle_favorite(id: String, state: State<VaultState>) -> IpcResult<VaultProject> {
    let mut guard = state.lock();
    match guard.vault.toggle_favorite(&id) {
        Ok(project) => IpcResult::ok(project),
        Err(e) => IpcResult::err(e),
    }
}

// ── Variable commands ────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddVariableArgs {
    pub key: Option<String>,
    pub value: Option<String>,
    pub is_secret: Option<bool>,
    pub description: Option<String>,
}

#[tauri::command]
pub fn add_variable(
    project_id: String,
    env_id: String,
    variable: AddVariableArgs,
    state: State<VaultState>,
) -> IpcResult<EnvVariable> {
    let mut guard = state.lock();
    match guard.vault.add_variable(
        &project_id,
        &env_id,
        variable.key.unwrap_or_default(),
        variable.value.unwrap_or_default(),
        variable.is_secret.unwrap_or(true),
        variable.description.unwrap_or_default(),
    ) {
        Ok(var) => IpcResult::ok(var),
        Err(e) => IpcResult::err(e),
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateVariableArgs {
    pub key: Option<String>,
    pub value: Option<String>,
    pub is_secret: Option<bool>,
    pub description: Option<String>,
}

#[tauri::command]
pub fn update_variable(
    project_id: String,
    env_id: String,
    var_id: String,
    data: UpdateVariableArgs,
    state: State<VaultState>,
) -> IpcResult<EnvVariable> {
    let mut guard = state.lock();
    match guard.vault.update_variable(
        &project_id,
        &env_id,
        &var_id,
        data.key,
        data.value,
        data.is_secret,
        data.description,
    ) {
        Ok(var) => IpcResult::ok(var),
        Err(e) => IpcResult::err(e),
    }
}

#[tauri::command]
pub fn delete_variable(
    project_id: String,
    env_id: String,
    var_id: String,
    state: State<VaultState>,
) -> VoidResult {
    let mut guard = state.lock();
    match guard.vault.delete_variable(&project_id, &env_id, &var_id) {
        Ok(()) => VoidResult::ok(),
        Err(e) => VoidResult::err(e),
    }
}
