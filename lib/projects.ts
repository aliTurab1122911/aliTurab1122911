import { appendCsv, csvPath, initCsv, readCsv } from "./csv";
import { Project } from "./types";
import { nowIso, randomId } from "./utils";

const FILE = csvPath("projects.csv");
const headers = ["id", "name", "key", "description", "created_by", "created_at", "status"];

export async function ensureProjectsCsv() {
  await initCsv("projects.csv", headers);
}

export async function listProjects() {
  await ensureProjectsCsv();
  return readCsv<Project>(FILE);
}

export async function getProjectById(id: string) {
  const rows = await listProjects();
  return rows.find((r) => r.id === id) ?? null;
}

export async function createProject(input: { name: string; key: string; description: string; createdBy: string }) {
  const project: Project = {
    id: randomId("proj"),
    name: input.name,
    key: input.key.toUpperCase(),
    description: input.description,
    created_by: input.createdBy,
    created_at: nowIso(),
    status: "active"
  };
  await appendCsv<Project>(FILE, project);
  return project;
}
