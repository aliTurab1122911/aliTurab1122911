import { ensureUsersCsv } from "./users";
import { ensureProjectsCsv } from "./projects";
import { ensureTasksCsv } from "./tasks";
import { ensureActivityCsv } from "./activity";

export async function ensureDataFiles() {
  await ensureUsersCsv();
  await ensureProjectsCsv();
  await ensureTasksCsv();
  await ensureActivityCsv();
}
