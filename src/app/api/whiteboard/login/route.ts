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
  const SismoConnectResponse = await req.json();
  try {
    const vaultId = await verifyResponse(SismoConnectResponse);
    return NextResponse.json({ vaultId: vaultId }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

async function verifyResponse(sismoConnectResponse: SismoConnectResponse) {
  console.log("--- console 1");
  const result: SismoConnectVerifiedResult = await sismoConnect.verify(
    sismoConnectResponse,
    {
      auths: [{ authType: AuthType.VAULT }],
    }
  );
  console.log("--- console 2");
  const vaultId = result.getUserId(AuthType.VAULT);
  return vaultId;
}
