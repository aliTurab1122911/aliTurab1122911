import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { updatePassword, updateProfile } from "@/lib/users";

export async function POST(req: NextRequest) {
  const user = await getSessionUserFromRequest(req);
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const form = await req.formData();
  const intent = String(form.get("intent") ?? "profile");

  if (intent === "password") {
    const password = String(form.get("password") ?? "");
    if (password.length < 8) return NextResponse.redirect(new URL("/profile?error=password_too_short", req.url));
    await updatePassword(user.id, password);
    return NextResponse.redirect(new URL("/profile?ok=password_updated", req.url));
  }

  const full_name = String(form.get("full_name") ?? user.full_name);
  const avatar = String(form.get("avatar") ?? user.avatar);
  await updateProfile(user.id, { full_name, avatar });

  return NextResponse.redirect(new URL("/profile?ok=profile_updated", req.url));
}
