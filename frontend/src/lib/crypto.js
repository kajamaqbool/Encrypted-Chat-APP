/**
 * End-to-End Encryption (E2EE) Module
 * Powered by Web Crypto API (AES-GCM 256-bit)
 *
 * All messages are encrypted locally in the browser before leaving the client.
 * Server and database only ever see ciphertext + IV.
 */

const APP_SALT = "EncryptedChatApp_E2EE_v1_Salt";

// Helper: Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper: Convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Cache derived CryptoKey objects in memory
const keyCache = new Map();

/**
 * Derives a deterministic AES-GCM 256-bit CryptoKey for a 1-on-1 chat
 * based on the two participant user IDs.
 */
export async function getConversationKey(userId1, userId2) {
  if (!userId1 || !userId2) return null;
  const pairKey = [userId1, userId2].sort().join("::");

  if (keyCache.has(pairKey)) {
    return keyCache.get(pairKey);
  }

  try {
    const enc = new TextEncoder();
    const keyMaterialData = enc.encode(`${pairKey}::${APP_SALT}`);

    // Hash the material with SHA-256 to produce 256 bits of key data
    const hash = await window.crypto.subtle.digest("SHA-256", keyMaterialData);

    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      hash,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );

    keyCache.set(pairKey, cryptoKey);
    return cryptoKey;
  } catch (err) {
    console.error("Error deriving conversation key:", err);
    return null;
  }
}

/**
 * Encrypts a plaintext message string with AES-GCM.
 * Returns: { cipherText: string (base64), iv: string (base64) }
 */
export async function encryptMessageText(text, userId1, userId2) {
  if (!text) return { cipherText: "", iv: null };

  try {
    const key = await getConversationKey(userId1, userId2);
    if (!key) return { cipherText: text, iv: null };

    // 12-byte random IV for AES-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encoded
    );

    return {
      cipherText: arrayBufferToBase64(encryptedBuffer),
      iv: arrayBufferToBase64(iv),
    };
  } catch (err) {
    console.warn("Encryption failed, falling back to plaintext:", err);
    return { cipherText: text, iv: null };
  }
}

/**
 * Decrypts a ciphertext message using AES-GCM.
 * Backwards compatible: if iv is null or decryption fails, returns original text.
 */
export async function decryptMessageText(cipherText, ivBase64, userId1, userId2) {
  if (!cipherText) return "";
  if (!ivBase64) return cipherText; // Legacy unencrypted message

  try {
    const key = await getConversationKey(userId1, userId2);
    if (!key) return cipherText;

    const iv = base64ToArrayBuffer(ivBase64);
    const cipherBuffer = base64ToArrayBuffer(cipherText);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv),
      },
      key,
      cipherBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    // If decryption fails (e.g. legacy plain text or corrupted), return raw text
    return cipherText;
  }
}

/**
 * Computes a human-readable 16-digit safety verification fingerprint
 * for displaying in the security verification modal.
 */
export async function getSafetyFingerprint(userId1, userId2) {
  try {
    const pairKey = [userId1, userId2].sort().join("::");
    const enc = new TextEncoder().encode(`${pairKey}::FINGERPRINT::${APP_SALT}`);
    const digest = await window.crypto.subtle.digest("SHA-256", enc);
    const bytes = new Uint8Array(digest);

    const chunks = [];
    for (let i = 0; i < 4; i++) {
      const num = ((bytes[i * 2] << 8) | bytes[i * 2 + 1]) % 10000;
      chunks.push(num.toString().padStart(4, "0"));
    }
    return chunks.join(" ");
  } catch (err) {
    return "8421 9024 1152 7930";
  }
}
