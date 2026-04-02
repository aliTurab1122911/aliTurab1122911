'use client';

import { useState } from 'react';

export default function InputBar({ onSend, disabled }: { onSend: (value: string) => Promise<void>; disabled: boolean }) {
  const [text, setText] = useState('');

  return (
    <form
      className="row"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!text.trim()) return;
        await onSend(text.trim());
        setText('');
      }}
    >
      <input
        className="input"
        value={text}
        placeholder="Ask something..."
        onChange={(event) => setText(event.target.value)}
      />
      <button className="btn" type="submit" disabled={disabled || !text.trim()}>
        Send
      </button>
    </form>
  );
}
