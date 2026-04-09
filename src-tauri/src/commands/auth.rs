use serde::Serialize;
use tauri::State;

use crate::{
    services::{
        auth as auth_service,
        vault::VaultProject,
        yolo,
    },
    state::VaultState,
};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckAuthResponse {
    pub is_locked: bool,
    pub is_first_run: bool,
    pub yolo_mode: bool,
    pub projects: Option<Vec<VaultProject>>,
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

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct YoloResponse {
    pub success: bool,
    pub enabled: bool,
    pub error: Option<String>,
}

#[tauri::command]
pub fn check_auth(state: State<VaultState>) -> CheckAuthResponse {
    let mut guard = state.lock();
    let auth = auth_service::check_auth(&mut guard);

    // If YOLO auto-unlocked, include projects
    let projects = if !auth.is_locked {
        guard.vault.get_all_projects().ok()
    } else {
        None
    };

    CheckAuthResponse {
        is_locked: auth.is_locked,
        is_first_run: auth.is_first_run,
        yolo_mode: auth.yolo_mode,
        projects,
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

#[tauri::command]
pub fn enable_yolo_mode(password: String, state: State<VaultState>) -> YoloResponse {
    // Verify the password is correct first by attempting unlock
    let mut guard = state.lock();
    if !guard.vault.is_unlocked() {
        match guard.vault.unlock(&password) {
            Ok(_) => {}
            Err(_) => {
                return YoloResponse {
                    success: false,
                    enabled: false,
                    error: Some("Invalid password".to_string()),
                };
            }
        }
    }

    match yolo::enable_yolo(&password) {
        Ok(()) => YoloResponse {
            success: true,
            enabled: true,
            error: None,
        },
        Err(e) => YoloResponse {
            success: false,
            enabled: false,
            error: Some(e),
        },
    }
}

#[tauri::command]
pub fn disable_yolo_mode() -> YoloResponse {
    match yolo::disable_yolo() {
        Ok(()) => YoloResponse {
            success: true,
            enabled: false,
            error: None,
        },
        Err(e) => YoloResponse {
            success: false,
            enabled: true,
            error: Some(e),
        },
    }
}
