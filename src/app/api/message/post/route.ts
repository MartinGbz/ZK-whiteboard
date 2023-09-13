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
import { MAX_CHARACTERS } from "@/app/configs/configs";
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
        appId: sismoConnectResponse.appId,
      },
    });
    if (!sismoConnect) {
      return NextResponse.json({ error: "SismoConnect not defined" });
    }
    if (signedMessage.type === MessageOperationType.POST) {
      return await addMessage(sismoConnectResponse, signedMessage);
    } else if (!signedMessage.type) {
      return NextResponse.json({ error: "No type" });
    } else {
      return NextResponse.json({ error: "Wrong API route" });
    }
  } else {
    return NextResponse.json({ error: "No signed message" });
  }
}

async function addMessage(
  sismoConnectResponse: SismoConnectResponse,
  signedMessage: SignedMessage
): Promise<NextResponse> {
  if (signedMessage.message.text.length > MAX_CHARACTERS) {
    return NextResponse.json({
      error:
        "The number of characters in the message exceeds the maximum allowed (100 characters max.)",
    });
  }
  if (!sismoConnect) {
    return NextResponse.json({ error: "SismoConnect not defined" });
  }
  const vaultId = await verifyResponseAddMessage(
    sismoConnectResponse,
    sismoConnect
  );
  if (vaultId) {
    const allMessagesInDB = await addMessageToDB(vaultId, signedMessage);
    return allMessagesInDB;
  } else {
    return NextResponse.json({ error: "ZK Proof incorrect" });
  }
}

async function addMessageToDB(
  vaultId: string,
  signedMessage: SignedMessage
): Promise<NextResponse> {
  try {
    const whiteboardId = parseInt(
      signedMessage.message.whiteboardId.toString()
    );
    const existingMessage = await prisma.message.findFirst({
      where: {
        authorVaultId: vaultId,
        whiteboardId: whiteboardId,
      },
    });
    if (!existingMessage) {
      const newMessage = await prisma.message.create({
        data: {
          authorVaultId: vaultId,
          whiteboardId: whiteboardId,
          text: signedMessage.message.text,
          positionX: signedMessage.message.positionX,
          positionY: signedMessage.message.positionY,
          color: signedMessage.message.color,
        },
      });
      const existingMessages = whiteboard?.messages ?? [];
      const messages = [...existingMessages, newMessage];
      if (messages) {
        return NextResponse.json(messages);
      } else {
        return NextResponse.json("Messages not found");
      }
    } else {
      return NextResponse.json(
        new Error("The vaultId has already posted a message"),
        { status: 403 }
      );
    }
  } catch (error) {
    return NextResponse.json(error);
  }
}

async function verifyResponseAddMessage(
  sismoConnectResponse: SismoConnectResponse,
  sismoConnect: SismoConnectServer
): Promise<string | undefined> {
  const message = sismoConnectResponse.signedMessage
    ? sismoConnectResponse.signedMessage
    : "";
  if (sismoConnectResponse.signedMessage) {
    const claims = whiteboard?.groupIds?.map((groupId) => ({
      groupId: groupId,
    }));
    const result: SismoConnectVerifiedResult = await sismoConnect.verify(
      sismoConnectResponse,
      {
        auths: [{ authType: AuthType.VAULT }],
        claims: claims,
        signature: { message: message },
      }
    );
    const vaultId = result.getUserId(AuthType.VAULT);
    return vaultId;
  }
}
