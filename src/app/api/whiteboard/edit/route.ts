import {
  MessageOperationType,
  SignedMessage,
  Whiteboard,
  WhiteboardOperationType,
  WhiteboardEditSignedMessage,
} from "@/app/types/whiteboard-types";
import {
  AuthType,
  SismoConnect,
  SismoConnectResponse,
  SismoConnectVerifiedResult,
} from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";
import { prisma } from "../../db";
import { MAX_CHARACTERS, sismoConnectConfig } from "@/app/configs/configs";
import { getWhiteboardById, verifyResponseMessage } from "../../common";

export async function POST(req: Request): Promise<NextResponse> {
  const sismoConnectResponse: SismoConnectResponse = await req.json();
  if (sismoConnectResponse.signedMessage) {
    const signedMessage = JSON.parse(
      sismoConnectResponse.signedMessage
    ) as WhiteboardEditSignedMessage;
    if (signedMessage.type === WhiteboardOperationType.EDIT) {
      return await saveWhiteboard(sismoConnectResponse, signedMessage);
    } else if (!signedMessage.type) {
      return NextResponse.json({ error: "No type" });
    } else {
      return NextResponse.json({ error: "Wrong API route" });
    }
  } else {
    return NextResponse.json({ error: "No signed message" });
  }
}

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

async function saveWhiteboard(
  sismoConnectResponse: SismoConnectResponse,
  signedMessage: WhiteboardEditSignedMessage
): Promise<NextResponse> {
  console.log("----- saveWhiteboard");
  // if (signedMessage.message.text.length > MAX_CHARACTERS) {
  //   return NextResponse.json({
  //     error:
  //       "The number of characters in the message exceeds the maximum allowed (100 characters max.)",
  //   });
  // }
  const vaultId = await verifyResponseMessage(
    sismoConnect,
    sismoConnectResponse
  );
  if (vaultId) {
    const allMessagesInDB = await saveWhiteboardToDB(vaultId, signedMessage);
    return allMessagesInDB;
  } else {
    return NextResponse.json({ error: "ZK Proof incorrect" });
  }
}

async function saveWhiteboardToDB(
  vaultId: string,
  signedMessage: WhiteboardEditSignedMessage
): Promise<NextResponse> {
  try {
    console.log("----- saveWhiteboardToDB");

    // const whiteboardId = signedMessage.message.id
    //   ? parseInt(signedMessage.message.id.toString())
    //   : undefined;

    const whiteboardId = parseInt(signedMessage.message.id.toString());

    // const whiteboardId =
    //   signedMessage.message && "id" in signedMessage.message
    //     ? parseInt(signedMessage.message.id.toString())
    //     : undefined;

    if (!whiteboardId) {
      return NextResponse.json({
        error: "No whiteboard id",
      });
    }
    // const whiteboardId = parseInt(signedMessage.message.id.toString());

    const existingWhiteboard = await prisma.whiteboard.findUnique({
      where: {
        // authorVaultId: vaultId,
        id: whiteboardId,
      },
    });
    console.log("existingWhiteboard", existingWhiteboard);
    // if (!existingWhiteboard) {
    //   return NextResponse.json({
    //     error: "You are not the author of this whiteboard",
    //   });
    // }
    if (existingWhiteboard?.authorVaultId !== vaultId) {
      return NextResponse.json({
        error: "You are not the author of this whiteboard",
      });
    }

    console.log("signedMessage.message", signedMessage.message);

    const editedWhiteboard = await prisma.whiteboard.update({
      where: {
        id: whiteboardId,
      },
      data: {
        name: signedMessage.message.name,
        description: signedMessage.message.description,
        groupIds: signedMessage.message.groupIds,
      },
    });
    console.log("editedWhiteboard", editedWhiteboard);
    return NextResponse.json(editedWhiteboard);
  } catch (error) {
    return NextResponse.json(error);
  }
}
