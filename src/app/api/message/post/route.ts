import { SignedMessage, Whiteboard } from "@/types/whiteboard-types";
import {
  Claim,
  ClaimType,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";
import { prisma } from "../../db";
import { MAX_CHARACTERS } from "@/configs/configs";
import { getWhiteboardById, post, verifyResponse } from "../../common";

let whiteboard: Whiteboard | null = null;

export async function POST(req: Request): Promise<NextResponse> {
  return await post(req, addMessage);
}

async function addMessage(
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
  if (signedMessage.message.text.length > MAX_CHARACTERS) {
    return NextResponse.json(
      {
        error:
          "The number of characters in the message exceeds the maximum allowed (100 characters max.)",
      },
      { status: 403 }
    );
  }
  const claims: Claim[] = whiteboard?.groupIds?.map((groupId) => ({
    groupId: groupId,
    claimType: ClaimType.GTE,
    value: whiteboard?.minLevel,
  }));
  try {
    console.log("whiteboard.appId", whiteboard.appId);
    console.log("claims", claims);
    console.log("sismoConnectResponse", sismoConnectResponse);
    const vaultId = await verifyResponse(
      sismoConnectResponse,
      whiteboard.appId,
      claims
    );
    if (!vaultId) {
      return NextResponse.json(
        { error: "ZK Proof incorrect" },
        { status: 401 }
      );
    }
    const response = await addMessageToDB(vaultId, signedMessage);
    return response;
  } catch (error) {
    return NextResponse.json({ error: "ZK Proof incorrect" }, { status: 401 });
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
        return NextResponse.json(
          { vaultId: vaultId, messages: messages },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          {
            error: "Messages not found",
          },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "The vaultId has already posted a message" },
        { status: 403 }
      );
    }
  } catch (error) {
    return NextResponse.json(error);
  }
}
