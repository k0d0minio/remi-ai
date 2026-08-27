import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Password hashing for operator accounts, on `node:crypto`'s scrypt — no vendor
 * and no dependency, which is the right weight for a surface with one account
 * on it. If auth ever grows past the operator console, the seam to revisit is
 * REMI-013, not this file.
 *
 * Format: `scrypt:<salt hex>:<hash hex>`. Self-describing, so a future
 * algorithm can coexist during a migration by prefix.
 */

const KEY_LENGTH = 64;

const derive = (password: string, salt: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => {
      if (error) {
        reject(error);
      } else {
        resolve(key);
      }
    });
  });

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
};

export const verifyPassword = async (
  password: string,
  stored: string,
): Promise<boolean> => {
  const [scheme, saltHex, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) {
    return false;
  }
  const expected = Buffer.from(hashHex, "hex");
  const key = await derive(password, Buffer.from(saltHex, "hex"));
  return key.length === expected.length && timingSafeEqual(key, expected);
};
