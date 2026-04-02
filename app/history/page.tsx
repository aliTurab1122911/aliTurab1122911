import { readCsv } from '@/lib/csv';
import type { Session } from '@/lib/types';

export default async function HistoryPage() {
  const sessions = await readCsv<Session>('sessions.csv').catch(() => []);

  return (
    <section className="card">
      <h2>Session History</h2>
      <table>
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Created</th>
            <th>Last Active</th>
            <th>Topic</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.session_id}>
              <td>{session.session_id}</td>
              <td>{session.created_at}</td>
              <td>{session.last_active_at}</td>
              <td>{session.topic}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
