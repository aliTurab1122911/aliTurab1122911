export type NodeId = "nodeA" | "nodeB" | "nodeC";

export interface MessageInput {
  pseudonym: string;
  message: string;
}

export interface LedgerRecord {
  height: number;
  timestamp: string;
  messageId: string;
  pseudonym: string;
  message: string;
  prevHash: string;
  hash: string;
  originNode: NodeId;
}

export interface NodeStatus {
  nodeId: NodeId;
  height: number;
  lastHash: string;
}
