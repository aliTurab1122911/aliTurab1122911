"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { LedgerRecord, NodeStatus } from "@/lib/types";

const NODE_IDS = ["nodeA", "nodeB", "nodeC"] as const;
type NodeId = (typeof NODE_IDS)[number];

interface NodeLedgerResponse {
  node: NodeId;
  records: LedgerRecord[];
}

function formatNow(): string {
  return new Date().toLocaleTimeString();
}

export default function HomePage() {
  const [pseudonym, setPseudonym] = useState("anonymous");
  const [message, setMessage] = useState("");
  const [activeNode, setActiveNode] = useState<NodeId>("nodeA");
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [status, setStatus] = useState<NodeStatus[]>([]);
  const [allLedgers, setAllLedgers] = useState<Record<NodeId, LedgerRecord[]>>({
    nodeA: [],
    nodeB: [],
    nodeC: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([
    "[boot] Anonymous Chain Messenger UI initialized.",
    "[boot] Awaiting first message broadcast."
  ]);

  function pushLog(entry: string): void {
    setLogs((previous) => [`[${formatNow()}] ${entry}`, ...previous].slice(0, 20));
  }

  async function loadLedger(node: NodeId): Promise<void> {
    const response = await fetch(`/api/ledger?node=${node}`);
    const data = (await response.json()) as NodeLedgerResponse;
    setRecords(data.records ?? []);
  }

  async function loadAllLedgers(): Promise<void> {
    const responses = await Promise.all(
      NODE_IDS.map(async (nodeId) => {
        const response = await fetch(`/api/ledger?node=${nodeId}`);
        return (await response.json()) as NodeLedgerResponse;
      })
    );

    setAllLedgers({
      nodeA: responses.find((item) => item.node === "nodeA")?.records ?? [],
      nodeB: responses.find((item) => item.node === "nodeB")?.records ?? [],
      nodeC: responses.find((item) => item.node === "nodeC")?.records ?? []
    });
  }

  async function loadStatus(): Promise<void> {
    const response = await fetch("/api/network/status");
    const data = await response.json();
    setStatus(data.nodes ?? []);
  }

  async function refreshAll(nodeToRefresh: NodeId): Promise<void> {
    await Promise.all([loadLedger(nodeToRefresh), loadStatus(), loadAllLedgers()]);
  }

  useEffect(() => {
    void loadLedger(activeNode);
  }, [activeNode]);

  useEffect(() => {
    void (async () => {
      await refreshAll(activeNode);
      pushLog("[sync] Initial status, ledgers, and metrics loaded.");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncStatus = useMemo(() => {
    if (status.length < 2) {
      return "unknown";
    }
    const first = status[0];
    const aligned = status.every((node) => node.height === first.height && node.lastHash === first.lastHash);
    return aligned ? "in sync" : "out of sync";
  }, [status]);

  const metrics = useMemo(() => {
    const totalBlocks = NODE_IDS.reduce((acc, nodeId) => acc + (allLedgers[nodeId]?.length ?? 0), 0);
    const uniqueMessages = new Set(
      NODE_IDS.flatMap((nodeId) => (allLedgers[nodeId] ?? []).map((record) => record.messageId))
    ).size;

    const avgMessageLength = (() => {
      const allMessages = NODE_IDS.flatMap((nodeId) => (allLedgers[nodeId] ?? []).map((record) => record.message));
      if (allMessages.length === 0) {
        return 0;
      }
      return Math.round(allMessages.reduce((acc, item) => acc + item.length, 0) / allMessages.length);
    })();

    return {
      totalBlocks,
      uniqueMessages,
      avgMessageLength,
      activeNodes: status.length,
      highestBlock: Math.max(0, ...status.map((node) => node.height))
    };
  }, [allLedgers, status]);

  const propagationMatrix = useMemo(() => {
    const sender = "nodeA";
    return NODE_IDS.map((target) => ({
      sender,
      target,
      delivered: (allLedgers[target]?.length ?? 0) > 0
    }));
  }, [allLedgers]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!message.trim()) {
      setFeedback("Write a message before submitting.");
      pushLog("[warn] Submit blocked: empty message payload.");
      return;
    }

    setSubmitting(true);
    setFeedback("");
    pushLog(`[tx] Message queued by ${pseudonym || "anonymous"}.`);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudonym, message })
      });

      const data = await response.json();

      if (!response.ok) {
        setFeedback(data.error ?? "Something went wrong.");
        pushLog(`[error] Broadcast failed: ${data.error ?? "unknown error"}.`);
        return;
      }

      setMessage("");
      setFeedback(`Message appended at block #${data.record.height} and propagated to ${data.propagatedTo.join(", ")}.`);
      pushLog(`[ledger] Block #${data.record.height} hashed: ${data.record.hash.slice(0, 12)}...`);
      pushLog(`[net] Broadcast complete to ${data.propagatedTo.join(", ")}.`);

      await refreshAll(activeNode);
    } catch {
      setFeedback("Network error while submitting message.");
      pushLog("[error] Network error while sending message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card elevation-2 gradient-surface">
        <h1 className="title">Anonymous Chain Messenger</h1>
        <p className="subtitle">
          A blockchain-inspired anonymous communication network with simulated nodes, append-only CSV ledgers, and local
          hashing.
        </p>

        <form className="message-form" onSubmit={handleSubmit}>
          <label>
            Pseudonym
            <input value={pseudonym} onChange={(event) => setPseudonym(event.target.value)} maxLength={24} />
          </label>
          <label>
            Message
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={280}
              rows={5}
              placeholder="Send an anonymous message to the simulated network..."
            />
          </label>
          <button className="button-86" role="button" type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Broadcast"}
          </button>
        </form>

        {feedback ? <p className="feedback">{feedback}</p> : null}
      </section>

      <section className="status-grid">
        <article className="elevation-1 status-card colorful-card">
          <h2>Network Status</h2>
          <p className="chip">{syncStatus}</p>
          <ul>
            {status.map((node) => (
              <li key={node.nodeId}>
                <strong>{node.nodeId}</strong> — height {node.height}, hash {node.lastHash.slice(0, 14)}...
              </li>
            ))}
          </ul>
        </article>

        <article className="elevation-1 status-card colorful-card secondary">
          <h2>Backend Process Flow</h2>
          <ol className="process-list">
            <li>UI captures pseudonym and message.</li>
            <li>API sends payload to simulated source node (`nodeA`).</li>
            <li>Node computes `hash(prevHash + payload)` and appends CSV block.</li>
            <li>Record is propagated internally to peer nodes (`nodeB`, `nodeC`).</li>
            <li>Network cards and ledgers refresh to reflect consensus state.</li>
          </ol>
        </article>

        <article className="elevation-1 status-card colorful-card tertiary">
          <h2>System Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-tile">
              <span>Total Blocks (all ledgers)</span>
              <strong>{metrics.totalBlocks}</strong>
            </div>
            <div className="metric-tile">
              <span>Unique Messages</span>
              <strong>{metrics.uniqueMessages}</strong>
            </div>
            <div className="metric-tile">
              <span>Avg Message Length</span>
              <strong>{metrics.avgMessageLength}</strong>
            </div>
            <div className="metric-tile">
              <span>Highest Block</span>
              <strong>{metrics.highestBlock}</strong>
            </div>
            <div className="metric-tile">
              <span>Active Nodes</span>
              <strong>{metrics.activeNodes}</strong>
            </div>
          </div>
        </article>

        <article className="elevation-1 ledger-card wide-card">
          <div className="ledger-header">
            <h2>Ledger Viewer</h2>
            <div className="tabs">
              {NODE_IDS.map((nodeId) => (
                <button
                  key={nodeId}
                  className={`tab ${activeNode === nodeId ? "tab-active" : ""}`}
                  onClick={() => setActiveNode(nodeId)}
                  type="button"
                >
                  {nodeId}
                </button>
              ))}
            </div>
          </div>

          <div className="ledger-list">
            {records.length === 0 ? <p>No blocks yet for {activeNode}.</p> : null}
            {records.map((record) => (
              <article key={`${record.messageId}-${record.hash}`} className="block-row">
                <header>
                  <span>#{record.height}</span>
                  <span>{new Date(record.timestamp).toLocaleString()}</span>
                </header>
                <p>{record.message}</p>
                <footer>
                  <small>{record.pseudonym}</small>
                  <small>{record.hash.slice(0, 16)}...</small>
                </footer>
              </article>
            ))}
          </div>
        </article>

        <article className="elevation-1 status-card wide-card matrix-card">
          <h2>Propagation Matrix</h2>
          <table>
            <thead>
              <tr>
                <th>Sender</th>
                <th>Target</th>
                <th>Delivered</th>
              </tr>
            </thead>
            <tbody>
              {propagationMatrix.map((entry) => (
                <tr key={`${entry.sender}-${entry.target}`}>
                  <td>{entry.sender}</td>
                  <td>{entry.target}</td>
                  <td>{entry.delivered ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="elevation-1 terminal-card wide-card">
          <h2>Network Console</h2>
          <div className="terminal-window">
            {logs.map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
