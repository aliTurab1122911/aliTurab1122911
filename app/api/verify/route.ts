import { NextRequest, NextResponse } from "next/server";
import { network } from "@/lib/message-flow";
import type { NodeId } from "@/lib/types";

const NODE_IDS: NodeId[] = ["nodeA", "nodeB", "nodeC"];

export async function GET(request: NextRequest) {
  const node = request.nextUrl.searchParams.get("node") as NodeId | null;

  if (!node || !NODE_IDS.includes(node)) {
    return NextResponse.json({ error: "valid node is required" }, { status: 400 });
  }

  const verification = await network.verifyNode(node);
  return NextResponse.json({ node, ...verification });
}
