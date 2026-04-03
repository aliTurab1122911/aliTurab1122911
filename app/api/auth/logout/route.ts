import { NextRequest, NextResponse } from "next/server";
import { clearSession, getSessionUserFromRequest } from "@/lib/auth";
import { clearGuestTasks } from "@/lib/tasks";

export async function POST(req: NextRequest) {
  const user = await getSessionUserFromRequest(req);
  if (user?.id.startsWith("guest_")) {
    await clearGuestTasks(user.id);
  }
  await clearSession();
  return NextResponse.redirect(new URL("/login", req.url));
}
