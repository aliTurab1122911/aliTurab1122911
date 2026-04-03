import { createMessageId, sha256 } from "@/lib/hash";
import { appendLedgerRecord, ensureNodeLedger, getLedger } from "@/lib/ledger";
import type { LedgerRecord, MessageInput, NodeId, NodeStatus } from "@/lib/types";

const GENESIS_HASH = "GENESIS";

export class NodeSimulator {
  readonly nodeId: NodeId;
  private height: number;
  private lastHash: string;

  constructor(nodeId: NodeId) {
    this.nodeId = nodeId;
    this.height = 0;
    this.lastHash = GENESIS_HASH;
  }

  async init(): Promise<void> {
    await ensureNodeLedger(this.nodeId);
    const ledger = await getLedger(this.nodeId);

    if (ledger.length === 0) {
      return;
    }

    const tip = ledger[ledger.length - 1];
    this.height = tip.height;
    this.lastHash = tip.hash;
  }

  getStatus(): NodeStatus {
    return {
      nodeId: this.nodeId,
      height: this.height,
      lastHash: this.lastHash
    };
  }

  async createRecord(input: MessageInput): Promise<LedgerRecord> {
    const timestamp = new Date().toISOString();
    const height = this.height + 1;
    const messageId = createMessageId();
    const prevHash = this.lastHash;
    const payload = [
      String(height),
      timestamp,
      messageId,
      input.pseudonym,
      input.message,
      prevHash,
      this.nodeId
    ].join("|");

    const hash = sha256(payload);

    const record: LedgerRecord = {
      height,
      timestamp,
      messageId,
      pseudonym: input.pseudonym,
      message: input.message,
      prevHash,
      hash,
      originNode: this.nodeId
    };

    await appendLedgerRecord(this.nodeId, record);
    this.height = record.height;
    this.lastHash = record.hash;
    return record;
  }

  async acceptRecord(record: LedgerRecord): Promise<void> {
    const expectedHeight = this.height + 1;
    const expectedPrevHash = this.lastHash;

    if (record.height !== expectedHeight || record.prevHash !== expectedPrevHash) {
      return;
    }

    await appendLedgerRecord(this.nodeId, record);
    this.height = record.height;
    this.lastHash = record.hash;
  }

  async readLedger(): Promise<LedgerRecord[]> {
    return getLedger(this.nodeId);
  }
}
