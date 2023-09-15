import { NextResponse } from "next/server";
import { prisma } from "../db";

export async function POST(req: Request) {
  const vaultId = await req.json();
  let userLogged;
  const userAlreadyRecorded = await prisma.user.findUnique({
    where: {
      vaultId: vaultId,
    },
    include: {
      createdWhiteboards: true,
    },
  });
  userLogged = userAlreadyRecorded;
  if (!userAlreadyRecorded) {
    const user = await prisma.user.create({
      data: {
        vaultId: vaultId,
      },
      include: {
        createdWhiteboards: true,
      },
    });
    userLogged = user;
  }
  return NextResponse.json({ user: userLogged });
}
