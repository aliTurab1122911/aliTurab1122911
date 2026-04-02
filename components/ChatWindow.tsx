'use client';

import { useState } from 'react';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';

type UiMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export default function ChatWindow({ initialSessionId }: { initialSessionId: string }) {
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [busy, setBusy] = useState(false);

  async function startNewSession() {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'General' })
    });
    const data = (await response.json()) as { sessionId: string };
    setSessionId(data.sessionId);
    setMessages([]);
  }

  async function onSend(value: string) {
    setBusy(true);
    const userMessage: UiMessage = { id: crypto.randomUUID(), role: 'user', text: value };
    setMessages((prev) => [...prev, userMessage]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message: value })
    });

    const data = (await response.json()) as { reply: string; messageId: string };
    const assistant: UiMessage = { id: data.messageId, role: 'assistant', text: data.reply };
    setMessages((prev) => [...prev, assistant]);
    setBusy(false);
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong>Session: {sessionId}</strong>
        <button className="btn" onClick={startNewSession}>
          New Chat
        </button>
      </div>

      <div className="messages" style={{ marginTop: 10 }}>
        {messages.length === 0 ? <p className="small">No messages yet. Start chatting.</p> : null}
        {messages.map((message) => (
          <MessageBubble key={message.id} role={message.role} text={message.text} />
        ))}
      </div>

      <InputBar onSend={onSend} disabled={busy} />
    </div>
  );
}
