import { NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";
import { NextApiRequest } from "next";
import {
  SismoConnect,
  SismoConnectVerifiedResult,
  AuthType,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-server";
import { sismoConnectConfig } from "@/app/configs/configs";
import {
  Message,
  OperationType,
  SignedMessage,
} from "@/app/types/whiteboard-types";

import { prisma } from "./db";

export async function GET() {
  const messages = await prisma.message.findMany();
  return NextResponse.json(messages);
}

export async function POST(req: Request): Promise<NextResponse> {
  const sismoConnectResponse: SismoConnectResponse = await req.json();
  if (sismoConnectResponse.signedMessage) {
    const signedMessage = JSON.parse(
      sismoConnectResponse.signedMessage
    ) as SignedMessage;
    switch (signedMessage.type) {
      case OperationType.POST:
        return await addMessage(sismoConnectResponse);
      case OperationType.DELETE:
        return await deleteMessage(sismoConnectResponse);
      default:
        return NextResponse.json({ error: "No type" });
    }
  } else {
    return NextResponse.json({ error: "No signed message" });
  }
}

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

async function deleteMessage(
  sismoConnectResponse: SismoConnectResponse
): Promise<NextResponse> {
  const vaultId = await verifyResponseDeleteMessage(sismoConnectResponse);
  if (vaultId) {
    const deletedMessage = await deleteMessageFromDB(vaultId);
    return deletedMessage;
  } else {
    return NextResponse.json({ error: "ZK Proof incorrect" });
  }
}

async function addMessageToDB(
  vaultId: string,
  signedMessage: SignedMessage
): Promise<NextResponse> {
  try {
    const existingMessage = await prisma.message.findUnique({
      where: {
        vaultId: vaultId,
      },
    });
    if (!existingMessage) {
      const newMessage = await prisma.message.create({
        data: {
          vaultId: vaultId,
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

async function deleteMessageFromDB(vaultId: string): Promise<NextResponse> {
  try {
    const deletedMessage = await prisma.message.delete({
      where: {
        vaultId: vaultId,
      },
    });
    const messages = await prisma.message.findMany();
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json(error);
  }
}

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

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
      claims: [{ groupId: "0x0f800ff28a426924cbe66b67b9f837e2" }],
      signature: { message: message },
    }
  );
  const vaultId = result.getUserId(AuthType.VAULT);
  return vaultId;
}

async function verifyResponseDeleteMessage(
  sismoConnectResponse: SismoConnectResponse
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
