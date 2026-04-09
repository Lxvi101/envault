use std::sync::{Mutex, MutexGuard};

use crate::services::{clipboard::ClipboardService, vault::VaultService};

/// Combined app state held behind a single Mutex.
/// This avoids potential deadlocks from multiple locks.
pub struct AppState {
    pub vault: VaultService,
    pub clipboard: ClipboardService,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            vault: VaultService::new(),
            clipboard: ClipboardService::new(),
        }
    }
}

/// Thread-safe wrapper around `AppState`.
pub struct VaultState(pub Mutex<AppState>);

impl VaultState {
    pub fn new() -> Self {
        Self(Mutex::new(AppState::new()))
    }

    pub fn lock(&self) -> MutexGuard<'_, AppState> {
        self.0.lock().expect("VaultState mutex poisoned")
    }
}
