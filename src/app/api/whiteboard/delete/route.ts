import {
  WhiteboardOperationType,
  WhiteboardEditSignedMessage,
} from "@/types/whiteboard-types";
import {
  SismoConnect,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";
import { prisma } from "../../db";
import { sismoConnectConfig } from "@/configs/configs";
import { verifyResponseMessage } from "../../common";

export async function POST(req: Request): Promise<NextResponse> {
  const sismoConnectResponse: SismoConnectResponse = await req.json();
  if (sismoConnectResponse.signedMessage) {
    const signedMessage = JSON.parse(
      sismoConnectResponse.signedMessage
    ) as WhiteboardEditSignedMessage;
    if (signedMessage.type === WhiteboardOperationType.DELETE) {
      return await deleteWhiteboard(sismoConnectResponse, signedMessage);
    } else if (!signedMessage.type) {
      return NextResponse.json({ error: "No type provided" }, { status: 400 });
    } else {
      return NextResponse.json({ error: "Wrong API route" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "No signed message" }, { status: 400 });
  }
}

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

async function deleteWhiteboard(
  sismoConnectResponse: SismoConnectResponse,
  signedMessage: WhiteboardEditSignedMessage
): Promise<NextResponse> {
  const vaultId = await verifyResponseMessage(
    sismoConnect,
    sismoConnectResponse
  );
  if (vaultId) {
    const allMessagesInDB = await deleteWhiteboardInDB(vaultId, signedMessage);
    return allMessagesInDB;
  } else {
    return NextResponse.json({ error: "ZK Proof incorrect" }, { status: 401 });
  }
}

async function deleteWhiteboardInDB(
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

    const deletedWhiteboard = await prisma.whiteboard.delete({
      where: {
        id: whiteboardId,
      },
    });

    return NextResponse.json(deletedWhiteboard, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
