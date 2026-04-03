import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

export function csvFilePath(fileName: string): string {
  return path.join(DATA_DIR, fileName);
}

export function toCsvRow(values: string[]): string {
  return values
    .map((value) => {
      const escaped = value.replaceAll('"', '""');
      return `"${escaped}"`;
    })
    .join(",");
}

export function fromCsvRow(row: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i += 1) {
    const char = row[i];

    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

export async function ensureCsv(fileName: string, header: string[]): Promise<void> {
  await ensureDataDir();
  const filePath = csvFilePath(fileName);

  try {
    await readFile(filePath, "utf8");
  } catch {
    await writeFile(filePath, `${toCsvRow(header)}\n`, "utf8");
  }
}

export async function appendCsvRow(fileName: string, values: string[]): Promise<void> {
  const filePath = csvFilePath(fileName);
  const existing = await readFile(filePath, "utf8");
  const next = `${existing}${toCsvRow(values)}\n`;
  await writeFile(filePath, next, "utf8");
}

export async function readCsvRows(fileName: string): Promise<string[][]> {
  const filePath = csvFilePath(fileName);
  const content = await readFile(filePath, "utf8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => fromCsvRow(line));
}
