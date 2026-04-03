import { NextRequest, NextResponse } from "next/server";
import { createGuestSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const guestId = await createGuestSession();
  return NextResponse.redirect(new URL(`/projects?guest=${guestId}`, req.url));
}
