use serde::Serialize;
use tauri::{AppHandle, State};

use crate::state::VaultState;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClipboardResult {
    pub success: bool,
    pub error: Option<String>,
}

#[tauri::command]
pub fn copy_secret(
    value: String,
    app: AppHandle,
    state: State<VaultState>,
) -> ClipboardResult {
    let mut guard = state.lock();
    match guard.clipboard.copy_to_clipboard(&app, value) {
        Ok(()) => ClipboardResult { success: true, error: None },
        Err(e) => ClipboardResult { success: false, error: Some(e) },
    }
}
