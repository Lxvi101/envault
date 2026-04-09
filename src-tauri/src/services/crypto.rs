use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use hmac::Hmac;
use pbkdf2::pbkdf2;
use rand::RngCore;
use sha2::Sha512;

const PBKDF2_ITERATIONS: u32 = 600_000;
const KEY_LENGTH: usize = 32;
const IV_LENGTH: usize = 12;
const SALT_LENGTH: usize = 32;

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct EncryptedPayload {
    pub ciphertext: String,
    pub iv: String,
    pub auth_tag: String,
    pub salt: String,
}

fn derive_key(password: &[u8], salt: &[u8]) -> [u8; KEY_LENGTH] {
    let mut key = [0u8; KEY_LENGTH];
    pbkdf2::<Hmac<Sha512>>(password, salt, PBKDF2_ITERATIONS, &mut key)
        .expect("PBKDF2 key derivation failed");
    key
}

pub fn encrypt(data: &str, password: &str) -> Result<EncryptedPayload, String> {
    let mut salt = [0u8; SALT_LENGTH];
    rand::thread_rng().fill_bytes(&mut salt);

    let mut iv_bytes = [0u8; IV_LENGTH];
    rand::thread_rng().fill_bytes(&mut iv_bytes);

    let key = derive_key(password.as_bytes(), &salt);
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| format!("Failed to create cipher: {e}"))?;

    let nonce = Nonce::from_slice(&iv_bytes);

    // aes-gcm appends the 16-byte auth tag to the ciphertext
    let ciphertext_with_tag = cipher
        .encrypt(nonce, data.as_bytes())
        .map_err(|e| format!("Encryption failed: {e}"))?;

    // Split: ciphertext is everything except last 16 bytes, auth_tag is last 16 bytes
    let tag_len = 16;
    let (ciphertext, auth_tag) = ciphertext_with_tag.split_at(ciphertext_with_tag.len() - tag_len);

    Ok(EncryptedPayload {
        ciphertext: BASE64.encode(ciphertext),
        iv: BASE64.encode(iv_bytes),
        auth_tag: BASE64.encode(auth_tag),
        salt: BASE64.encode(salt),
    })
}

pub fn decrypt(payload: &EncryptedPayload, password: &str) -> Result<String, String> {
    let salt = BASE64
        .decode(&payload.salt)
        .map_err(|e| format!("Failed to decode salt: {e}"))?;
    let iv_bytes = BASE64
        .decode(&payload.iv)
        .map_err(|e| format!("Failed to decode iv: {e}"))?;
    let auth_tag = BASE64
        .decode(&payload.auth_tag)
        .map_err(|e| format!("Failed to decode auth_tag: {e}"))?;
    let ciphertext = BASE64
        .decode(&payload.ciphertext)
        .map_err(|e| format!("Failed to decode ciphertext: {e}"))?;

    let key = derive_key(password.as_bytes(), &salt);
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| format!("Failed to create cipher: {e}"))?;

    let nonce = Nonce::from_slice(&iv_bytes);

    // Reconstruct ciphertext + auth_tag for aes-gcm decryption
    let mut ciphertext_with_tag = ciphertext;
    ciphertext_with_tag.extend_from_slice(&auth_tag);

    let plaintext = cipher
        .decrypt(nonce, ciphertext_with_tag.as_ref())
        .map_err(|_| "Decryption failed: invalid password or corrupted data".to_string())?;

    String::from_utf8(plaintext).map_err(|e| format!("UTF-8 decode failed: {e}"))
}
