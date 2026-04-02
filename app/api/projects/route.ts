import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { createProject } from "@/lib/projects";
import { canManageProjects } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  const user = await getSessionUserFromRequest(req);
  if (!user) return NextResponse.redirect(new URL("/login", req.url));
  if (!canManageProjects(user)) return new NextResponse("Forbidden", { status: 403 });

  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim();
  const key = String(form.get("key") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();

  if (!name || !key) return NextResponse.redirect(new URL("/projects?error=missing_fields", req.url));

  await createProject({ name, key, description, createdBy: user.id });
  return NextResponse.redirect(new URL("/projects", req.url));
}
