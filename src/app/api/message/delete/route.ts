import {
  MessageOperationType,
  SignedMessage,
  Whiteboard,
} from "@/app/types/whiteboard-types";
import {
  AuthType,
  SismoConnect,
  SismoConnectResponse,
  SismoConnectServer,
  SismoConnectVerifiedResult,
} from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";
import { prisma } from "../../db";
import { getWhiteboardById } from "../../common";

let whiteboard: Whiteboard | null = null;
let sismoConnect: SismoConnectServer | null = null;

export async function POST(req: Request): Promise<NextResponse> {
  const sismoConnectResponse: SismoConnectResponse = await req.json();
  if (sismoConnectResponse.signedMessage) {
    const signedMessage = JSON.parse(
      sismoConnectResponse.signedMessage
    ) as SignedMessage;
    whiteboard = await getWhiteboardById(signedMessage.message.whiteboardId);
    if (!whiteboard) {
      return NextResponse.json({ error: "Whiteboard not found" });
    }
    if (!whiteboard.appId) {
      return NextResponse.json({ error: "Whiteboard appId not found" });
    }
    sismoConnect = SismoConnect({
      config: {
        appId: whiteboard.appId,
      },
    });
    if (!sismoConnect) {
      return NextResponse.json({ error: "SismoConnect not found" });
    }
    if (signedMessage.type === MessageOperationType.DELETE) {
      return await deleteMessage(sismoConnectResponse);
    } else if (!signedMessage.type) {
      return NextResponse.json({ error: "No type" });
    } else {
      return NextResponse.json({ error: "Wrong API route" });
    }
  } else {
    return NextResponse.json({ error: "No signed message" });
  }
}

async function deleteMessage(
  sismoConnectResponse: SismoConnectResponse
): Promise<NextResponse> {
  if (!sismoConnect) {
    return NextResponse.json({ error: "SismoConnect not defined" });
  }
  const vaultId = await verifyResponseDeleteMessage(
    sismoConnectResponse,
    sismoConnect
  );
  if (vaultId) {
    if (!sismoConnectResponse.signedMessage) {
      return NextResponse.json({
        error: "No signedMessage found in the ZK Proof",
      });
    }
    const message = JSON.parse(
      sismoConnectResponse.signedMessage
    ) as SignedMessage;
    const response = await deleteMessageFromDB(vaultId, message);
    return response;
  } else {
    return NextResponse.json({ error: "ZK Proof incorrect" });
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
      return NextResponse.json({ error: "No message found" });
    }
    const deletedMessage = await prisma.message.delete({
      where: {
        id: messageToDelete.id,
      },
    });
    const whiteboard = await getWhiteboardById(whiteboardId);
    if (whiteboard?.messages) {
      return NextResponse.json({
        vaultId: vaultId,
        messages: whiteboard.messages,
      });
    } else {
      return NextResponse.json("Messages not found");
    }
  } catch (error) {
    return NextResponse.json(error);
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
