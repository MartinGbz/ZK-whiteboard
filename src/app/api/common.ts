import {
  AuthType,
  SismoConnect,
  SismoConnectResponse,
  SismoConnectServer,
  SismoConnectVerifiedResult,
} from "@sismo-core/sismo-connect-server";
import {
  OperationType,
  ReactionSignedMessage,
  SignedMessage,
  Whiteboard,
  WhiteboardEditSignedMessage,
} from "@/types/whiteboard-types";
import { prisma } from "./db";
import { NextResponse } from "next/server";

export async function getWhiteboardById(
  id: number
): Promise<Whiteboard | null> {
  return await prisma.whiteboard.findUnique({
    where: {
      id: parseInt(id.toString()),
    },
    include: {
      messages: true,
    },
  });
}

export async function verifyResponseMessage(
  sismoConnect: SismoConnectServer,
  sismoConnectResponse: SismoConnectResponse
): Promise<string | undefined> {
  const message = sismoConnectResponse.signedMessage
    ? sismoConnectResponse.signedMessage
    : "";
  if (sismoConnectResponse.signedMessage) {
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
}

export async function post(req: Request): Promise<NextResponse> {
  const sismoConnectResponse: SismoConnectResponse = await req.json();
  if (sismoConnectResponse.signedMessage) {
    const signedMessage = JSON.parse(sismoConnectResponse.signedMessage) as any;
    if (signedMessage.type === OperationType.EDIT) {
      return await saveWhiteboard(sismoConnectResponse, signedMessage);
    } else if (!signedMessage.type) {
      return NextResponse.json({ error: "No type provided" }, { status: 400 });
    } else {
      return NextResponse.json({ error: "Wrong API route" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "No signed message" }, { status: 400 });
  }
}
