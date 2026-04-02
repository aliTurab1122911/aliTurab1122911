'use client';

import { useState } from 'react';

export default function ClearTrainingButton() {
  const [status, setStatus] = useState('');

  return (
    <div className="row" style={{ marginBottom: 10 }}>
      <button
        className="button-30"
        onClick={async () => {
          if (!window.confirm('Clear the entire training dataset?')) return;
          const response = await fetch('/api/training/clear', { method: 'POST' });
          if (!response.ok) {
            setStatus('Failed to clear dataset.');
            return;
          }
          setStatus('Training dataset cleared. Refreshing...');
          window.location.reload();
        }}
      >
        Clear Training Dataset
      </button>
      {status ? <span className="small">{status}</span> : null}
    </div>
  );
}
