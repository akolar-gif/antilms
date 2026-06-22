import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

/**
 * Hashes a password using Node.js's native scryptSync algorithm with a random salt.
 * Returns the hash formatted as `salt:hashedPassword` (hex encoded).
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies a plain password against a stored `salt:hashedPassword` hash.
 * Uses timingSafeEqual to protect against timing side-channel attacks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = scryptSync(password, salt, 64);
    
    return timingSafeEqual(keyBuffer, derivedKey);
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}
