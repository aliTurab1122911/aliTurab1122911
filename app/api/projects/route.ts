import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { createProject } from "@/lib/projects";
import { canManageProjects } from "@/lib/permissions";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1).max(120),
  key: z.string().min(2).max(8).regex(/^[A-Za-z0-9_-]+$/),
  description: z.string().max(500).optional().default("")
});

export async function POST(req: NextRequest) {
  const user = await getSessionUserFromRequest(req);
  if (!user) return NextResponse.redirect(new URL("/login", req.url));
  if (!canManageProjects(user)) return new NextResponse("Forbidden", { status: 403 });

  const form = await req.formData();
  const parsed = createProjectSchema.safeParse({
    name: String(form.get("name") ?? "").trim(),
    key: String(form.get("key") ?? "").trim(),
    description: String(form.get("description") ?? "").trim()
  });
  if (!parsed.success) return NextResponse.redirect(new URL("/projects?error=invalid_fields", req.url));

  await createProject({ ...parsed.data, createdBy: user.id });
  return NextResponse.redirect(new URL("/projects", req.url));
}
