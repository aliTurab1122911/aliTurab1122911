import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'CSV file is required' }, { status: 400 });
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });

  if (parsed.errors.length > 0) {
    return NextResponse.json({ error: 'Invalid CSV format' }, { status: 400 });
  }

  if (parsed.data.length === 0) {
    return NextResponse.json({ error: 'CSV has no rows' }, { status: 400 });
  }

  const headers = Object.keys(parsed.data[0]);
  const required = ['id', 'question', 'answer', 'keywords'];
  const missing = required.filter((key) => !headers.includes(key));

  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing columns: ${missing.join(', ')}` }, { status: 400 });
  }

  const destination = path.join(process.cwd(), 'data', 'training_data.csv');
  await writeFile(destination, text, 'utf-8');

  return NextResponse.json({ ok: true, rows: parsed.data.length });
}
