import { NextRequest, NextResponse } from "next/server";
import { network } from "@/lib/message-flow";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const message = body.message.trim();
  const pseudonym = typeof body.pseudonym === "string" && body.pseudonym.trim().length > 0
    ? body.pseudonym.trim()
    : "anonymous";

  if (message.length === 0 || message.length > 280) {
    return NextResponse.json({ error: "message must be 1-280 characters" }, { status: 400 });
  }

  const result = await network.submitMessage({ pseudonym, message });
  return NextResponse.json({ ok: true, ...result });
}
