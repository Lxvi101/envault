use serde::Serialize;
use tauri::State;

use crate::{
    services::{
        auth as auth_service,
        vault::VaultProject,
    },
    state::VaultState,
};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckAuthResponse {
    pub is_locked: bool,
    pub is_first_run: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UnlockResponse {
    pub success: bool,
    pub projects: Option<Vec<VaultProject>>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetupResponse {
    pub success: bool,
    pub projects: Option<Vec<VaultProject>>,
    pub error: Option<String>,
}

#[tauri::command]
pub fn check_auth(state: State<VaultState>) -> CheckAuthResponse {
    let mut guard = state.lock();
    let auth = auth_service::check_auth(&mut guard);
    CheckAuthResponse {
        is_locked: auth.is_locked,
        is_first_run: auth.is_first_run,
    }
}

#[tauri::command]
pub fn unlock(password: String, state: State<VaultState>) -> UnlockResponse {
    let mut guard = state.lock();
    match auth_service::unlock(&mut guard, &password) {
        Ok(projects) => UnlockResponse {
            success: true,
            projects: Some(projects),
            error: None,
        },
        Err(e) => UnlockResponse {
            success: false,
            projects: None,
            error: Some(e),
        },
    }
}

#[tauri::command]
pub fn lock(state: State<VaultState>) {
    let mut guard = state.lock();
    auth_service::lock(&mut guard);
}

#[tauri::command]
pub fn setup(password: String, state: State<VaultState>) -> SetupResponse {
    let mut guard = state.lock();
    match auth_service::setup(&mut guard, &password) {
        Ok(projects) => SetupResponse {
            success: true,
            projects: Some(projects),
            error: None,
        },
        Err(e) => SetupResponse {
            success: false,
            projects: None,
            error: Some(e),
        },
    }
}
