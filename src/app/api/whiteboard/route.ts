import { NextResponse } from "next/server";

import { prisma } from "../db";

export async function GET() {
  const messages = await prisma.messages.findMany();
  return NextResponse.json(messages);
}
