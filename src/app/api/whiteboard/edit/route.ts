import {
  MessageOperationType,
  SignedMessage,
  Whiteboard,
  WhiteboardOperationType,
  WhiteboardEditSignedMessage,
} from "@/app/types/whiteboard-types";
import {
  AuthType,
  SismoConnect,
  SismoConnectResponse,
  SismoConnectVerifiedResult,
} from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";
import { prisma } from "../../db";
import {
  MAX_CHARACTERS,
  MAX_CHARACTERS_WHITEBOARD_DESCRIPTION,
  MAX_CHARACTERS_WHITEBOARD_NAME,
  MAX_WHITEBOARD_GROUPS,
  sismoConnectConfig,
} from "@/app/configs/configs";
import { getWhiteboardById, verifyResponseMessage } from "../../common";

export async function POST(req: Request): Promise<NextResponse> {
  const sismoConnectResponse: SismoConnectResponse = await req.json();
  if (sismoConnectResponse.signedMessage) {
    const signedMessage = JSON.parse(
      sismoConnectResponse.signedMessage
    ) as WhiteboardEditSignedMessage;
    if (signedMessage.type === WhiteboardOperationType.EDIT) {
      return await saveWhiteboard(sismoConnectResponse, signedMessage);
    } else if (!signedMessage.type) {
      return NextResponse.json({ error: "No type" });
    } else {
      return NextResponse.json({ error: "Wrong API route" });
    }
  } else {
    return NextResponse.json({ error: "No signed message" });
  }
}

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

async function saveWhiteboard(
  sismoConnectResponse: SismoConnectResponse,
  signedMessage: WhiteboardEditSignedMessage
): Promise<NextResponse> {
  if (signedMessage.message.name.length > MAX_CHARACTERS_WHITEBOARD_NAME) {
    return NextResponse.json({
      error:
        "The number of characters in the whiteboard name exceeds the maximum allowed (50 characters max.)",
    });
  }
  if (
    signedMessage.message.name.length > MAX_CHARACTERS_WHITEBOARD_DESCRIPTION
  ) {
    return NextResponse.json({
      error:
        "The number of characters in the description name exceeds the maximum allowed (300 characters max.)",
    });
  }
  if (signedMessage.message.name.length > MAX_WHITEBOARD_GROUPS) {
    return NextResponse.json({
      error:
        "The number of groups of the whiteboard exceeds the maximum allowed (10 groups max.)",
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
  signedMessage: WhiteboardEditSignedMessage
): Promise<NextResponse> {
  try {
    const whiteboardId = parseInt(signedMessage.message.id.toString());

    if (!whiteboardId) {
      return NextResponse.json({
        error: "No whiteboard id",
      });
    }

    const existingWhiteboard = await prisma.whiteboard.findUnique({
      where: {
        id: whiteboardId,
      },
    });

    if (existingWhiteboard?.authorVaultId !== vaultId) {
      return NextResponse.json({
        error: "You are not the author of this whiteboard",
      });
    }

    const editedWhiteboard = await prisma.whiteboard.update({
      where: {
        id: whiteboardId,
      },
      data: {
        name: signedMessage.message.name,
        description: signedMessage.message.description,
        groupIds: signedMessage.message.groupIds,
      },
    });
    return NextResponse.json(editedWhiteboard);
  } catch (error) {
    return NextResponse.json(error);
  }
}