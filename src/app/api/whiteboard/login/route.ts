import {
  SismoConnect,
  SismoConnectVerifiedResult,
  AuthType,
  SismoConnectResponse,
  SismoConnectServer,
} from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";

let sismoConnect: SismoConnectServer | null = null;

export async function POST(req: Request): Promise<NextResponse> {
  const sismoConnectResponse: SismoConnectResponse = await req.json();
  sismoConnect = SismoConnect({
    config: {
      appId: sismoConnectResponse.appId,
    },
  });
  const vaultId = await verifyResponse(sismoConnectResponse, sismoConnect);
  if (!vaultId) {
    return NextResponse.json({ error: "ZK Proof incorrect" }, { status: 401 });
  }
  return NextResponse.json({ vaultId: vaultId });
}

async function verifyResponse(
  sismoConnectResponse: SismoConnectResponse,
  sismoConnect: SismoConnectServer
) {
  const result: SismoConnectVerifiedResult = await sismoConnect.verify(
    sismoConnectResponse,
    {
      auths: [{ authType: AuthType.VAULT }],
    }
  );
  const vaultId = result.getUserId(AuthType.VAULT);
  return vaultId;
}
