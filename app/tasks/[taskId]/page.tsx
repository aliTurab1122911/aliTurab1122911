import { notFound } from "next/navigation";
import { listActivityForTask } from "@/lib/activity";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import { getTaskById } from "@/lib/tasks";
import { listUsers } from "@/lib/users";
import { getCurrentUser } from "@/lib/auth";

export default async function TaskDetailPage({ params, searchParams }: { params: Promise<{ taskId: string }>; searchParams: Promise<{ error?: string }> }) {
  const { taskId } = await params;
  const s = await searchParams;
  const task = await getTaskById(taskId);
  if (!task) notFound();
  const user = await getCurrentUser();
  if (user?.id.startsWith("guest_") && task.reporter_id !== user.id) {
    notFound();
  }

  const [users, activity] = await Promise.all([listUsers(), listActivityForTask(task.id)]);

  return (
    <main className="grid grid-2">
      <section className="card">
        <h1>Task Detail</h1>
        {s.error ? <div className="alert">Invalid task input.</div> : null}
        <form action="/api/tasks" method="post">
          <input type="hidden" name="intent" value="update" />
          <input type="hidden" name="task_id" value={task.id} />

          <label>Title</label>
          <input name="title" defaultValue={task.title} required />
          <label>Description</label>
          <textarea name="description" defaultValue={task.description} rows={4} />

          <label>Assignee</label>
          <select name="assignee_id" defaultValue={task.assignee_id}>
            {users.map((u) => (<option key={u.id} value={u.id}>{u.full_name}</option>))}
          </select>

          <label>Status</label>
          <select name="status" defaultValue={task.status}>{TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>

          <label>Priority</label>
          <select name="priority" defaultValue={task.priority}>{TASK_PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>

          <label>Start Date</label>
          <input type="date" name="start_date" defaultValue={task.start_date} />
          <label>Due Date</label>
          <input type="date" name="due_date" defaultValue={task.due_date} />
          <label>Tags</label>
          <input name="tags" defaultValue={task.tags} />

          <div style={{ display: "flex", gap: ".5rem", marginTop: ".8rem" }}>
            <button type="submit">Save</button>
          </div>
        </form>
        <form action="/api/tasks" method="post" style={{ marginTop: ".5rem" }}>
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="task_id" value={task.id} />
          <button type="submit" className="secondary">Delete Task</button>
        </form>
      </section>

      <section className="card">
        <h2>Activity</h2>
        {activity.map((item) => (
          <div key={item.id} style={{ marginBottom: ".7rem" }}>
            <strong>{item.action}</strong>
            <div><small className="muted">By {item.user_id} at {item.created_at}</small></div>
          </div>
        ))}
      </section>
    </main>
  );
}
