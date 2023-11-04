import { NextResponse } from "next/server";

import { prisma } from "../db";
import { getWhiteboardById } from "../common";
import { WhiteboardIndex } from "@/types/whiteboard-types";

export async function GET(): Promise<NextResponse> {
  const whiteboardsWithMessagesCount: any = await prisma.$queryRaw`
    SELECT
      w.id,
      w.name,
      w.description,
      w."groupIds",
      w."appId",
      w."authorVaultId",
      w.curated,
      w."createdAt",
      w."updatedAt",
      COUNT(m.id) as "messagesCount"
    FROM
      "Whiteboard" w
    LEFT JOIN
      "Message" m
    ON
      w.id = m."whiteboardId"
    GROUP BY
      w.id, w.name, w.description, w.curated, w."authorVaultId";
  `;

  const whiteboardsWithCount: WhiteboardIndex[] =
    whiteboardsWithMessagesCount.map((whiteboard: any) => ({
      ...whiteboard,
      messagesCount: Number(whiteboard.messagesCount),
    }));

  const whiteboardsSorted = sortWhiteboards(whiteboardsWithCount);

  return NextResponse.json(whiteboardsSorted, { status: 200 });
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

function sortWhiteboards(whiteboardsWithResolvedGroupIds: WhiteboardIndex[]) {
  // sort by curated, then by message count, then creation date (oldest first), and then by name
  whiteboardsWithResolvedGroupIds.sort((a, b) => {
    if (a.curated && !b.curated) {
      return -1;
    } else if (!a.curated && b.curated) {
      return 1;
    } else {
      if (a.messagesCount > b.messagesCount) {
        return -1;
      } else if (a.messagesCount < b.messagesCount) {
        return 1;
      } else {
        if (a.id < b.id) {
          return -1;
        } else if (a.id > b.id) {
          return 1;
        } else {
          return 0;
        }
      }
    }
  });
  return whiteboardsWithResolvedGroupIds;
}
