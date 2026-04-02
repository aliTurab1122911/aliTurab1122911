import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { createTask, removeTask, updateTask } from "@/lib/tasks";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import { Task } from "@/lib/types";

export async function POST(req: NextRequest) {
  const user = await getSessionUserFromRequest(req);
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const form = await req.formData();
  const intent = String(form.get("intent") ?? "create");

  if (intent === "delete") {
    const taskId = String(form.get("task_id") ?? "");
    await removeTask(taskId, user.id);
    return NextResponse.redirect(new URL("/projects", req.url));
  }

  if (intent === "update") {
    const taskId = String(form.get("task_id") ?? "");
    const patch: Partial<Task> = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      status: String(form.get("status") ?? "") as Task["status"],
      priority: String(form.get("priority") ?? "") as Task["priority"],
      assignee_id: String(form.get("assignee_id") ?? ""),
      due_date: String(form.get("due_date") ?? ""),
      start_date: String(form.get("start_date") ?? ""),
      tags: String(form.get("tags") ?? "")
    };

    if (patch.status && !TASK_STATUSES.includes(patch.status)) {
      return NextResponse.redirect(new URL(`/tasks/${taskId}?error=invalid_status`, req.url));
    }

    if (patch.priority && !TASK_PRIORITIES.includes(patch.priority)) {
      return NextResponse.redirect(new URL(`/tasks/${taskId}?error=invalid_priority`, req.url));
    }

    await updateTask(taskId, patch, user.id);
    return NextResponse.redirect(new URL(`/tasks/${taskId}`, req.url));
  }

  const project_id = String(form.get("project_id") ?? "");
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const status = String(form.get("status") ?? "Backlog") as Task["status"];
  const priority = String(form.get("priority") ?? "Medium") as Task["priority"];
  const assignee_id = String(form.get("assignee_id") ?? user.id);
  const reporter_id = user.id;
  const due_date = String(form.get("due_date") ?? "");
  const start_date = String(form.get("start_date") ?? "");
  const tags = String(form.get("tags") ?? "");

  if (!title || !project_id) {
    return NextResponse.redirect(new URL("/projects?error=missing_fields", req.url));
  }

  await createTask({ project_id, title, description, status, priority, assignee_id, reporter_id, due_date, start_date, tags });
  return NextResponse.redirect(new URL(`/projects/${project_id}`, req.url));
}
