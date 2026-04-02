import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { appendCsvRow, ensureCsv } from '@/lib/csv';

export async function POST(request: Request) {
  await ensureCsv('training_data.csv', ['id', 'question', 'answer', 'keywords']);

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

  for (const row of parsed.data) {
    await appendCsvRow('training_data.csv', {
      id: row.id ?? '',
      question: row.question ?? '',
      answer: row.answer ?? '',
      keywords: row.keywords ?? ''
    });
  }

  return NextResponse.json({ ok: true, rows: parsed.data.length, mode: 'appended' });
}
