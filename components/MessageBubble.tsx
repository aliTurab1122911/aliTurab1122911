export default function MessageBubble({ role, text }: { role: 'user' | 'assistant'; text: string }) {
  return <div className={`msg ${role}`}>{text}</div>;
}
