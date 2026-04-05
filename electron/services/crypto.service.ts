import { pbkdf2Sync, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import { logger } from '../utils/logger';

const PBKDF2_ITERATIONS = 600000;
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const SALT_LENGTH = 32;
const ALGORITHM = 'aes-256-gcm';
const DIGEST = 'sha512';

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
  salt: string;
}

function deriveKey(password: string, salt: Buffer): Buffer {
  return pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST);
}

function generateSalt(): Buffer {
  return randomBytes(SALT_LENGTH);
}

function zeroBuffer(buf: Buffer): void {
  buf.fill(0);
}

export function encrypt(data: string, password: string): EncryptedPayload {
  const salt = generateSalt();
  const key = deriveKey(password, salt);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(data, 'utf-8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const payload: EncryptedPayload = {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    salt: salt.toString('base64'),
  };

  zeroBuffer(key);
  zeroBuffer(iv);
  zeroBuffer(salt);

  return payload;
}

export function decrypt(payload: EncryptedPayload, password: string): string {
  const salt = Buffer.from(payload.salt, 'base64');
  const iv = Buffer.from(payload.iv, 'base64');
  const authTag = Buffer.from(payload.authTag, 'base64');
  const ciphertext = Buffer.from(payload.ciphertext, 'base64');

  const key = deriveKey(password, salt);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted: string;
  try {
    decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf-8');
  } catch (error) {
    zeroBuffer(key);
    zeroBuffer(salt);
    zeroBuffer(iv);
    logger.error('Decryption failed - invalid password or corrupted data');
    throw new Error('Decryption failed: invalid password or corrupted data');
  }

  zeroBuffer(key);
  zeroBuffer(salt);
  zeroBuffer(iv);

  return decrypted;
}

export const cryptoService = {
  encrypt,
  decrypt,
  generateSalt,
  deriveKey,
};
