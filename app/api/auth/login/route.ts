import { NextRequest, NextResponse } from "next/server";
import { createSession, loginWithCredentials } from "@/lib/auth";
import { ensureDataFiles } from "@/lib/bootstrap";

export async function POST(req: NextRequest) {
  await ensureDataFiles();
  const form = await req.formData();
  const identifier = String(form.get("identifier") ?? "");
  const password = String(form.get("password") ?? "");

  const user = await loginWithCredentials(identifier, password);
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid_credentials", req.url));
  }

  await createSession(user.id);
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
