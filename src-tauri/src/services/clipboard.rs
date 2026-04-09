use std::sync::{
    atomic::{AtomicU64, Ordering},
    Arc,
};
use std::thread;
use std::time::Duration;
use tauri::AppHandle;
use tauri_plugin_clipboard_manager::ClipboardExt;

const AUTO_CLEAR_SECS: u64 = 30;

/// Copies text to the clipboard and schedules an auto-clear after 30 seconds.
/// Each copy increments a generation counter. A background clear task only
/// clears the clipboard if no newer copy has happened since it was scheduled.
pub struct ClipboardService {
    generation: Arc<AtomicU64>,
}

impl ClipboardService {
    pub fn new() -> Self {
        Self {
            generation: Arc::new(AtomicU64::new(0)),
        }
    }

    pub fn copy_to_clipboard(&mut self, app: &AppHandle, text: String) -> Result<(), String> {
        // Write to clipboard via tauri plugin
        app.clipboard()
            .write_text(text)
            .map_err(|e| format!("Failed to write to clipboard: {e}"))?;

        let generation = self.generation.fetch_add(1, Ordering::SeqCst) + 1;

        let app_clone = app.clone();
        let generation_ref = Arc::clone(&self.generation);
        thread::spawn(move || {
            thread::sleep(Duration::from_secs(AUTO_CLEAR_SECS));

            if generation_ref.load(Ordering::SeqCst) != generation {
                return;
            }

            let _ = app_clone.clipboard().write_text(String::new());
        });

        Ok(())
    }
}
