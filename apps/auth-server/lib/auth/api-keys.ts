import crypto from "crypto";
import { hash } from "bcryptjs";

/**
 * Generate a random API key with the specified prefix and environment
 * @param type - 'publishable' or 'secret'
 * @param environment - 'dev' or 'prod'
 * @returns Object containing the full key and its hash
 */
export async function generateApiKey(
  type: "publishable" | "secret",
  environment: "dev" | "prod" = "dev",
): Promise<{ key: string; keyHash: string; keyPrefix: string }> {
  // Create prefix based on type and environment
  // pk = publishable key, sk = secret key
  const typePrefix = type === "publishable" ? "pk" : "sk";
  const envPrefix = environment === "dev" ? "dev" : "live";
  const keyPrefix = `${typePrefix}_${envPrefix}_`;

  // Generate a secure random string (32 bytes = 64 hex characters)
  const randomBytes = crypto.randomBytes(32);
  const randomString = randomBytes.toString("hex");

  // Combine prefix with random string
  const fullKey = `${keyPrefix}${randomString}`;

  // Hash the key for storage
  const keyHash = await hash(fullKey, 10);

  return {
    key: fullKey,
    keyHash,
    keyPrefix,
  };
}

/**
 * Verify if a provided key matches the stored hash
 * @param key - The API key to verify
 * @param keyHash - The stored hash
 * @returns boolean indicating if the key is valid
 */
export async function verifyApiKey(
  key: string,
  keyHash: string,
): Promise<boolean> {
  // For API keys, we'll use direct comparison after hashing
  // This is more efficient than bcrypt compare for high-frequency operations
  const bcrypt = require("bcryptjs");
  return await bcrypt.compare(key, keyHash);
}

/**
 * Extract project ID from an API key (for quick lookups)
 * This is used when we want to add project context to keys
 */
export function extractKeyType(key: string): "publishable" | "secret" | null {
  if (key.startsWith("pk_")) return "publishable";
  if (key.startsWith("sk_")) return "secret";
  return null;
}

/**
 * Extract environment from an API key
 */
export function extractEnvironment(key: string): "dev" | "prod" | null {
  if (key.includes("_dev_")) return "dev";
  if (key.includes("_live_")) return "prod";
  return null;
}

/**
 * Mask an API key for safe display
 * @param key - The full API key
 * @returns Masked key showing only the prefix and last 4 characters
 */
export function maskApiKey(key: string): string {
  if (key.length < 12) return key;

  const parts = key.split("_");
  if (parts.length >= 3) {
    // For keys like pk_dev_xxxxx or sk_live_xxxxx
    const prefix = `${parts[0]}_${parts[1]}_`;
    const rest = parts.slice(2).join("_");
    const lastFour = rest.slice(-4);
    const masked = "•".repeat(Math.min(rest.length - 4, 12));
    return `${prefix}${masked}${lastFour}`;
  }

  // Fallback for unexpected format
  const lastFour = key.slice(-4);
  const masked = "•".repeat(Math.min(key.length - 4, 12));
  return `${masked}${lastFour}`;
}
