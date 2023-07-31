import { NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";
import { NextApiRequest } from "next";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const messages = await prisma.message.findMany();
  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  console.log("post");
  console.log(req);
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
      const messages = await prisma.message.findMany();
      return NextResponse.json(messages);
    } else {
      console.error("Message already exists");
      return NextResponse.json({ error: "user already posted message" });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(error);
  }
}

export async function DELETE(req: NextApiRequest) {
  console.log("delete");
  console.log("req", req);
  console.log("req.url", req.url);
  let vaultId;
  if (req.url) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    console.log("url", url);
    vaultId = url.searchParams.get("vaultId");
    console.log("vaultId", vaultId);
  }
  console.log(vaultId);
  if (!vaultId) return NextResponse.json({ error: "no vaultId" });
  try {
    const deletedMessage = await prisma.message.delete({
      where: {
        vaultId: vaultId,
      },
    });
    return NextResponse.json(deletedMessage);
  } catch (error) {
    console.error(error);
    return NextResponse.json(error);
  }
}
