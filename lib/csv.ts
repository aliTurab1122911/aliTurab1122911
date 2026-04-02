import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const dataDir = path.join(process.cwd(), 'data');

export function dataPath(fileName: string): string {
  return path.join(dataDir, fileName);
}

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function ensureCsv(fileName: string, header: string[]): Promise<void> {
  const fullPath = dataPath(fileName);
  try {
    await fs.access(fullPath);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(fullPath, `${header.join(',')}\n`, 'utf-8');
  }
}

export async function readCsv<T>(fileName: string): Promise<T[]> {
  const fullPath = dataPath(fileName);
  const content = await fs.readFile(fullPath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as T[];
}

export async function appendCsvRow(fileName: string, row: Record<string, string>): Promise<void> {
  const line = `${Object.values(row).map((v) => escapeCsvValue(String(v))).join(',')}\n`;
  await fs.appendFile(dataPath(fileName), line, 'utf-8');
}

export async function writeCsvFromObjects(fileName: string, rows: Record<string, string>[]): Promise<void> {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((key) => escapeCsvValue(String(row[key] ?? ''))).join(','));
  }
  await fs.writeFile(dataPath(fileName), `${lines.join('\n')}\n`, 'utf-8');
}
