import crypto from "node:crypto";

const MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing SESSION_SECRET");
  }
  return secret;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function encodeSessionToken(userId: string) {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = `${userId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function decodeSessionToken(token: string): { userId: string; exp: number } | null {
  const [userId, expRaw, sig] = token.split(".");
  if (!userId || !expRaw || !sig) return null;
  const payload = `${userId}.${expRaw}`;
  if (sign(payload) !== sig) return null;
  const exp = Number(expRaw);
  if (Number.isNaN(exp) || exp < Date.now()) return null;
  return { userId, exp };
}

export const SESSION_MAX_AGE = MAX_AGE;
