import { NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";
import { NextApiRequest } from "next";
import {
  SismoConnect,
  SismoConnectVerifiedResult,
  AuthType,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-server";
import { sismoConnectConfig } from "@/app/configs/configs";
import {
  Message,
  OperationType,
  SignedMessage,
} from "@/app/types/whiteboard-types";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const messages = await prisma.message.findMany();
  return NextResponse.json(messages);
}

export async function POST(req: Request): Promise<NextResponse> {
  const sismoConnectResponse: SismoConnectResponse = await req.json();
  if (sismoConnectResponse.signedMessage) {
    const signedMessage = JSON.parse(
      sismoConnectResponse.signedMessage
    ) as SignedMessage;
    switch (signedMessage.type) {
      case OperationType.POST:
        return await addMessage(sismoConnectResponse);
      case OperationType.DELETE:
        return await deleteMessage(sismoConnectResponse);
      default:
        return NextResponse.json({ error: "No type" });
    }
  } else {
    return NextResponse.json({ error: "No signedMessage" });
  }
}

async function addMessage(
  sismoConnectResponse: SismoConnectResponse
): Promise<NextResponse> {
  const vaultId = await verifyResponseAddMessage(sismoConnectResponse);
  if (vaultId) {
    // do something
    if (!sismoConnectResponse.signedMessage) {
      return NextResponse.json({ error: "No signedMessage" });
    }
    const message = JSON.parse(
      sismoConnectResponse.signedMessage
    ) as SignedMessage;
    const allMessagesInDB = await addMessageToDB(vaultId, message);
    return allMessagesInDB;
  } else {
    return NextResponse.json({ error: "Proof incorrect" });
  }
}

async function deleteMessage(
  sismoConnectResponse: SismoConnectResponse
): Promise<NextResponse> {
  console.log("--- deleteMessage ---");
  const vaultId = await verifyResponseDeleteMessage(sismoConnectResponse);
  if (vaultId) {
    console.log("===> vaultId", vaultId);
    const deletedMessage = await deleteMessageFromDB(vaultId);
    return deletedMessage;
  } else {
    return NextResponse.json({ error: "Proof incorrect" });
  }
}

// export async function DELETE(req: NextApiRequest) {
//   console.log("delete");
//   console.log("req", req);
//   console.log("req.url", req.url);
//   let vaultId;
//   if (req.url) {
//     const url = new URL(req.url, `http://${req.headers.host}`);
//     console.log("url", url);
//     vaultId = url.searchParams.get("vaultId");
//     console.log("vaultId", vaultId);
//   }
//   console.log(vaultId);
//   if (!vaultId) return NextResponse.json({ error: "no vaultId" });
//   try {
//     const deletedMessage = await prisma.message.delete({
//       where: {
//         vaultId: vaultId,
//       },
//     });
//     return NextResponse.json(deletedMessage);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(error);
//   }
// }

async function addMessageToDB(
  vaultId: string,
  signedMessage: SignedMessage
): Promise<NextResponse> {
  try {
    const existingMessage = await prisma.message.findUnique({
      where: {
        vaultId: vaultId,
      },
    });
    if (!existingMessage) {
      const newMessage = await prisma.message.create({
        data: {
          vaultId: vaultId,
          text: signedMessage.message.text,
          positionX: signedMessage.message.positionX,
          positionY: signedMessage.message.positionY,
          // order: message.order,
          color: signedMessage.message.color,
        },
      });
      const messages = await prisma.message.findMany();
      return NextResponse.json(messages);
    } else {
      console.error("Message already exists");
      return NextResponse.json({ error: "user already posted message" });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(error);
  }
}

async function deleteMessageFromDB(vaultId: string): Promise<NextResponse> {
  try {
    const deletedMessage = await prisma.message.delete({
      where: {
        vaultId: vaultId,
      },
    });
    const messages = await prisma.message.findMany();
    return NextResponse.json(messages);
  } catch (error) {
    console.error(error);
    return NextResponse.json(error);
  }
}

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

async function verifyResponseAddMessage(
  sismoConnectResponse: SismoConnectResponse
): Promise<string | undefined> {
  const message = sismoConnectResponse.signedMessage
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
  return vaultId;
}

async function verifyResponseDeleteMessage(
  sismoConnectResponse: SismoConnectResponse
): Promise<string | undefined> {
  const message = sismoConnectResponse.signedMessage
    ? sismoConnectResponse.signedMessage
    : "";
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
