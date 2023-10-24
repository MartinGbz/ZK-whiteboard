import { NextResponse } from "next/server";

import { prisma } from "../db";
import { getWhiteboardById } from "../common";

export async function GET(): Promise<NextResponse> {
  // const whiteboards = await prisma.whiteboard.findMany();
  // return NextResponse.json(whiteboards, { status: 200 });

  // const whiteboardsWithMessageCount = await prisma.whiteboard.findMany({
  //   include: {
  //     messages: {
  //       select: {
  //         id: true,
  //       },
  //     },
  //   },
  // });

  // const whiteboardsWithCount = whiteboardsWithMessageCount.map(
  //   (whiteboard) => ({
  //     ...whiteboard,
  //     messageCount: whiteboard.messages.length,
  //   })
  // );
  // return NextResponse.json(whiteboardsWithCount, { status: 200 });

  const whiteboardsWithMessagesCount: any = await prisma.$queryRaw`
    SELECT
      w.id,
      w.name,
      w.description,
      w."groupIds",
      w."appId",
      w."authorVaultId",
      w.curated,
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
  console.log(whiteboardsWithMessagesCount);

  const whiteboardsWithCount = whiteboardsWithMessagesCount.map(
    (whiteboard: any) => ({
      ...whiteboard,
      messagesCount: Number(whiteboard.messagesCount),
    })
  );

  return NextResponse.json(whiteboardsWithCount, { status: 200 });
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
