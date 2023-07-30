import { sismoConnectConfig } from "@/app/configs/configs";
import {
  SismoConnect,
  SismoConnectVerifiedResult,
  AuthType,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json("test");
}

export async function POST(req: Request) {
  const body = await req.json();
  const sismoConnectResponse = body;
  const newMessage = await verifyResponse(sismoConnectResponse);
  return NextResponse.json(newMessage);
}

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

async function verifyResponse(sismoConnectResponse: SismoConnectResponse) {
  let message = sismoConnectResponse.signedMessage
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
  const signedMessage = result.getSignedMessage();
  if (vaultId && signedMessage) {
    return { vaultId: vaultId, ...JSON.parse(signedMessage) };
  }
}
