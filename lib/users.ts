import { csvPath, initCsv, readCsv, updateCsvRow } from "./csv";
import { User } from "./types";
import { hashPassword } from "./password";

const FILE = csvPath("users.csv");
const headers = ["id", "username", "email", "password_hash", "full_name", "role", "avatar", "created_at", "status"];

export async function ensureUsersCsv() {
  await initCsv("users.csv", headers);
}

export async function listUsers(): Promise<User[]> {
  await ensureUsersCsv();
  return readCsv<User>(FILE);
}

export async function getUserById(id: string): Promise<User | null> {
  const rows = await listUsers();
  return rows.find((u) => u.id === id) ?? null;
}

export async function findUserByUsernameOrEmail(identifier: string): Promise<User | null> {
  const norm = identifier.trim().toLowerCase();
  const users = await listUsers();
  return users.find((u) => u.username.toLowerCase() === norm || u.email.toLowerCase() === norm) ?? null;
}

export async function updateProfile(userId: string, patch: Partial<Pick<User, "full_name" | "avatar">>) {
  await updateCsvRow<User>(FILE, userId, patch);
}

export async function updatePassword(userId: string, nextPassword: string) {
  const password_hash = hashPassword(nextPassword);
  await updateCsvRow<User>(FILE, userId, { password_hash });
}
