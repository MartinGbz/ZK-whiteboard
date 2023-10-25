import { NextResponse } from "next/server";

import { prisma } from "../../db";
import { reactionsType } from "@/configs/configs";
import {
  SismoConnect,
  SismoConnectResponse,
  SismoConnectServer,
} from "@sismo-core/sismo-connect-server";
import {
  MessageOperationType,
  ReactionOperationType,
  ReactionSignedMessage,
} from "@/types/whiteboard-types";
import { verifyResponseMessage } from "../../common";

let sismoConnect: SismoConnectServer | null = null;

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
  const sismoConnectResponse: SismoConnectResponse = await req.json();
  if (sismoConnectResponse.signedMessage) {
    const signedMessage = JSON.parse(
      sismoConnectResponse.signedMessage
    ) as ReactionSignedMessage;
    sismoConnect = SismoConnect({
      config: {
        appId: sismoConnectResponse.appId,
      },
    });
    if (!sismoConnect) {
      return NextResponse.json(
        { error: "SismoConnect not defined" },
        { status: 500 }
      );
    }
    const vaultId = await verifyResponseMessage(
      sismoConnect,
      sismoConnectResponse
    );
    if (!vaultId)
      return NextResponse.json({ error: "No vaultId" }, { status: 400 });
    if (signedMessage.type === ReactionOperationType.POST) {
      return await updateReaction(signedMessage, vaultId, true);
    } else if (signedMessage.type === ReactionOperationType.DELETE) {
      return await updateReaction(signedMessage, vaultId, false);
    } else if (!signedMessage.type) {
      return NextResponse.json({ error: "No type provided" }, { status: 400 });
    } else {
      return NextResponse.json({ error: "Wrong API route" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "No signed message" }, { status: 400 });
  }
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
  console.log(reactionsStats);

  return reactionsStats;
}

async function updateReaction(
  signedMessage: ReactionSignedMessage,
  vaultId: string,
  add: boolean
) {
  let reaction;
  if (add) {
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
  } else {
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
        { error: "Reaction not delete" },
        { status: 500 }
      );
    }

    console.log("DELETE reaction ", reaction);
  }

  const newReactions = await getReactionStats(
    signedMessage.message.messageId,
    vaultId
  );
  if (!newReactions) {
    return NextResponse.json({ error: "Reactions not found" }, { status: 500 });
  }

  console.log(newReactions);
  return NextResponse.json(newReactions, { status: 200 });
}

// async function addReaction(
//   signedMessage: ReactionSignedMessage,
//   vaultId: string
// ) {
//   const reaction = await prisma.reaction.create({
//     data: {
//       type: signedMessage.message.type,
//       messageId: signedMessage.message.messageId,
//       userId: vaultId,
//     },
//   });
//   if (!reaction) {
//     return NextResponse.json(
//       { error: "Reaction not created" },
//       { status: 500 }
//     );
//   }

//   const newReactions = await getReactionStats(
//     signedMessage.message.messageId,
//     vaultId
//   );
//   if (!newReactions) {
//     return NextResponse.json({ error: "Reactions not found" }, { status: 500 });
//   }

//   console.log(newReactions);
//   return NextResponse.json(newReactions, { status: 200 });
// }

// async function removeReaction(
//   signedMessage: ReactionSignedMessage,
//   vaultId: string
// ) {
//   const reaction = await prisma.reaction.delete({
//     where: {
//       messageId_userId: {
//         userId: vaultId,
//         messageId: signedMessage.message.messageId,
//       },
//     },
//   });
//   console.log("DELETE reaction ", reaction);
//   if (!reaction) {
//     return NextResponse.json(
//       { error: "Reaction not created" },
//       { status: 500 }
//     );
//   }

//   const newReactions = await getReactionStats(
//     signedMessage.message.messageId,
//     vaultId
//   );
//   if (!newReactions) {
//     return NextResponse.json({ error: "Reactions not found" }, { status: 500 });
//   }

//   console.log(newReactions);
//   return NextResponse.json(newReactions, { status: 200 });
// }
