import { appendCsvRow, ensureCsv, readCsvRows } from "@/lib/csv";
import type { LedgerRecord, NodeId } from "@/lib/types";

const LEDGER_HEADER = [
  "height",
  "timestamp",
  "messageId",
  "pseudonym",
  "message",
  "prevHash",
  "hash",
  "originNode"
];

export function ledgerFileForNode(nodeId: NodeId): string {
  return `ledger_${nodeId}.csv`;
}

export async function ensureNodeLedger(nodeId: NodeId): Promise<void> {
  await ensureCsv(ledgerFileForNode(nodeId), LEDGER_HEADER);
}

export async function appendLedgerRecord(nodeId: NodeId, record: LedgerRecord): Promise<void> {
  await appendCsvRow(ledgerFileForNode(nodeId), [
    String(record.height),
    record.timestamp,
    record.messageId,
    record.pseudonym,
    record.message,
    record.prevHash,
    record.hash,
    record.originNode
  ]);
}

export async function getLedger(nodeId: NodeId): Promise<LedgerRecord[]> {
  const rows = await readCsvRows(ledgerFileForNode(nodeId));
  return rows.slice(1).map((row) => ({
    height: Number(row[0]),
    timestamp: row[1],
    messageId: row[2],
    pseudonym: row[3],
    message: row[4],
    prevHash: row[5],
    hash: row[6],
    originNode: row[7] as NodeId
  }));
}
