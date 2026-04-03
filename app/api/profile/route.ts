import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { updatePassword, updateProfile } from "@/lib/users";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().min(1).max(120),
  avatar: z.string().max(12).optional().default("")
});

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

  const parsed = profileSchema.safeParse({
    full_name: String(form.get("full_name") ?? user.full_name).trim(),
    avatar: String(form.get("avatar") ?? user.avatar).trim()
  });
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/profile?error=invalid_profile", req.url));
  }
  await updateProfile(user.id, parsed.data);

  return NextResponse.redirect(new URL("/profile?ok=profile_updated", req.url));
}
