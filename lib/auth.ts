import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { findUserByUsernameOrEmail, getUserById } from "./users";
import { User } from "./types";
import { verifyPassword } from "./password";
import { decodeSessionToken, encodeSessionToken, SESSION_MAX_AGE } from "./session-token";
import { randomId } from "./utils";

const COOKIE_NAME = "session_token";

export async function loginWithCredentials(identifier: string, password: string): Promise<User | null> {
  const user = await findUserByUsernameOrEmail(identifier);
  if (!user || user.status !== "active") return null;
  const ok = verifyPassword(password, user.password_hash);
  return ok ? user : null;
}

export async function createSession(userId: string) {
  const token = encodeSessionToken(userId);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE
  });
}

export async function createGuestSession() {
  const guestId = `guest_${randomId("user")}`;
  await createSession(guestId);
  return guestId;
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const parsed = decodeSessionToken(token);
  if (!parsed) return null;
  if (parsed.userId.startsWith("guest_")) {
    return {
      id: parsed.userId,
      username: "guest",
      email: "",
      password_hash: "",
      full_name: "Guest User",
      role: "member",
      avatar: "G",
      created_at: new Date().toISOString(),
      status: "active"
    };
  }
  return getUserById(parsed.userId);
}

export async function getSessionUserFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const parsed = decodeSessionToken(token);
  if (!parsed) return null;
  if (parsed.userId.startsWith("guest_")) {
    return {
      id: parsed.userId,
      username: "guest",
      email: "",
      password_hash: "",
      full_name: "Guest User",
      role: "member",
      avatar: "G",
      created_at: new Date().toISOString(),
      status: "active"
    };
  }
  return getUserById(parsed.userId);
}
