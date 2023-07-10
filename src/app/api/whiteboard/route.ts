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
  try {
    const existingMessage = await prisma.message.findUnique({
      where: {
        vaultId: message.vaultId,
      },
    });
    console.log("--°°° --- existingMessage");
    console.log(existingMessage);
    if (!existingMessage) {
      const newMessage = await prisma.message.create({
        data: {
          vaultId: message.vaultId,
          text: message.text,
          positionX: message.positionX,
          positionY: message.positionY,
        },
      });
      return NextResponse.json(newMessage);
    } else {
      console.error("Message already exists");
      return NextResponse.json(null);
    }
  }
  catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}
