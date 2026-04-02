import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { appendCsvRow, ensureCsv } from '@/lib/csv';

export async function POST(request: Request) {
  await ensureCsv('feedback.csv', ['feedback_id', 'message_id', 'rating', 'comment', 'timestamp']);

  const body = (await request.json()) as {
    messageId?: string;
    rating?: 'up' | 'down';
    comment?: string;
  };

  if (!body.messageId || !body.rating) {
    return NextResponse.json({ error: 'messageId and rating are required' }, { status: 400 });
  }

  await appendCsvRow('feedback.csv', {
    feedback_id: `f_${randomUUID()}`,
    message_id: body.messageId,
    rating: body.rating,
    comment: body.comment ?? '',
    timestamp: new Date().toISOString()
  });

  return NextResponse.json({ ok: true });
}
