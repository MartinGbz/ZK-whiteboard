import { sismoConnectConfig } from "@/app/configs/configs";
import {
  SismoConnect,
  SismoConnectVerifiedResult,
  AuthType,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";
import { prisma } from "../../db";

export async function GET(req: Request) {
  return NextResponse.json("test");
}

export async function POST(req: Request) {
  const SismoConnectResponse = await req.json();
  const vaultId = await verifyResponse(SismoConnectResponse);
  if (!vaultId) {
    return NextResponse.json({ error: "ZK Proof incorrect" });
  }
  const userAlreadyRecorded = await prisma.user.findUnique({
    where: {
      vaultId: vaultId,
    },
  });
  if (!userAlreadyRecorded) {
    const user = await prisma.user.create({
      data: {
        vaultId: vaultId,
      },
    });
  }
  return NextResponse.json({ vaultId: vaultId });
}

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

async function verifyResponse(sismoConnectResponse: SismoConnectResponse) {
  const result: SismoConnectVerifiedResult = await sismoConnect.verify(
    sismoConnectResponse,
    {
      auths: [{ authType: AuthType.VAULT }],
    }
  );
  const vaultId = result.getUserId(AuthType.VAULT);
  return vaultId;
}
