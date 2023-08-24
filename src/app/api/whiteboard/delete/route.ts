import { sismoConnectConfig } from "@/app/configs/configs";
import { OperationType, SignedMessage } from "@/app/types/whiteboard-types";
import {
  AuthType,
  SismoConnect,
  SismoConnectResponse,
  SismoConnectVerifiedResult,
} from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";
import { prisma } from "../../db";

export async function POST(req: Request): Promise<NextResponse> {
  const sismoConnectResponse: SismoConnectResponse = await req.json();
  if (sismoConnectResponse.signedMessage) {
    const signedMessage = JSON.parse(
      sismoConnectResponse.signedMessage
    ) as SignedMessage;
    if (signedMessage.type === OperationType.DELETE) {
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

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

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
