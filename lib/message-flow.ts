import { ensureCsv, appendCsvRow } from "@/lib/csv";
import { NodeSimulator } from "@/lib/node-simulator";
import type { LedgerRecord, MessageInput, NodeId, NodeStatus } from "@/lib/types";

const MESSAGE_HEADER = ["messageId", "timestamp", "pseudonym", "message"];

export class AnonymousMessageNetwork {
  private readonly nodes: Record<NodeId, NodeSimulator>;
  private initialized: boolean;

  constructor() {
    this.nodes = {
      nodeA: new NodeSimulator("nodeA"),
      nodeB: new NodeSimulator("nodeB"),
      nodeC: new NodeSimulator("nodeC")
    };
    this.initialized = false;
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await ensureCsv("messages.csv", MESSAGE_HEADER);
    await Promise.all(Object.values(this.nodes).map((node) => node.init()));
    this.initialized = true;
  }

  async submitMessage(input: MessageInput): Promise<{ record: LedgerRecord; propagatedTo: NodeId[] }> {
    await this.init();

    const record = await this.nodes.nodeA.createRecord(input);

    await appendCsvRow("messages.csv", [
      record.messageId,
      record.timestamp,
      record.pseudonym,
      record.message
    ]);

    const propagatedTo: NodeId[] = [];

    for (const peer of [this.nodes.nodeB, this.nodes.nodeC]) {
      await peer.acceptRecord(record);
      propagatedTo.push(peer.nodeId);
    }

    return { record, propagatedTo };
  }

  async getLedger(nodeId: NodeId): Promise<LedgerRecord[]> {
    await this.init();
    return this.nodes[nodeId].readLedger();
  }

  async getStatus(): Promise<NodeStatus[]> {
    await this.init();
    return Object.values(this.nodes).map((node) => node.getStatus());
  }

  async verifyNode(nodeId: NodeId): Promise<{ valid: boolean; brokenAt: number | null }> {
    const ledger = await this.getLedger(nodeId);

    let previousHash = "GENESIS";
    for (const row of ledger) {
      if (row.prevHash !== previousHash) {
        return { valid: false, brokenAt: row.height };
      }
      previousHash = row.hash;
    }

    return { valid: true, brokenAt: null };
  }
}

export const network = new AnonymousMessageNetwork();
