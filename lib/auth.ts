import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { findUserByUsernameOrEmail, getUserById } from "./users";
import { User } from "./types";
import { verifyPassword } from "./password";

const COOKIE_NAME = "session_token";
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

function encodeToken(userId: string) {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = `${userId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

function decodeToken(token: string): { userId: string; exp: number } | null {
  const [userId, expRaw, sig] = token.split(".");
  if (!userId || !expRaw || !sig) return null;
  const payload = `${userId}.${expRaw}`;
  if (sign(payload) !== sig) return null;
  const exp = Number(expRaw);
  if (Number.isNaN(exp) || exp < Date.now()) return null;
  return { userId, exp };
}

export async function loginWithCredentials(identifier: string, password: string): Promise<User | null> {
  const user = await findUserByUsernameOrEmail(identifier);
  if (!user || user.status !== "active") return null;
  const ok = verifyPassword(password, user.password_hash);
  return ok ? user : null;
}

export async function createSession(userId: string) {
  const token = encodeToken(userId);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const parsed = decodeToken(token);
  if (!parsed) return null;
  return getUserById(parsed.userId);
}

export async function getSessionUserFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const parsed = decodeToken(token);
  if (!parsed) return null;
  return getUserById(parsed.userId);
}
