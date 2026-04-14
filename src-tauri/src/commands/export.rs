use serde::Serialize;
use std::fs;
use tauri::{AppHandle, State};
use tauri_plugin_dialog::{DialogExt, FilePath};

use crate::state::VaultState;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportResult {
    pub success: bool,
    pub file_path: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportResult {
    pub success: bool,
    pub count: Option<usize>,
    pub error: Option<String>,
}

#[tauri::command]
pub async fn export_env(
    project_id: String,
    env_id: String,
    app: AppHandle,
    state: State<'_, VaultState>,
) -> Result<ExportResult, String> {
    let content = {
        let guard = state.lock();
        match guard.vault.export_env(&project_id, &env_id) {
            Ok(c) => c,
            Err(e) => {
                return Ok(ExportResult {
                    success: false,
                    file_path: None,
                    error: Some(e),
                })
            }
        }
    };

    // Show a save dialog
    let save_path = app
        .dialog()
        .file()
        .set_title("Export Environment Variables")
        .set_file_name(".env")
        .add_filter("Environment Files", &["env"])
        .add_filter("All Files", &["*"])
        .blocking_save_file();

    match save_path {
        Some(FilePath::Path(path)) => {
            match fs::write(&path, &content) {
                Ok(()) => Ok(ExportResult {
                    success: true,
                    file_path: Some(path.to_string_lossy().to_string()),
                    error: None,
                }),
                Err(e) => Ok(ExportResult {
                    success: false,
                    file_path: None,
                    error: Some(format!("Failed to write file: {e}")),
                }),
            }
        }
        _ => Ok(ExportResult {
            success: false,
            file_path: None,
            error: Some("Export cancelled".to_string()),
        }),
    }
}

#[tauri::command]
pub async fn import_env(
    project_id: String,
    env_id: String,
    app: AppHandle,
    state: State<'_, VaultState>,
) -> Result<ImportResult, String> {
    // Show an open dialog – "All Files" is the default so dotfiles like .env
    // and files without an extension are always selectable.
    let open_path = app
        .dialog()
        .file()
        .set_title("Import Environment Variables")
        .add_filter("All Files", &["*"])
        .add_filter("Environment Files", &["env"])
        .add_filter("Text Files", &["txt", "md"])
        .blocking_pick_file();

    let file_path = match open_path {
        Some(FilePath::Path(p)) => p,
        _ => {
            return Ok(ImportResult {
                success: false,
                count: None,
                error: Some("Import cancelled".to_string()),
            })
        }
    };

    let content = match fs::read_to_string(&file_path) {
        Ok(c) => c,
        Err(e) => {
            return Ok(ImportResult {
                success: false,
                count: None,
                error: Some(format!("Failed to read file: {e}")),
            })
        }
    };

    let mut guard = state.lock();
    match guard.vault.import_env(&content, &project_id, &env_id) {
        Ok(vars) => Ok(ImportResult {
            success: true,
            count: Some(vars.len()),
            error: None,
        }),
        Err(e) => Ok(ImportResult {
            success: false,
            count: None,
            error: Some(e),
        }),
    }
}
