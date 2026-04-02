import ChatWindow from '@/components/ChatWindow';
import TrainingUpload from '@/components/TrainingUpload';
import { randomUUID } from 'crypto';

export default async function HomePage() {
  const initialSessionId = `s_${randomUUID()}`;

  return (
    <>
      <section className="card">
        <h2>Upload Training CSV</h2>
        <p className="small">
          CSV must include headers: <code>id,question,answer,keywords</code>. Upload appends rows to existing training data.
        </p>
        <TrainingUpload />
      </section>

      <ChatWindow initialSessionId={initialSessionId} />
    </>
  );
}
