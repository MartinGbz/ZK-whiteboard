import { NextResponse } from "next/server";

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
    if (!existingMessage) {
      const newMessage = await prisma.message.create({
        data: {
          vaultId: message.vaultId,
          text: message.text,
          positionX: message.positionX,
          positionY: message.positionY,
          order: message.order,
          color: message.color,
        },
      });
      console.log(newMessage);
      return NextResponse.json(newMessage);
    } else {
      console.error("Message already exists");
      return NextResponse.json({ error: "user already posted message" });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}
