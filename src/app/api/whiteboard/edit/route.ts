import { WhiteboardEditSignedMessage } from "@/types/whiteboard-types";
import { SismoConnectResponse } from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";
import { prisma } from "../../db";
import {
  MAX_CHARACTERS_WHITEBOARD_DESCRIPTION,
  MAX_CHARACTERS_WHITEBOARD_DESCRIPTION_MESSAGE,
  sismoConnectConfig,
} from "@/configs/configs";
import { post, verifyResponse, verifyResponseMessage } from "../../common";

export async function POST(req: Request): Promise<NextResponse> {
  return await post(req, undefined, undefined, saveWhiteboard);
}

async function saveWhiteboard(
  sismoConnectResponse: SismoConnectResponse,
  signedMessage: WhiteboardEditSignedMessage
): Promise<NextResponse> {
  if (
    signedMessage.message.description.length >
    MAX_CHARACTERS_WHITEBOARD_DESCRIPTION
  ) {
    return NextResponse.json(
      {
        error: MAX_CHARACTERS_WHITEBOARD_DESCRIPTION_MESSAGE,
      },
      { status: 403 }
    );
  }
  const vaultId = await verifyResponse(
    sismoConnectResponse,
    sismoConnectConfig.appId
  );
  if (vaultId) {
    const allMessagesInDB = await saveWhiteboardToDB(vaultId, signedMessage);
    return allMessagesInDB;
  } else {
    return NextResponse.json({ error: "ZK Proof incorrect" }, { status: 401 });
  }
}

async function saveWhiteboardToDB(
  vaultId: string,
  signedMessage: WhiteboardEditSignedMessage
): Promise<NextResponse> {
  try {
    const whiteboardId = parseInt(signedMessage.message.id.toString());

    if (!whiteboardId) {
      return NextResponse.json(
        {
          error: "No whiteboard id",
        },
        { status: 400 }
      );
    }

    const existingWhiteboard = await prisma.whiteboard.findUnique({
      where: {
        id: whiteboardId,
      },
    });

    if (existingWhiteboard?.authorVaultId !== vaultId) {
      return NextResponse.json(
        {
          error: "You are not the author of this whiteboard",
        },
        { status: 401 }
      );
    }

    try {
      const editedWhiteboard = await prisma.whiteboard.update({
        where: {
          id: whiteboardId,
        },
        data: {
          description: signedMessage.message.description,
          minLevel: Number(signedMessage.message.minLevel),
        },
      });
      return NextResponse.json(editedWhiteboard, { status: 200 });
    } catch (error: any) {
      return NextResponse.json(
        {
          error: "Error while editing the whiteboard",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
