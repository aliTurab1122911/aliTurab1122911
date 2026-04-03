import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listTasks } from "@/lib/tasks";
import { isToday, isPast, parseISO } from "date-fns";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const tasks = await listTasks();
  const scopedTasks = user?.id.startsWith("guest_")
    ? tasks.filter((t) => t.reporter_id === user.id)
    : tasks;
  const myTasks = scopedTasks.filter((t) => t.assignee_id === user?.id || t.reporter_id === user?.id);
  const dueToday = myTasks.filter((t) => t.due_date && isToday(parseISO(t.due_date)));
  const overdue = myTasks.filter((t) => t.due_date && isPast(parseISO(t.due_date)) && t.status !== "Done");
  const recentlyUpdated = [...scopedTasks].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 6);

  return (
    <main className="grid">
      <section className="card">
        <h1>Dashboard</h1>
        <p>Welcome {user?.full_name}</p>
        <p><Link href="/projects">Go to Kanban</Link> · <Link href="/calendar">Go to Calendar</Link></p>
      </section>

      <section className="grid grid-2">
        <div className="card"><h3>My tasks</h3><p>{myTasks.length}</p></div>
        <div className="card"><h3>Due today</h3><p>{dueToday.length}</p></div>
        <div className="card"><h3>Overdue</h3><p>{overdue.length}</p></div>
        <div className="card"><h3>Recently updated</h3><p>{recentlyUpdated.length}</p></div>
      </section>
    </main>
  );
}
