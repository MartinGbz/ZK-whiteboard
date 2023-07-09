import { NextResponse } from "next/server";
import { Message } from "../../types/whiteboard-types";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const messages = await prisma.message.findMany();
  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const message = await req.json();
  console.log(message);
  const newMessage = await prisma.message.create({
    data: {
      userId: message.userId,
      text: message.text,
      positionX: message.positionX,
      positionY: message.positionY,
    },
  });
  return NextResponse.json(newMessage);
}
