import { appendCsv, csvPath, initCsv, readCsv } from "./csv";
import { Activity } from "./types";
import { nowIso, randomId } from "./utils";

const FILE = csvPath("activity.csv");
const headers = ["id", "task_id", "user_id", "action", "old_value", "new_value", "created_at"];

export async function ensureActivityCsv() {
  await initCsv("activity.csv", headers);
}

export async function listActivityForTask(taskId: string) {
  await ensureActivityCsv();
  const rows = await readCsv<Activity>(FILE);
  return rows.filter((r) => r.task_id === taskId).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function recordActivity(input: Omit<Activity, "id" | "created_at">) {
  await ensureActivityCsv();
  const item: Activity = { ...input, id: randomId("act"), created_at: nowIso() };
  await appendCsv<Activity>(FILE, item);
}
