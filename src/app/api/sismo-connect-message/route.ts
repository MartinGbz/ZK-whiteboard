import { sismoConnectConfig } from "@/app/configs/configs";
// import { SismoConnect, SismoConnectResponse, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-react";
import { SismoConnect, SismoConnectVerifiedResult, AuthType, SismoConnectResponse } from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json("test");
}

export async function POST(req: Request) {
  const body = await req.json();
  console.log("$$$ 00000 $$$ body")
  console.log(body)
  const SismoConnectResponse = body;
  const newMessage = await verifyResponse(SismoConnectResponse);
  console.log("$$$ 22222 $$$ signedMessage")
  console.log(newMessage)
  return NextResponse.json(newMessage);
}

const sismoConnect = SismoConnect({config: sismoConnectConfig});

async function verifyResponse(sismoConnectResponse: SismoConnectResponse) {
  console.log("$$$$$$$$$$$$$$$ message")
  let message = sismoConnectResponse.signedMessage ? sismoConnectResponse.signedMessage : "";
  const result: SismoConnectVerifiedResult = await sismoConnect.verify(
    sismoConnectResponse,
    {
      auths: [{ authType: AuthType.VAULT }],
      claims: [{ groupId: "0x3d7589d9259eb410180f085cada87030" }],
      signature: { message: message },
    }
  )
  const vaultId = result.getUserId(AuthType.VAULT)
  const signedMessage = result.getSignedMessage()
  if(vaultId && signedMessage) {
    return {vaultId: vaultId, ...JSON.parse(signedMessage)};
  }
  // console.log("$$$$$$$$$$$$$$$ vaultId")
  // console.log(vaultId)
  // return vaultId;
}