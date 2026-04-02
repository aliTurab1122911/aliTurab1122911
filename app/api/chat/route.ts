import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { appendCsvRow, ensureCsv } from '@/lib/csv';
import { generateReply } from '@/lib/chatbot';

export async function POST(request: Request) {
  await ensureCsv('messages.csv', ['message_id', 'session_id', 'role', 'text', 'timestamp']);

  const body = (await request.json()) as { sessionId?: string; message?: string };
  const sessionId = body.sessionId?.trim();
  const message = body.message?.trim();

  if (!sessionId || !message) {
    return NextResponse.json({ error: 'sessionId and message are required' }, { status: 400 });
  }

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

  return NextResponse.json({
    reply: result.reply,
    messageId: assistantMessageId,
    sourceId: result.sourceId ?? null
  });
}
