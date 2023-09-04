import { NextResponse } from "next/server";

import { prisma } from "../db";
import { getWhiteboardById } from "../common";

// export const dynamic = "force-dynamic";

export async function GET() {
  const whiteboards = await prisma.whiteboard.findMany();
  return NextResponse.json(whiteboards);
}

export async function POST(req: Request): Promise<NextResponse> {
  const id = await req.json();
  const whiteboard = await getWhiteboardById(parseInt(id));
  return NextResponse.json(whiteboard);
}
