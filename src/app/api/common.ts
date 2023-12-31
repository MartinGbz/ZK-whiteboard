import {
  AuthType,
  ClaimRequest,
  SismoConnect,
  SismoConnectResponse,
  SismoConnectServer,
  SismoConnectVerifiedResult,
} from "@sismo-core/sismo-connect-server";
import {
  OperationType,
  Whiteboard,
  whiteboardWithMessageCount,
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

export async function verifyResponse(
  sismoConnectResponse: SismoConnectResponse,
  appId: string,
  claims?: any
): Promise<string | null> {
  const sismoConnect = SismoConnect({
    config: {
      appId: appId,
    },
  });
  if (!sismoConnect) {
    return null;
  }
  let vaultId;
  if (claims) {
    vaultId = await verifyResponseClaims(
      sismoConnectResponse,
      sismoConnect,
      claims
    );
  } else {
    vaultId = await verifyResponseMessage(sismoConnect, sismoConnectResponse);
  }
  if (!vaultId) return null;
  return vaultId;
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

async function verifyResponseClaims(
  sismoConnectResponse: SismoConnectResponse,
  sismoConnect: SismoConnectServer,
  claims?: ClaimRequest[]
): Promise<string | undefined> {
  const message = sismoConnectResponse.signedMessage
    ? sismoConnectResponse.signedMessage
    : "";
  if (sismoConnectResponse.signedMessage) {
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

export async function post(
  req: Request,
  postFunction?: Function,
  deleteFunction?: Function,
  editFunction?: Function
): Promise<NextResponse> {
  const sismoConnectResponse: SismoConnectResponse = await req.json();
  if (sismoConnectResponse.signedMessage) {
    const signedMessage = JSON.parse(sismoConnectResponse.signedMessage) as any;
    if (signedMessage.type === OperationType.POST && postFunction) {
      return await postFunction(sismoConnectResponse, signedMessage);
    } else if (signedMessage.type === OperationType.DELETE && deleteFunction) {
      return await deleteFunction(sismoConnectResponse, signedMessage);
    } else if (signedMessage.type === OperationType.EDIT && editFunction) {
      return await editFunction(sismoConnectResponse, signedMessage);
    } else if (!signedMessage.type) {
      return NextResponse.json({ error: "No type provided" }, { status: 400 });
    } else {
      return NextResponse.json({ error: "Wrong API route" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "No signed message" }, { status: 400 });
  }
}

export const getWhiteboards = async () => {
  const whiteboardsWithMessagesCount: any = await prisma.$queryRaw`
  SELECT
    w.id,
    w.name,
    w.description,
    w."groupIds",
    w."appId",
    w."authorVaultId",
    w.curated,
    w."minLevel",
    w."createdAt",
    w."updatedAt",
    COUNT(m.id) as "messagesCount"
  FROM
    "Whiteboard" w
  LEFT JOIN
    "Message" m
  ON
    w.id = m."whiteboardId"
  GROUP BY
    w.id, w.name, w.description, w.curated, w."authorVaultId";
`;

  const whiteboardsWithCount: whiteboardWithMessageCount[] =
    whiteboardsWithMessagesCount.map((whiteboard: any) => ({
      ...whiteboard,
      messagesCount: Number(whiteboard.messagesCount),
    }));

  const whiteboardsSorted = sortWhiteboards(whiteboardsWithCount);

  return whiteboardsSorted;
};

function sortWhiteboards(
  whiteboardsWithResolvedGroupIds: whiteboardWithMessageCount[]
) {
  // sort by curated, then by message count, then creation date (oldest first), and then by name
  whiteboardsWithResolvedGroupIds.sort((a, b) => {
    if (a.curated && !b.curated) {
      return -1;
    } else if (!a.curated && b.curated) {
      return 1;
    } else {
      if (a.messagesCount > b.messagesCount) {
        return -1;
      } else if (a.messagesCount < b.messagesCount) {
        return 1;
      } else {
        if (a.id < b.id) {
          return -1;
        } else if (a.id > b.id) {
          return 1;
        } else {
          return 0;
        }
      }
    }
  });
  return whiteboardsWithResolvedGroupIds;
}
