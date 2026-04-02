import { readCsv } from './csv';
import type { TrainingRow } from './types';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function score(question: string, row: TrainingRow): number {
  const qTokens = new Set(tokenize(question));
  const source = `${row.question} ${row.keywords}`;
  const sTokens = tokenize(source);
  let points = 0;

  for (const token of sTokens) {
    if (qTokens.has(token)) points += 1;
  }

  if (row.question.toLowerCase() === question.toLowerCase()) {
    points += 10;
  }

  return points;
}

export async function generateReply(message: string): Promise<{ reply: string; sourceId?: string }> {
  const rows = await readCsv<TrainingRow>('training_data.csv');
  if (rows.length === 0) {
    return {
      reply: 'I do not have training data yet. Please upload a CSV on the Chat page.'
    };
  }

  const ranked = rows
    .map((row) => ({ row, score: score(message, row) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best || best.score <= 0) {
    return {
      reply: 'I could not find a strong match in the training CSV. Try rephrasing your question.'
    };
  }

  return { reply: best.row.answer, sourceId: best.row.id };
}
