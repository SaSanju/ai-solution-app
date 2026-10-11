import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function getEncryptionKey() {
  const encodedKey = process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;
  const key = encodedKey ? Buffer.from(encodedKey, "base64") : Buffer.alloc(0);

  if (key.length !== 32) {
    throw new Error("WHATSAPP_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  }

  return key;
}

export function encryptWhatsAppToken(token) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);

  return {
    encryptedAccessToken: encrypted.toString("base64"),
    encryptionIv: iv.toString("base64"),
    encryptionTag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptWhatsAppToken(integration) {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(integration.encryptionIv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(integration.encryptionTag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(integration.encryptedAccessToken, "base64")),
    decipher.final(),
  ]).toString("utf8");
}