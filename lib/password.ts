import crypto from "crypto";

const KEYLEN = 64;

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, KEYLEN).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, digest] = storedHash.split("$");
  if (scheme !== "scrypt" || !salt || !digest) return false;
  const derived = crypto.scryptSync(password, salt, KEYLEN).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(digest, "hex"));
}
