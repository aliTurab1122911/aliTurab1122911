import { NextRequest, NextResponse } from "next/server";
import { network } from "@/lib/message-flow";
import type { NodeId } from "@/lib/types";

const NODE_IDS: NodeId[] = ["nodeA", "nodeB", "nodeC"];

export async function GET(request: NextRequest) {
  const node = request.nextUrl.searchParams.get("node") as NodeId | null;
  const target = node && NODE_IDS.includes(node) ? node : "nodeA";

  const records = await network.getLedger(target);
  return NextResponse.json({ node: target, records: records.slice().reverse() });
}
