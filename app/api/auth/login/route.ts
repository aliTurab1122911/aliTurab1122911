import { NextRequest, NextResponse } from "next/server";
import { createSession, loginWithCredentials } from "@/lib/auth";
import { ensureDataFiles } from "@/lib/bootstrap";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1)
});

export async function POST(req: NextRequest) {
  await ensureDataFiles();
  const form = await req.formData();
  const parsed = loginSchema.safeParse({
    identifier: String(form.get("identifier") ?? "").trim(),
    password: String(form.get("password") ?? "")
  });
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/login?error=invalid_input", req.url));
  }

  const user = await loginWithCredentials(parsed.data.identifier, parsed.data.password);
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid_credentials", req.url));
  }

  await createSession(user.id);
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
