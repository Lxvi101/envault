use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

const VAULT_FILENAME: &str = "vault.envault";
#[allow(dead_code)]
const APP_FOLDER: &str = "EnVault";

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EncryptedVaultFile {
    pub version: u32,
    pub salt: String,
    pub iv: String,
    pub auth_tag: String,
    pub ciphertext: String,
    pub created_at: String,
    pub modified_at: String,
}

pub fn get_vault_directory() -> PathBuf {
    #[cfg(target_os = "macos")]
    {
        let home = dirs_next::home_dir().unwrap_or_else(|| PathBuf::from("."));
        home.join("Library")
            .join("Mobile Documents")
            .join("com~apple~CloudDocs")
            .join(APP_FOLDER)
    }

    #[cfg(not(target_os = "macos"))]
    {
        let home = dirs_next::home_dir().unwrap_or_else(|| PathBuf::from("."));
        home.join(".envault").join("data")
    }
}

pub fn get_vault_file_path() -> PathBuf {
    get_vault_directory().join(VAULT_FILENAME)
}

pub fn ensure_vault_dir() -> Result<(), String> {
    let dir = get_vault_directory();
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| format!("Failed to create vault directory: {e}"))?;
    }
    Ok(())
}

pub fn read_vault_file() -> Option<EncryptedVaultFile> {
    let path = get_vault_file_path();
    if !path.exists() {
        return None;
    }

    let content = fs::read_to_string(&path).ok()?;
    serde_json::from_str(&content).ok()
}

pub fn write_vault_file(data: &EncryptedVaultFile) -> Result<(), String> {
    ensure_vault_dir()?;
    let path = get_vault_file_path();

    let content = serde_json::to_string_pretty(data)
        .map_err(|e| format!("Failed to serialize vault: {e}"))?;

    fs::write(&path, content).map_err(|e| format!("Failed to write vault file: {e}"))?;

    Ok(())
}

pub fn vault_exists() -> bool {
    get_vault_file_path().exists()
}
