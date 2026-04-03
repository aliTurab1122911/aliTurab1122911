import { NextResponse } from "next/server";
import { network } from "@/lib/message-flow";

export async function GET() {
  const status = await network.getStatus();
  return NextResponse.json({ nodes: status });
}
