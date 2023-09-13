import { sismoConnectConfig } from "@/app/configs/configs";
import {
  SismoConnect,
  SismoConnectVerifiedResult,
  AuthType,
  SismoConnectResponse,
  SismoConnectServer,
} from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";
import { prisma } from "../../db";

let sismoConnect: SismoConnectServer | null = null;

export async function POST(req: Request) {
  console.log("WL req", req);
  const sismoConnectResponse: SismoConnectResponse = await req.json();
  sismoConnect = SismoConnect({
    config: {
      appId: sismoConnectResponse.appId,
    },
  });
  const vaultId = await verifyResponse(sismoConnectResponse);
  if (!vaultId) {
    return NextResponse.json({ error: "ZK Proof incorrect" });
  }
  return NextResponse.json({ vaultId: vaultId });
}

async function verifyResponse(sismoConnectResponse: SismoConnectResponse) {
  if (!sismoConnect) {
    return null;
  }
  console.log("sismoConnectResponse", sismoConnectResponse);
  console.log("sismoConnect", sismoConnect);
  const result: SismoConnectVerifiedResult = await sismoConnect.verify(
    sismoConnectResponse,
    {
      auths: [{ authType: AuthType.VAULT }],
    }
  );
  const vaultId = result.getUserId(AuthType.VAULT);
  console.log("--->vaultId", vaultId);
  return vaultId;
}
