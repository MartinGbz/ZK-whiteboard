// import { Whiteboard } from "@prisma/client";
import { Whiteboard } from "../types/whiteboard-types";
import { prisma } from "./db";

export async function getWhiteboardById(
  id: number
): Promise<Whiteboard | null> {
  return await prisma.whiteboard.findUnique({
    where: {
      id: parseInt(id.toString()),
    },
    include: {
      messages: true,
    },
  });
}
