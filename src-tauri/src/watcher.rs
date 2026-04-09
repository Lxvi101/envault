use std::{
    path::PathBuf,
    sync::mpsc::channel,
    thread,
    time::Duration,
};

use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};
use tauri::{AppHandle, Emitter};

use crate::services::storage::get_vault_file_path;

/// Starts a background thread that watches the vault file for external changes
/// and emits a `vault-changed` event on the Tauri app handle.
///
/// This mirrors the chokidar-based file watcher in the original Electron app.
pub fn start_vault_watcher(app: AppHandle) {
    thread::spawn(move || {
        let vault_path: PathBuf = get_vault_file_path();

        let (tx, rx) = channel();

        // Create the watcher with a debounce delay to match chokidar's
        // `awaitWriteFinish.stabilityThreshold: 500ms`
        let config = Config::default()
            .with_poll_interval(Duration::from_millis(100));

        let mut watcher = match RecommendedWatcher::new(tx, config) {
            Ok(w) => w,
            Err(e) => {
                eprintln!("[EnVault watcher] Failed to create watcher: {e}");
                return;
            }
        };

        // Watch the parent directory so we also catch file creation
        if let Some(parent) = vault_path.parent() {
            // Ensure the directory exists before watching
            if let Err(e) = std::fs::create_dir_all(parent) {
                eprintln!("[EnVault watcher] Failed to create vault dir: {e}");
            }

            if let Err(e) = watcher.watch(parent, RecursiveMode::NonRecursive) {
                eprintln!("[EnVault watcher] Failed to watch path: {e}");
                return;
            }
        } else {
            eprintln!("[EnVault watcher] Vault path has no parent directory");
            return;
        }

        let mut last_emit = std::time::Instant::now();
        let debounce = Duration::from_millis(500);

        for event_result in rx {
            match event_result {
                Ok(event) => {
                    // Only react to events involving the vault file
                    let involves_vault = event
                        .paths
                        .iter()
                        .any(|p| p.file_name() == vault_path.file_name());

                    if !involves_vault {
                        continue;
                    }

                    // Debounce: only emit if enough time has passed
                    let now = std::time::Instant::now();
                    if now.duration_since(last_emit) >= debounce {
                        last_emit = now;
                        if let Err(e) = app.emit("vault-changed", ()) {
                            eprintln!("[EnVault watcher] Failed to emit event: {e}");
                        }
                    }
                }
                Err(e) => {
                    eprintln!("[EnVault watcher] Watch error: {e}");
                }
            }
        }
    });
}
