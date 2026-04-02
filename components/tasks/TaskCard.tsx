import Link from "next/link";
import { Task } from "@/lib/types";

export function TaskCard({ task }: { task: Task }) {
  return (
    <div className="task-card">
      <strong>{task.title}</strong>
      <div><small className="muted">{task.priority} • Due {task.due_date || "N/A"}</small></div>
      <div><small className="muted">Assignee: {task.assignee_id}</small></div>
      <div style={{ marginTop: ".4rem" }}>
        <Link href={`/tasks/${task.id}`}>View Task</Link>
      </div>
    </div>
  );
}
