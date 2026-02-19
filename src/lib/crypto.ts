import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getMasterKey(): Buffer {
  const hex = process.env.ENCRYPTION_MASTER_KEY;
  if (!hex) throw new Error('ENCRYPTION_MASTER_KEY is not set');
  return Buffer.from(hex, 'hex');
}

export function encryptApiKey(plaintext: string): {
  encrypted: string;
  iv: string;
  tag: string;
} {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getMasterKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  };
}

export function decryptApiKey(encrypted: string, iv: string, tag: string): string {
  const decipher = createDecipheriv(ALGORITHM, getMasterKey(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
