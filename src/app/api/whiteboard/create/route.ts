import { NextResponse } from "next/server";

import { prisma } from "../../db";
import {
  WhiteboardCreateSignedMessage,
  WhiteboardOperationType,
} from "@/app/types/whiteboard-types";
import {
  SismoConnect,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-server";
import { verifyResponseMessage } from "../../common";
import {
  MAX_CHARACTERS_WHITEBOARD_DESCRIPTION,
  MAX_CHARACTERS_WHITEBOARD_DESCRIPTION_MESSAGE,
  MAX_CHARACTERS_WHITEBOARD_NAME,
  MAX_CHARACTERS_WHITEBOARD_NAME_MESSAGE,
  MAX_WHITEBOARD_GROUPS,
  MAX_WHITEBOARD_GROUPS_MESSAGE,
  sismoConnectConfig,
} from "@/app/configs/configs";

export const dynamic = "force-dynamic";

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

export async function POST(req: Request): Promise<NextResponse> {
  const sismoConnectResponse: SismoConnectResponse = await req.json();
  if (sismoConnectResponse.signedMessage) {
    const signedMessage = JSON.parse(
      sismoConnectResponse.signedMessage
    ) as WhiteboardCreateSignedMessage;
    if (signedMessage.type === WhiteboardOperationType.CREATE) {
      return await saveWhiteboard(sismoConnectResponse, signedMessage);
    } else if (!signedMessage.type) {
      return NextResponse.json({ error: "No type" });
    } else {
      return NextResponse.json({ error: "Wrong API route" });
    }
  } else {
    return NextResponse.json({ error: "No signed message" });
  }

  async function saveWhiteboard(
    sismoConnectResponse: SismoConnectResponse,
    signedMessage: WhiteboardCreateSignedMessage
  ): Promise<NextResponse> {
    if (signedMessage.message.name.length > MAX_CHARACTERS_WHITEBOARD_NAME) {
      return NextResponse.json({
        error: MAX_CHARACTERS_WHITEBOARD_NAME_MESSAGE,
      });
    }
    if (
      signedMessage.message.name.length > MAX_CHARACTERS_WHITEBOARD_DESCRIPTION
    ) {
      return NextResponse.json({
        error: MAX_CHARACTERS_WHITEBOARD_DESCRIPTION_MESSAGE,
      });
    }
    if (signedMessage.message.groupIds.length > MAX_WHITEBOARD_GROUPS) {
      return NextResponse.json({
        error: MAX_WHITEBOARD_GROUPS_MESSAGE,
      });
    }
    const vaultId = await verifyResponseMessage(
      sismoConnect,
      sismoConnectResponse
    );
    if (vaultId) {
      const allMessagesInDB = await saveWhiteboardToDB(vaultId, signedMessage);
      return allMessagesInDB;
    } else {
      return NextResponse.json({ error: "ZK Proof incorrect" });
    }
  }

  async function saveWhiteboardToDB(
    vaultId: string,
    signedMessage: WhiteboardCreateSignedMessage
  ): Promise<NextResponse> {
    const user = await prisma.user.findUnique({
      where: {
        vaultId: vaultId,
      },
      include: {
        createdWhiteboards: true,
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
    if (user?.createdWhiteboards.length >= 10) {
      return NextResponse.json(
        {
          error: "You've reached the maximum number of whiteboards created.",
        },
        { status: 403 }
      );
    }

    const whiteboard = await prisma.whiteboard.create({
      data: {
        name: signedMessage.message.name,
        description: signedMessage.message.description,
        groupIds: signedMessage.message.groupIds,
        authorVaultId: vaultId,
        curated: false,
      },
    });
    return NextResponse.json(whiteboard);
  }
}
