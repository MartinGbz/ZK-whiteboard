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

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

export async function POST(req: Request) {
  const sismoConnectResponse = await req.json();
  // const vaultId = await verifyResponse(SismoConnectResponse);
  console.log("--- console 1");
  try {
    const result: SismoConnectVerifiedResult = await sismoConnect.verify(
      sismoConnectResponse,
      {
        namespace: "main",
        auths: [{ authType: AuthType.VAULT }],
      }
    );
    console.log("--- console 2");
    const vaultId = result.getUserId(AuthType.VAULT);
    return NextResponse.json({ vaultId: vaultId }, { status: 200 });
  } catch (error) {
    console.log("--- console 3 ");
    return NextResponse.json({ error }, { status: 500 });
  }
}

// async function verifyResponse(sismoConnectResponse: SismoConnectResponse) {
// }
