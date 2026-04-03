import fs from "fs/promises";
import path from "path";
import Papa from "papaparse";

const writeQueues = new Map<string, Promise<void>>();

export const dataDir = path.join(process.cwd(), "data");

export function csvPath(fileName: string) {
  return path.join(dataDir, fileName);
}

async function ensureFile(filePath: string, headers: string[]) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, `${headers.join(",")}\n`, "utf8");
  }
}

export async function readCsv<T>(filePath: string): Promise<T[]> {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = Papa.parse<T>(raw, { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim() });
  if (parsed.errors.length) {
    throw new Error(`CSV parse error in ${filePath}: ${parsed.errors[0]?.message}`);
  }
  return parsed.data;
}

export async function writeCsv<T>(filePath: string, rows: T[]): Promise<void> {
  const csv = Papa.unparse(rows);
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, `${csv}\n`, "utf8");
  await fs.rename(tmpPath, filePath);
}

function queueWrite(filePath: string, fn: () => Promise<void>) {
  const prev = writeQueues.get(filePath) ?? Promise.resolve();
  const run = prev.catch(() => undefined).then(fn);
  writeQueues.set(filePath, run.catch(() => undefined));
  return run;
}

export async function appendCsv<T>(filePath: string, row: T) {
  return queueWrite(filePath, async () => {
    const rows = await readCsv<T>(filePath);
    rows.push(row);
    await writeCsv(filePath, rows);
  });
}

export async function updateCsvRow<T extends { id: string }>(filePath: string, rowId: string, patch: Partial<T>) {
  return queueWrite(filePath, async () => {
    const rows = await readCsv<T>(filePath);
    const idx = rows.findIndex((r) => r.id === rowId);
    if (idx < 0) {
      throw new Error(`Row ${rowId} not found in ${filePath}`);
    }
    rows[idx] = { ...rows[idx], ...patch };
    await writeCsv(filePath, rows);
  });
}

export async function deleteCsvRow<T extends { id: string }>(filePath: string, rowId: string) {
  return queueWrite(filePath, async () => {
    const rows = await readCsv<T>(filePath);
    await writeCsv(filePath, rows.filter((r) => r.id !== rowId));
  });
}

export async function initCsv(fileName: string, headers: string[]) {
  await ensureFile(csvPath(fileName), headers);
}
