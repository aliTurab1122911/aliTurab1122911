import { readCsv } from '@/lib/csv';
import type { TrainingRow, Feedback, ChatMessage, Session } from '@/lib/types';
import ClearTrainingButton from '@/components/ClearTrainingButton';

export default async function DatasetsPage() {
  const training = await readCsv<TrainingRow>('training_data.csv').catch(() => []);
  const feedback = await readCsv<Feedback>('feedback.csv').catch(() => []);
  const messages = await readCsv<ChatMessage>('messages.csv').catch(() => []);
  const sessions = await readCsv<Session>('sessions.csv').catch(() => []);

  return (
    <>
      <section className="card">
        <h2>Training Dataset</h2>
        <p className="small">Rows: {training.length} (shows full list)</p>
        <ClearTrainingButton />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Question</th>
                <th>Answer</th>
                <th>Keywords</th>
              </tr>
            </thead>
            <tbody>
              {training.map((row) => (
                <tr key={row.id + row.question}>
                  <td>{row.id}</td>
                  <td>{row.question}</td>
                  <td>{row.answer}</td>
                  <td>{row.keywords}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Chat Sessions Dataset</h2>
        <p className="small">Every chat session is tracked and visible here.</p>
        <div className="table-wrap">
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
              {sessions.map((row) => (
                <tr key={row.session_id}>
                  <td>{row.session_id}</td>
                  <td>{row.created_at}</td>
                  <td>{row.last_active_at}</td>
                  <td>{row.topic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Chat Messages Dataset</h2>
        <p className="small">Rows: {messages.length}</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Message ID</th>
                <th>Session ID</th>
                <th>Role</th>
                <th>Text</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((row) => (
                <tr key={row.message_id}>
                  <td>{row.message_id}</td>
                  <td>{row.session_id}</td>
                  <td>{row.role}</td>
                  <td>{row.text}</td>
                  <td>{row.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Feedback Dataset</h2>
        <p className="small">Rows: {feedback.length}</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Feedback ID</th>
                <th>Message ID</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((row) => (
                <tr key={row.feedback_id}>
                  <td>{row.feedback_id}</td>
                  <td>{row.message_id}</td>
                  <td>{row.rating}</td>
                  <td>{row.comment}</td>
                  <td>{row.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
