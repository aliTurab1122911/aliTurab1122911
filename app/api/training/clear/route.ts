import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST() {
  const destination = path.join(process.cwd(), 'data', 'training_data.csv');
  await writeFile(destination, 'id,question,answer,keywords\n', 'utf-8');
  return NextResponse.json({ ok: true });
}
