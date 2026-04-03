import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { createTask, getTaskById, removeTask, updateTask } from "@/lib/tasks";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import { Task } from "@/lib/types";
import { z } from "zod";
import { canManageTask } from "@/lib/permissions";

const createTaskSchema = z.object({
  project_id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  status: z.string().refine((value) => TASK_STATUSES.includes(value as (typeof TASK_STATUSES)[number])),
  priority: z.string().refine((value) => TASK_PRIORITIES.includes(value as (typeof TASK_PRIORITIES)[number])),
  assignee_id: z.string().min(1),
  due_date: z.string().optional().default(""),
  start_date: z.string().optional().default(""),
  tags: z.string().optional().default("")
});

export async function POST(req: NextRequest) {
  const user = await getSessionUserFromRequest(req);
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const form = await req.formData();
  const intent = String(form.get("intent") ?? "create");

  if (intent === "delete") {
    const taskId = String(form.get("task_id") ?? "");
    const existing = await getTaskById(taskId);
    if (!existing) return NextResponse.redirect(new URL("/projects?error=task_not_found", req.url));
    if (!canManageTask(user, existing.reporter_id)) return new NextResponse("Forbidden", { status: 403 });
    await removeTask(taskId, user.id);
    return NextResponse.redirect(new URL("/projects", req.url));
  }

  if (intent === "update") {
    const taskId = String(form.get("task_id") ?? "");
    const patch = {
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

    const existing = await getTaskById(taskId);
    if (!existing) return NextResponse.redirect(new URL("/projects?error=task_not_found", req.url));
    if (!canManageTask(user, existing.reporter_id)) return new NextResponse("Forbidden", { status: 403 });
    await updateTask(taskId, patch, user.id);
    return NextResponse.redirect(new URL(`/tasks/${taskId}`, req.url));
  }

  const parsed = createTaskSchema.safeParse({
    project_id: user.id.startsWith("guest_") ? "guest_project" : String(form.get("project_id") ?? ""),
    title: String(form.get("title") ?? "").trim(),
    description: String(form.get("description") ?? "").trim(),
    status: String(form.get("status") ?? "Backlog"),
    priority: String(form.get("priority") ?? "Medium"),
    assignee_id: user.id.startsWith("guest_") ? user.id : String(form.get("assignee_id") ?? user.id),
    due_date: String(form.get("due_date") ?? ""),
    start_date: String(form.get("start_date") ?? ""),
    tags: String(form.get("tags") ?? "")
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/projects?error=invalid_fields", req.url));
  }

  await createTask({
    ...parsed.data,
    status: parsed.data.status as Task["status"],
    priority: parsed.data.priority as Task["priority"],
    reporter_id: user.id
  });
  return NextResponse.redirect(new URL(`/projects/${parsed.data.project_id}`, req.url));
}
