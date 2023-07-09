import { sismoConnectConfig } from "@/app/configs/configs";
// import { SismoConnect, SismoConnectResponse, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-react";
import { SismoConnect, SismoConnectVerifiedResult, AuthType, SismoConnectResponse } from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json("test");
}

export async function POST(req: Request) {
  const SismoConnectResponse = await req.json();
  const vaultId = await verifyResponse(SismoConnectResponse);
  console.log(">>22222>>> vaultId")
  console.log(vaultId)
  return NextResponse.json({ vaultId: vaultId });
}

const sismoConnect = SismoConnect({config: sismoConnectConfig});

async function verifyResponse(sismoConnectResponse: SismoConnectResponse) {
  const result: SismoConnectVerifiedResult = await sismoConnect.verify(
    sismoConnectResponse,
    {
      auths: [{ authType: AuthType.VAULT }],
    }
  )
  const vaultId = result.getUserId(AuthType.VAULT)
  console.log(">>>>> vaultId")
  console.log(vaultId)
  return vaultId;
}