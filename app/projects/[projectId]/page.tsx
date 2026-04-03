import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import { getProjectById } from "@/lib/projects";
import { listTasks } from "@/lib/tasks";
import { listUsers } from "@/lib/users";

export default async function ProjectBoardPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [tasks, users, user] = await Promise.all([listTasks(), listUsers(), getCurrentUser()]);
  const isGuest = user?.id.startsWith("guest_");
  const project = isGuest
    ? { id: "guest_project", key: "GUEST", name: "My Guest Project", description: "Temporary guest session board" }
    : await getProjectById(projectId);
  if (!project) notFound();

  const projectTasks = isGuest
    ? tasks.filter((t) => t.reporter_id === user?.id)
    : tasks.filter((t) => t.project_id === project.id);

  return (
    <main className="grid">
      <section className="card">
        <h1>{project.key} — {project.name}</h1>
        <p>{project.description}</p>
      </section>

      <section className="card">
        <h2>Create Task</h2>
        <form action="/api/tasks" method="post" className="grid grid-2">
          <input type="hidden" name="project_id" value={isGuest ? "guest_project" : project.id} />
          <div>
            <label>Title</label>
            <input name="title" required />
          </div>
          <div>
            <label>Assignee</label>
            <select name="assignee_id">
              {users.map((u) => (<option key={u.id} value={u.id}>{u.full_name}</option>))}
            </select>
          </div>
          <div>
            <label>Status</label>
            <select name="status">{TASK_STATUSES.map((s) => (<option key={s}>{s}</option>))}</select>
          </div>
          <div>
            <label>Priority</label>
            <select name="priority">{TASK_PRIORITIES.map((p) => (<option key={p}>{p}</option>))}</select>
          </div>
          <div>
            <label>Start Date</label>
            <input type="date" name="start_date" />
          </div>
          <div>
            <label>Due Date</label>
            <input type="date" name="due_date" />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label>Description</label>
            <textarea name="description" rows={3} />
            <label>Tags (comma separated)</label>
            <input name="tags" />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit">Create Task</button>
          </div>
        </form>
        <small className="muted">Reporter: {user?.full_name}</small>
      </section>

      <KanbanBoard tasks={projectTasks} />
    </main>
  );
}
