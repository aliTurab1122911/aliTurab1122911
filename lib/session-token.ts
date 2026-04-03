const MAX_AGE = 60 * 60 * 24 * 7;

export function encodeSessionToken(userId: string) {
  const exp = Date.now() + MAX_AGE * 1000;
  return `${userId}.${exp}`;
}

export function decodeSessionToken(token: string): { userId: string; exp: number } | null {
  const [userId, expRaw] = token.split(".");
  if (!userId || !expRaw) return null;
  const exp = Number(expRaw);
  if (Number.isNaN(exp) || exp < Date.now()) return null;
  return { userId, exp };
}

export const SESSION_MAX_AGE = MAX_AGE;
