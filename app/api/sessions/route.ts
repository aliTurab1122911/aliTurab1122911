import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { appendCsvRow, ensureCsv, readCsv } from '@/lib/csv';
import type { Session, ChatMessage } from '@/lib/types';

export async function GET(request: Request) {
  await ensureCsv('sessions.csv', ['session_id', 'created_at', 'last_active_at', 'topic']);
  await ensureCsv('messages.csv', ['message_id', 'session_id', 'role', 'text', 'timestamp']);

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');

  const sessions = await readCsv<Session>('sessions.csv');
  const messages = await readCsv<ChatMessage>('messages.csv');

  if (sessionId) {
    return NextResponse.json({
      session: sessions.find((s) => s.session_id === sessionId) ?? null,
      messages: messages.filter((m) => m.session_id === sessionId)
    });
  }

  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  await ensureCsv('sessions.csv', ['session_id', 'created_at', 'last_active_at', 'topic']);

  const body = (await request.json()) as { topic?: string };
  const now = new Date().toISOString();
  const sessionId = `s_${randomUUID()}`;

  await appendCsvRow('sessions.csv', {
    session_id: sessionId,
    created_at: now,
    last_active_at: now,
    topic: body.topic ?? 'General'
  });

  return NextResponse.json({ sessionId });
}
