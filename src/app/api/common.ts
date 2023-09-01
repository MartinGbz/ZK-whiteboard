import { prisma } from "./db";

export async function getWhiteboardById(id: number) {
  return await prisma.whiteboard.findUnique({
    where: {
      id: id,
    },
    include: {
      messages: true, // Inclut tous les messages liés au whiteboard
    },
  });
}
