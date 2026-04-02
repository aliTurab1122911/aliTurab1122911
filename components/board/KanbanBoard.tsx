import { TASK_STATUSES } from "@/lib/constants";
import { Task } from "@/lib/types";
import { TaskCard } from "@/components/tasks/TaskCard";

export function KanbanBoard({ tasks }: { tasks: Task[] }) {
  return (
    <div className="columns">
      {TASK_STATUSES.map((status) => (
        <div key={status} className="card">
          <h3>{status}</h3>
          {tasks.filter((task) => task.status === status).map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ))}
    </div>
  );
}
