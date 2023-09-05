import {
  AuthType,
  SismoConnectResponse,
  SismoConnectServer,
  SismoConnectVerifiedResult,
} from "@sismo-core/sismo-connect-server";
import { Whiteboard } from "../types/whiteboard-types";
import { prisma } from "./db";

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
