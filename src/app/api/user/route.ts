import { NextResponse } from "next/server";
import { prisma } from "../db";

export async function POST(req: Request): Promise<NextResponse> {
  const vaultId = await req.json();
  if (!vaultId) {
    return NextResponse.json({ error: "ZK Proof incorrect" }, { status: 401 });
  }
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
  return NextResponse.json({ user: userLogged }, { status: 200 });
}
