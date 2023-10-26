import { NextResponse } from "next/server";

import { prisma } from "../../db";
import { reactionsType } from "@/configs/configs";
import {
  SismoConnect,
  SismoConnectResponse,
  SismoConnectServer,
} from "@sismo-core/sismo-connect-server";
import { ReactionSignedMessage } from "@/types/whiteboard-types";
import {
  getWhiteboardById,
  post,
  verifyResponse,
  verifyResponseMessage,
} from "../../common";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json("Missing messageId", { status: 400 });
  const messageId = Number(id);

  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json("Missing userId", { status: 400 });

  const reactionsStats = await getReactionStats(messageId, userId);

  return NextResponse.json(reactionsStats, { status: 200 });
}

export async function POST(req: Request): Promise<NextResponse> {
  return await post(req, addReaction, deleteReaction);
}

async function getReactionStats(messageId: number, userId: string) {
  if (!messageId)
    return NextResponse.json("Missing messageId", { status: 400 });

  const reactionCounts = await prisma.reaction.groupBy({
    by: ["type"],
    _count: true,
    where: {
      messageId: messageId,
    },
  });

  if (!userId) return NextResponse.json(reactionCounts, { status: 500 });
  const userReaction = await prisma.reaction.findFirst({
    where: { messageId: messageId, userId: userId },
  });

  // if one of the reaction type is missing, add it with count 0
  reactionsType.forEach((type) => {
    if (!reactionCounts.find((reaction) => reaction.type === type)) {
      reactionCounts.push({ type: type, _count: 0 });
    }
  });

  const reactionsStats = {
    reactionCounts: reactionCounts,
    userReaction: userReaction,
  };

  return reactionsStats;
}

async function addReaction(
  sismoConnectResponse: SismoConnectResponse,
  signedMessage: ReactionSignedMessage
) {
  const whiteboard = await getWhiteboardById(signedMessage.whiteboardId);
  if (!whiteboard) {
    return NextResponse.json(
      { error: "Whiteboard not found" },
      { status: 404 }
    );
  }
  if (!whiteboard.appId) {
    return NextResponse.json(
      { error: "Whiteboard appId not found" },
      { status: 404 }
    );
  }
  const vaultId = await verifyResponse(sismoConnectResponse, whiteboard.appId);
  if (!vaultId)
    return NextResponse.json({ error: "No vaultId found" }, { status: 400 });
  let reaction;
  // check if reaction already exists
  const existingReaction = await prisma.reaction.findUnique({
    where: {
      messageId_userId: {
        userId: vaultId,
        messageId: signedMessage.message.messageId,
      },
    },
  });

  // if reaction already exists, delete it
  if (existingReaction) {
    reaction = await prisma.reaction.delete({
      where: {
        messageId_userId: {
          userId: vaultId,
          messageId: signedMessage.message.messageId,
        },
      },
    });

    if (!reaction) {
      return NextResponse.json(
        { error: "Error while posting the reaction: old one deletetion" },
        { status: 500 }
      );
    }
  }

  reaction = await prisma.reaction.create({
    data: {
      type: signedMessage.message.type,
      messageId: signedMessage.message.messageId,
      userId: vaultId,
    },
  });

  if (!reaction) {
    return NextResponse.json(
      { error: "Reaction not created" },
      { status: 500 }
    );
  }

  const newReactions = await getReactionStats(
    signedMessage.message.messageId,
    vaultId
  );
  if (!newReactions) {
    return NextResponse.json({ error: "Reactions not found" }, { status: 500 });
  }

  return NextResponse.json(newReactions, { status: 200 });
}

async function deleteReaction(
  sismoConnectResponse: SismoConnectResponse,
  signedMessage: ReactionSignedMessage
) {
  const whiteboard = await getWhiteboardById(signedMessage.whiteboardId);
  if (!whiteboard) {
    return NextResponse.json(
      { error: "Whiteboard not found" },
      { status: 404 }
    );
  }
  if (!whiteboard.appId) {
    return NextResponse.json(
      { error: "Whiteboard appId not found" },
      { status: 404 }
    );
  }
  const vaultId = await verifyResponse(sismoConnectResponse, whiteboard.appId);
  if (!vaultId)
    return NextResponse.json({ error: "No vaultId found" }, { status: 400 });
  const reaction = await prisma.reaction.delete({
    where: {
      messageId_userId: {
        userId: vaultId,
        messageId: signedMessage.message.messageId,
      },
    },
  });

  if (!reaction) {
    return NextResponse.json({ error: "Reaction not delete" }, { status: 500 });
  }
  const newReactions = await getReactionStats(
    signedMessage.message.messageId,
    vaultId
  );
  if (!newReactions) {
    return NextResponse.json({ error: "Reactions not found" }, { status: 500 });
  }

  return NextResponse.json(newReactions, { status: 200 });
}
