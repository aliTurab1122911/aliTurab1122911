import { User } from "./types";

export function canManageProjects(user: User) {
  return user.role === "admin";
}

export function canManageUsers(user: User) {
  return user.role === "admin";
}

export function canManageTask(user: User, reporterId: string) {
  return user.role === "admin" || user.id === reporterId;
}
