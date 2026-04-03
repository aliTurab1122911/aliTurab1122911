"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { LedgerRecord, NodeStatus } from "@/lib/types";

const NODE_IDS = ["nodeA", "nodeB", "nodeC"] as const;
type NodeId = (typeof NODE_IDS)[number];

export default function HomePage() {
  const [pseudonym, setPseudonym] = useState("anonymous");
  const [message, setMessage] = useState("");
  const [activeNode, setActiveNode] = useState<NodeId>("nodeA");
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [status, setStatus] = useState<NodeStatus[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  async function loadLedger(node: NodeId): Promise<void> {
    const response = await fetch(`/api/ledger?node=${node}`);
    const data = await response.json();
    setRecords(data.records ?? []);
  }

  async function loadStatus(): Promise<void> {
    const response = await fetch("/api/network/status");
    const data = await response.json();
    setStatus(data.nodes ?? []);
  }

  useEffect(() => {
    void loadLedger(activeNode);
  }, [activeNode]);

  useEffect(() => {
    void loadStatus();
  }, []);

  const syncStatus = useMemo(() => {
    if (status.length < 2) {
      return "unknown";
    }
    const first = status[0];
    const aligned = status.every((node) => node.height === first.height && node.lastHash === first.lastHash);
    return aligned ? "in sync" : "out of sync";
  }, [status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!message.trim()) {
      setFeedback("Write a message before submitting.");
      return;
    }

    setSubmitting(true);
    setFeedback("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudonym, message })
      });

      const data = await response.json();

      if (!response.ok) {
        setFeedback(data.error ?? "Something went wrong.");
        return;
      }

      setMessage("");
      setFeedback(`Message appended at block #${data.record.height} and propagated to ${data.propagatedTo.join(", ")}.`);
      await Promise.all([loadLedger(activeNode), loadStatus()]);
    } catch {
      setFeedback("Network error while submitting message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card elevation-2">
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
        <article className="elevation-1 status-card">
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

        <article className="elevation-1 ledger-card">
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
      </section>
    </main>
  );
}
