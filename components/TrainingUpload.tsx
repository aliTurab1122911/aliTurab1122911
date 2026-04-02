'use client';

import { useState } from 'react';

export default function TrainingUpload() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="row"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        setBusy(true);
        setMessage('Uploading...');

        const response = await fetch('/api/training/upload', {
          method: 'POST',
          body: formData
        });

        const data = (await response.json()) as { ok?: boolean; rows?: number; error?: string };
        if (!response.ok) {
          setMessage(data.error ?? 'Upload failed');
        } else {
          setMessage(`Upload complete. Training rows loaded: ${data.rows ?? 0}`);
          form.reset();
        }
        setBusy(false);
      }}
    >
      <input type="file" name="file" accept=".csv,text/csv" required />
      <button className="btn" type="submit" disabled={busy}>
        {busy ? 'Uploading...' : 'Upload & Train'}
      </button>
      {message ? <span className="small">{message}</span> : null}
    </form>
  );
}
