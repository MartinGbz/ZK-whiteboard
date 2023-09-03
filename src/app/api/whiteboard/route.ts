import { NextResponse } from "next/server";

import { prisma } from "../db";
import { WhiteboardCreation } from "@/app/types/whiteboard-types";

export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<NextResponse> {
  const whiteboardRequest: WhiteboardCreation = await req.json();
  const user = await prisma.user.findUnique({
    where: {
      vaultId: whiteboardRequest.authorVaultId,
    },
    include: {
      createdWhiteboards: true, // Inclure les whiteboards créés par l'utilisateur
    },
  });
  if (!user) {
    return NextResponse.json(
      {
        error: "User not found.",
      },
      { status: 404 }
    );
  }
  console.log(user);
  if (user?.createdWhiteboards.length >= 3) {
    return NextResponse.json(
      {
        error: "You've reached the maximum number of whiteboards created.",
      },
      { status: 403 }
    );
  }

  const whiteboard = await prisma.whiteboard.create({
    data: {
      name: whiteboardRequest.name,
      description: whiteboardRequest.description,
      groupIds: whiteboardRequest.groupIds,
      authorVaultId: whiteboardRequest.authorVaultId,
      curated: false,
    },
  });
  console.log(whiteboard);
  return NextResponse.json(whiteboard);
}
