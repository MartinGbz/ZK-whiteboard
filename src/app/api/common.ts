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
  console.log("sismoConnect");
  console.log(sismoConnect);
  console.log("sismoConnectResponse");
  console.log(sismoConnectResponse);
  const message = sismoConnectResponse.signedMessage
    ? sismoConnectResponse.signedMessage
    : "";
  if (sismoConnectResponse.signedMessage) {
    // const claims = whiteboard?.groupIds?.map((groupId) => ({
    //   groupId: groupId,
    // }));
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
