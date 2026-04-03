import Link from "next/link";
import { Task } from "@/lib/types";
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";

export function MonthGrid({ tasks, month }: { tasks: Task[]; month: Date }) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="calendar-grid">
      {days.map((day) => {
        const isoDay = format(day, "yyyy-MM-dd");
        const items = tasks.filter((t) => t.due_date === isoDay || t.start_date === isoDay);

        return (
          <div className="day-cell" key={isoDay}>
            <strong>{format(day, "d")}</strong>
            <div>
              {items.map((task) => (
                <div key={task.id}>
                  <Link href={`/tasks/${task.id}`}>{task.title}</Link>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
