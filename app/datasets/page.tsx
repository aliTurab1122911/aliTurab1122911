import { readCsv } from '@/lib/csv';
import type { TrainingRow, Feedback } from '@/lib/types';

export default async function DatasetsPage() {
  const training = await readCsv<TrainingRow>('training_data.csv').catch(() => []);
  const feedback = await readCsv<Feedback>('feedback.csv').catch(() => []);

  return (
    <>
      <section className="card">
        <h2>Training Dataset</h2>
        <p className="small">Rows: {training.length}</p>
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
            {training.slice(0, 30).map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.question}</td>
                <td>{row.answer}</td>
                <td>{row.keywords}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Feedback Dataset</h2>
        <p className="small">Rows: {feedback.length}</p>
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
      </section>
    </>
  );
}
