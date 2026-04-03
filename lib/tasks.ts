import { appendCsv, csvPath, deleteCsvRow, initCsv, readCsv, updateCsvRow } from "./csv";
import { Task } from "./types";
import { nowIso, randomId } from "./utils";
import { recordActivity } from "./activity";

const FILE = csvPath("tasks.csv");
const headers = ["id", "project_id", "title", "description", "status", "priority", "assignee_id", "reporter_id", "due_date", "start_date", "tags", "created_at", "updated_at"];

export async function ensureTasksCsv() {
  await initCsv("tasks.csv", headers);
}

export async function listTasks() {
  await ensureTasksCsv();
  return readCsv<Task>(FILE);
}

export async function getTaskById(id: string) {
  const tasks = await listTasks();
  return tasks.find((t) => t.id === id) ?? null;
}

export async function createTask(input: Omit<Task, "id" | "created_at" | "updated_at">) {
  const task: Task = { ...input, id: randomId("task"), created_at: nowIso(), updated_at: nowIso() };
  await appendCsv<Task>(FILE, task);
  await recordActivity({ task_id: task.id, user_id: task.reporter_id, action: "created", old_value: "", new_value: JSON.stringify(task) });
  return task;
}

export async function updateTask(taskId: string, patch: Partial<Task>, actorUserId: string) {
  const existing = await getTaskById(taskId);
  if (!existing) {
    throw new Error("Task not found");
  }

  const next = { ...patch, updated_at: nowIso() };
  await updateCsvRow<Task>(FILE, taskId, next);
  await recordActivity({ task_id: taskId, user_id: actorUserId, action: "updated", old_value: JSON.stringify(existing), new_value: JSON.stringify(next) });
}

export async function removeTask(taskId: string, actorUserId: string) {
  const existing = await getTaskById(taskId);
  if (!existing) return;
  await deleteCsvRow<Task>(FILE, taskId);
  await recordActivity({ task_id: taskId, user_id: actorUserId, action: "deleted", old_value: JSON.stringify(existing), new_value: "" });
}

export async function clearGuestTasks(guestUserId: string) {
  const tasks = await listTasks();
  const toDelete = tasks.filter((task) => task.reporter_id === guestUserId).map((task) => task.id);
  await Promise.all(toDelete.map((taskId) => deleteCsvRow<Task>(FILE, taskId)));
}
