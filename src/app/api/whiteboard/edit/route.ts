import {
  MessageOperationType,
  SignedMessage,
  Whiteboard,
  WhiteboardOperationType,
  WhiteboardEditSignedMessage,
} from "@/types/whiteboard-types";
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
  MAX_CHARACTERS_WHITEBOARD_DESCRIPTION_MESSAGE,
  MAX_CHARACTERS_WHITEBOARD_NAME,
  MAX_CHARACTERS_WHITEBOARD_NAME_MESSAGE,
  MAX_WHITEBOARD_GROUPS,
  MAX_WHITEBOARD_GROUPS_MESSAGE,
  sismoConnectConfig,
} from "@/configs/configs";
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
  if (
    signedMessage.message.name.length > MAX_CHARACTERS_WHITEBOARD_DESCRIPTION
  ) {
    return NextResponse.json({
      error: MAX_CHARACTERS_WHITEBOARD_DESCRIPTION_MESSAGE,
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
        description: signedMessage.message.description,
      },
    });
    return NextResponse.json(editedWhiteboard);
  } catch (error) {
    return NextResponse.json(error);
  }
}
