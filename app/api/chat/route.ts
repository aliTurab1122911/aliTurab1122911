import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { appendCsvRow, ensureCsv, readCsv, writeCsvFromObjects } from '@/lib/csv';
import { generateReply } from '@/lib/chatbot';
import type { Session } from '@/lib/types';

async function touchSession(sessionId: string): Promise<void> {
  await ensureCsv('sessions.csv', ['session_id', 'created_at', 'last_active_at', 'topic']);
  const sessions = await readCsv<Session>('sessions.csv');
  const now = new Date().toISOString();
  let found = false;

  const updated = sessions.map((session) => {
    if (session.session_id === sessionId) {
      found = true;
      return { ...session, last_active_at: now };
    }
    return session;
  });

  if (!found) {
    updated.push({
      session_id: sessionId,
      created_at: now,
      last_active_at: now,
      topic: 'General'
    });
  }

  await writeCsvFromObjects('sessions.csv', updated as unknown as Record<string, string>[]);
}

export async function POST(request: Request) {
  await ensureCsv('messages.csv', ['message_id', 'session_id', 'role', 'text', 'timestamp']);
  await ensureCsv('training_data.csv', ['id', 'question', 'answer', 'keywords']);

  const body = (await request.json()) as { sessionId?: string; message?: string };
  const sessionId = body.sessionId?.trim();
  const message = body.message?.trim();

  if (!sessionId || !message) {
    return NextResponse.json({ error: 'sessionId and message are required' }, { status: 400 });
  }

  await touchSession(sessionId);

  const userMessageId = `m_${randomUUID()}`;
  const timestamp = new Date().toISOString();

  await appendCsvRow('messages.csv', {
    message_id: userMessageId,
    session_id: sessionId,
    role: 'user',
    text: message,
    timestamp
  });

  const result = await generateReply(message);

  const assistantMessageId = `m_${randomUUID()}`;
  await appendCsvRow('messages.csv', {
    message_id: assistantMessageId,
    session_id: sessionId,
    role: 'assistant',
    text: result.reply,
    timestamp: new Date().toISOString()
  });

  await appendCsvRow('training_data.csv', {
    id: `chat_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    question: message,
    answer: result.reply,
    keywords: 'chat-session,auto-generated'
  });

  return NextResponse.json({
    reply: result.reply,
    messageId: assistantMessageId,
    sourceId: result.sourceId ?? null
  });
}
