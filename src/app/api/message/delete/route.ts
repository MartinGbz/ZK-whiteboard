import { SignedMessage, Whiteboard } from "@/types/whiteboard-types";
import {
  AuthType,
  SismoConnectResponse,
  SismoConnectServer,
  SismoConnectVerifiedResult,
} from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";
import { prisma } from "../../db";
import { getWhiteboardById, post, verifyResponse } from "../../common";

let whiteboard: Whiteboard | null = null;
let sismoConnect: SismoConnectServer | null = null;

export async function POST(req: Request): Promise<NextResponse> {
  return await post(req, undefined, deleteMessage);
}

async function deleteMessage(
  sismoConnectResponse: SismoConnectResponse,
  signedMessage: SignedMessage
): Promise<NextResponse> {
  whiteboard = await getWhiteboardById(signedMessage.message.whiteboardId);
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
  if (vaultId) {
    if (!sismoConnectResponse.signedMessage) {
      return NextResponse.json(
        {
          error: "No signedMessage in the ZK Proof found",
        },
        { status: 400 }
      );
    }
    const message = JSON.parse(
      sismoConnectResponse.signedMessage
    ) as SignedMessage;
    const response = await deleteMessageFromDB(vaultId, message);
    return response;
  } else {
    return NextResponse.json({ error: "ZK Proof incorrect" }, { status: 401 });
  }
}

async function deleteMessageFromDB(
  vaultId: string,
  signedMessage: SignedMessage
): Promise<NextResponse> {
  try {
    const whiteboardId = parseInt(
      signedMessage.message.whiteboardId.toString()
    );
    const messageToDelete = await prisma.message.findFirst({
      where: {
        authorVaultId: vaultId,
        whiteboardId: whiteboardId,
      },
    });
    if (!messageToDelete) {
      return NextResponse.json({ error: "No message found" }, { status: 400 });
    }
    const deletedMessage = await prisma.message.delete({
      where: {
        id: messageToDelete.id,
      },
    });
    const whiteboard = await getWhiteboardById(whiteboardId);
    if (whiteboard?.messages) {
      return NextResponse.json(
        {
          vaultId: vaultId,
          messages: whiteboard.messages,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ error: "No message found" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}

async function verifyResponseDeleteMessage(
  sismoConnectResponse: SismoConnectResponse,
  sismoConnect: SismoConnectServer
): Promise<string | undefined> {
  const message = sismoConnectResponse.signedMessage
    ? sismoConnectResponse.signedMessage
    : "";
  const result: SismoConnectVerifiedResult = await sismoConnect.verify(
    sismoConnectResponse,
    {
      auths: [{ authType: AuthType.VAULT }],
      signature: { message: message },
    }
  );
  const vaultId = result.getUserId(AuthType.VAULT);
  return vaultId;
}
