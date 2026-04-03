import { MonthGrid } from "@/components/calendar/MonthGrid";
import { getCurrentUser } from "@/lib/auth";
import { listProjects } from "@/lib/projects";
import { listTasks } from "@/lib/tasks";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ mine?: string; project?: string; status?: string }> }) {
  const params = await searchParams;
  const [user, tasks, projects] = await Promise.all([getCurrentUser(), listTasks(), listProjects()]);

  let filtered = tasks;
  if (params.mine === "1" && user) filtered = filtered.filter((t) => t.assignee_id === user.id);
  if (params.project) filtered = filtered.filter((t) => t.project_id === params.project);
  if (params.status) filtered = filtered.filter((t) => t.status === params.status);

  return (
    <main className="grid">
      <section className="card">
        <h1>Calendar</h1>
        <form method="get" className="grid grid-2">
          <div>
            <label>Scope</label>
            <select name="mine" defaultValue={params.mine ?? "0"}>
              <option value="0">All tasks</option>
              <option value="1">My tasks</option>
            </select>
          </div>
          <div>
            <label>Project</label>
            <select name="project" defaultValue={params.project ?? ""}>
              <option value="">All projects</option>
              {projects.map((p) => (<option key={p.id} value={p.id}>{p.key}</option>))}
            </select>
          </div>
          <div>
            <label>Status</label>
            <input name="status" defaultValue={params.status ?? ""} placeholder="e.g. In Progress" />
          </div>
          <div style={{alignSelf:"end"}}><button type="submit">Apply Filters</button></div>
        </form>
      </section>

      <section className="card">
        <MonthGrid tasks={filtered} month={new Date()} />
      </section>
    </main>
  );
}
