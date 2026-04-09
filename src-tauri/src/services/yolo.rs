use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

use super::storage::get_vault_directory;

const YOLO_FILENAME: &str = ".yolo";

#[derive(Debug, Serialize, Deserialize)]
struct YoloConfig {
    enabled: bool,
    /// Base64-encoded password (NOT secure — that's the point of YOLO mode)
    token: String,
}

fn yolo_path() -> PathBuf {
    get_vault_directory().join(YOLO_FILENAME)
}

pub fn is_yolo_enabled() -> bool {
    let path = yolo_path();
    if !path.exists() {
        return false;
    }
    match fs::read_to_string(&path) {
        Ok(content) => serde_json::from_str::<YoloConfig>(&content)
            .map(|c| c.enabled)
            .unwrap_or(false),
        Err(_) => false,
    }
}

pub fn get_yolo_password() -> Option<String> {
    let path = yolo_path();
    let content = fs::read_to_string(&path).ok()?;
    let config: YoloConfig = serde_json::from_str(&content).ok()?;
    if !config.enabled {
        return None;
    }
    let decoded = BASE64.decode(&config.token).ok()?;
    String::from_utf8(decoded).ok()
}

pub fn enable_yolo(password: &str) -> Result<(), String> {
    let config = YoloConfig {
        enabled: true,
        token: BASE64.encode(password.as_bytes()),
    };
    let json = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize YOLO config: {e}"))?;
    fs::write(yolo_path(), json)
        .map_err(|e| format!("Failed to write YOLO config: {e}"))?;
    Ok(())
}

pub fn disable_yolo() -> Result<(), String> {
    let path = yolo_path();
    if path.exists() {
        fs::remove_file(&path)
            .map_err(|e| format!("Failed to remove YOLO config: {e}"))?;
    }
    Ok(())
}
