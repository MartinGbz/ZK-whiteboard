import { OperationType, SignedMessage } from "@/app/types/whiteboard-types";
import {
  AuthType,
  SismoConnect,
  SismoConnectResponse,
  SismoConnectVerifiedResult,
} from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";
import { prisma } from "../../db";
import { MAX_CHARACTERS, sismoConnectConfig } from "@/app/configs/configs";

export async function POST(req: Request): Promise<NextResponse> {
  const sismoConnectResponse: SismoConnectResponse = await req.json();
  if (sismoConnectResponse.signedMessage) {
    const signedMessage = JSON.parse(
      sismoConnectResponse.signedMessage
    ) as SignedMessage;
    if (signedMessage.message.text.length > MAX_CHARACTERS) {
      return NextResponse.json({
        error:
          "The number of characters in the message exceeds the maximum allowed (100 characters max.)",
      });
    }
    if (signedMessage.type === OperationType.POST) {
      return await addMessage(sismoConnectResponse);
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

async function addMessage(
  sismoConnectResponse: SismoConnectResponse
): Promise<NextResponse> {
  const vaultId = await verifyResponseAddMessage(sismoConnectResponse);
  if (vaultId) {
    if (!sismoConnectResponse.signedMessage) {
      return NextResponse.json({
        error: "No signedMessage found in the ZK Proof",
      });
    }
    const message = JSON.parse(
      sismoConnectResponse.signedMessage
    ) as SignedMessage;
    const allMessagesInDB = await addMessageToDB(vaultId, message);
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
    const existingMessage = await prisma.message.findFirst({
      where: {
        authorVaultId: vaultId,
        whiteboardId: signedMessage.message.whiteboardId,
      },
    });
    if (!existingMessage) {
      const newMessage = await prisma.message.create({
        data: {
          authorVaultId: vaultId,
          whiteboardId: signedMessage.message.whiteboardId,
          text: signedMessage.message.text,
          positionX: signedMessage.message.positionX,
          positionY: signedMessage.message.positionY,
          color: signedMessage.message.color,
        },
      });
      const messages = await prisma.message.findMany();
      return NextResponse.json(messages);
    } else {
      return NextResponse.json({
        error: "The user has already posted a message",
      });
    }
  } catch (error) {
    return NextResponse.json(error);
  }
}

async function verifyResponseAddMessage(
  sismoConnectResponse: SismoConnectResponse
): Promise<string | undefined> {
  const message = sismoConnectResponse.signedMessage
    ? sismoConnectResponse.signedMessage
    : "";
  const result: SismoConnectVerifiedResult = await sismoConnect.verify(
    sismoConnectResponse,
    {
      auths: [{ authType: AuthType.VAULT }],
      claims: [
        { groupId: "0x0f800ff28a426924cbe66b67b9f837e2" },
        { groupId: "0x1cde61966decb8600dfd0749bd371f12" },
      ],
      signature: { message: message },
    }
  );
  const vaultId = result.getUserId(AuthType.VAULT);
  return vaultId;
}
