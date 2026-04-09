use super::{storage::vault_exists, vault::VaultProject, yolo};
use crate::state::AppState;
use std::sync::MutexGuard;

pub struct AuthState {
    pub is_locked: bool,
    pub is_first_run: bool,
    pub yolo_mode: bool,
}

pub fn check_auth(state: &mut MutexGuard<AppState>) -> AuthState {
    let exists = vault_exists();
    let mut is_unlocked = state.vault.is_unlocked();
    let yolo_enabled = yolo::is_yolo_enabled();

    // Auto-unlock if YOLO mode is on and vault exists but is locked
    if !is_unlocked && exists && yolo_enabled {
        if let Some(password) = yolo::get_yolo_password() {
            if state.vault.unlock(&password).is_ok() {
                is_unlocked = true;
            }
        }
    }

    AuthState {
        is_locked: !is_unlocked,
        is_first_run: !exists,
        yolo_mode: yolo_enabled,
    }
}

pub fn setup(state: &mut MutexGuard<AppState>, password: &str) -> Result<Vec<VaultProject>, String> {
    if password.len() < 8 {
        return Err("Password must be at least 8 characters".to_string());
    }

    state.vault.initialize_with_demo_data(password)
}

pub fn unlock(
    state: &mut MutexGuard<AppState>,
    password: &str,
) -> Result<Vec<VaultProject>, String> {
    if password.is_empty() {
        return Err("Password is required".to_string());
    }

    state
        .vault
        .unlock(password)
        .map_err(|_| "Invalid password".to_string())
}

pub fn lock(state: &mut MutexGuard<AppState>) {
    state.vault.lock();
}
