import { sismoConnectConfig } from "@/configs/configs";
import {
  SismoConnect,
  SismoConnectVerifiedResult,
  AuthType,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";
import { prisma } from "../db";

export async function GET(req: Request) {
  return NextResponse.json("test");
}

export async function POST(req: Request) {
  const SismoConnectResponse = await req.json();
  const vaultId = await verifyResponse(SismoConnectResponse);
  if (!vaultId) {
    return NextResponse.json({ error: "ZK Proof incorrect" });
  }
  let userLogged;
  const userAlreadyRecorded = await prisma.user.findUnique({
    where: {
      vaultId: vaultId,
    },
    include: {
      createdWhiteboards: true,
    },
  });
  userLogged = userAlreadyRecorded;
  if (!userAlreadyRecorded) {
    const user = await prisma.user.create({
      data: {
        vaultId: vaultId,
      },
      include: {
        createdWhiteboards: true,
      },
    });
    userLogged = user;
  }
  return NextResponse.json({ user: userLogged });
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
