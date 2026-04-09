mod commands;
mod services;
mod state;
mod watcher;

use commands::{auth, clipboard, export, vault};
use state::VaultState;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .manage(VaultState::new())
        .setup(|app| {
            // Start watching the vault file for external changes
            let app_handle = app.handle().clone();
            watcher::start_vault_watcher(app_handle);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Auth
            auth::check_auth,
            auth::unlock,
            auth::lock,
            auth::setup,
            auth::enable_yolo_mode,
            auth::disable_yolo_mode,
            // Vault - Projects
            vault::get_all_projects,
            vault::create_project,
            vault::update_project,
            vault::delete_project,
            vault::toggle_favorite,
            // Vault - Variables
            vault::add_variable,
            vault::update_variable,
            vault::delete_variable,
            // Export / Import
            export::export_env,
            export::import_env,
            // Clipboard
            clipboard::copy_secret,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
