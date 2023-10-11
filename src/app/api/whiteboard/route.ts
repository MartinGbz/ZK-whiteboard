import { NextResponse } from "next/server";

import { prisma } from "../db";
import { getWhiteboardById } from "../common";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const whiteboards = await prisma.whiteboard.findMany();
  return NextResponse.json(whiteboards, { status: 200 });
}

export async function POST(req: Request): Promise<NextResponse> {
  const id = await req.json();
  const whiteboard = await getWhiteboardById(parseInt(id));
  if (!whiteboard) {
    return NextResponse.json(
      { error: "Whiteboard not found" },
      { status: 404 }
    );
  }
  return NextResponse.json(whiteboard, { status: 200 });
}
