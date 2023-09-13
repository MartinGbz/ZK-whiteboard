import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { SiweMessage } from "siwe";
import Fastify from "fastify";
// import { FastifyInstance } from "fastify";

import { prisma } from "../../db";
import {
  WhiteboardCreateSignedMessage,
  WhiteboardOperationType,
} from "@/app/types/whiteboard-types";
import {
  SismoConnect,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-server";
import { verifyResponseMessage } from "../../common";
import {
  LOGO_BASE_64,
  MAX_CHARACTERS_WHITEBOARD_DESCRIPTION,
  MAX_CHARACTERS_WHITEBOARD_DESCRIPTION_MESSAGE,
  MAX_CHARACTERS_WHITEBOARD_NAME,
  MAX_CHARACTERS_WHITEBOARD_NAME_MESSAGE,
  MAX_WHITEBOARD_GROUPS,
  MAX_WHITEBOARD_GROUPS_MESSAGE,
  sismoConnectConfig,
} from "@/app/configs/configs";
import axios from "axios";

export const dynamic = "force-dynamic";

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

export async function POST(req: Request): Promise<NextResponse> {
  const sismoConnectResponse: SismoConnectResponse = await req.json();
  if (sismoConnectResponse.signedMessage) {
    const signedMessage = JSON.parse(
      sismoConnectResponse.signedMessage
    ) as WhiteboardCreateSignedMessage;
    if (signedMessage.type === WhiteboardOperationType.CREATE) {
      return await saveWhiteboard(sismoConnectResponse, signedMessage);
    } else if (!signedMessage.type) {
      return NextResponse.json({ error: "No type" });
    } else {
      return NextResponse.json({ error: "Wrong API route" });
    }
  } else {
    return NextResponse.json({ error: "No signed message" });
  }
  async function getAppId(whiteboardId: number): Promise<string> {
    const wallet = ethers.Wallet.createRandom();
    console.log("wallet.address", wallet.address);
    // const res = await fetch("https://factory-api.sismo.io/apps/create",  {
    //   method: "GET",
    // });
    const res = await axios.get(`https://factory-api.sismo.io/siwe/nonce`, {
      withCredentials: true,
    });
    const nonce = res.data.nonce;
    const nonceCookie = res.headers["set-cookie"]
      ? res.headers["set-cookie"][0]
      : "";
    if (!nonceCookie) {
      throw new Error("No nonceCookie");
    }
    console.log("nonceCookie", nonceCookie);
    console.log("nonce", nonce);
    const { message, signature } = await signSiweMessage(wallet, nonce);
    // console.log("message", message);
    // console.log("signature", signature);
    // console.log(
    //   "JSON.stringify({ message, signature })",
    //   JSON.stringify({ message, signature })
    // );
    const bodyVerify = JSON.stringify({ message, signature });
    console.log("bodyVerify", bodyVerify);
    console.log("{ message, signature }", { message, signature });
    // const fastify = Fastify({
    //   bodyLimit: 2097152, // 2MB
    //   ignoreTrailingSlash: true,
    // });
    // const cookies = {
    //   address: fastify.signCookie(unsignedCookie.value ?? ""),
    // };

    // const config = {
    //   method: "post",
    //   url: "https://factory-api.sismo.io/siwe/verify",
    //   headers: { "Content-Type": "application/json", Cookie: nonceCookie },
    //   body: {
    //     message: message,
    //     signature: signature,
    //   },
    // };
    // const responseVerify = await axios(config);
    const responseVerify = await axios.post(
      "https://factory-api.sismo.io/siwe/verify",
      {
        message: message,
        signature: signature,
      },
      {
        headers: { "Content-Type": "application/json", Cookie: nonceCookie },
        withCredentials: true,
      }
    );
    // const responseVerify = await fetch(
    //   "https://factory-api.sismo.io/siwe/verify",
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Cookie: nonceCookie,
    //     },
    //     body: bodyVerify,
    //   }
    // );
    // console.log("responseVerify", responseVerify);
    // console.log("responseVerify.headers", responseVerify.headers);
    // console.log("responseVerify.headers", responseVerify.headers);

    // const cookies = [];

    // for (const [key, value] of responseVerify.headers.entries()) {
    //   if (key === "Set-Cookie") {
    //     cookies.push(value);
    //   }
    // }
    // console.log(
    //   'res.headers["set-cookie"]',
    //   responseVerify.headers["set-cookie"]
    // );
    // const headers: any = responseVerify.headers.entries();
    // console.log('res.headers["set-cookie"]', headers);
    // console.log("headers", headers);
    // console.log('headers["cookies"]', headers["cookies"]);
    console.log("responseVerify", responseVerify);
    console.log("res.headers", responseVerify.headers);
    console.log(
      "res.headers['set-cookie']",
      responseVerify.headers["set-cookie"]
    );
    const verifyCookie = responseVerify.headers["set-cookie"];
    if (!verifyCookie) {
      throw new Error("No verifyCookie");
    }
    //   ? res.headers["set-cookie"][0]
    //   : "";
    // if (!nonceCookie) {
    //   throw new Error("No nonceCookie");
    // }
    const body = {
      appInput: {
        name: "zk-whiteboard-test-" + whiteboardId,
        description:
          "This is an app created by a user of zk-whiteboard.xyz. It allows to create a new whiteboard.",
        authorizedDomains: ["zk-whiteboard.xyz"],
        logoBase64: LOGO_BASE_64,
        creatorId: wallet.address,
      },
    };
    // const response = await fetch("https://factory-api.sismo.io/apps/create", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Cookie: nonceCookie,
    //   },
    //   body: JSON.stringify(body),
    // });

    const response = await axios.post(
      "https://factory-api.sismo.io/apps/create",
      body,
      {
        headers: { "Content-Type": "application/json", Cookie: verifyCookie },
        withCredentials: true,
      }
    );

    console.log("response", response);
    console.log("response.data", response.data);
    console.log("response.data.id", response.data.id);
    // const responseJson = await response.json();
    return await response.data.id;
  }

  async function signSiweMessage(
    wallet: ethers.Wallet,
    nonce: string
  ): Promise<{
    message: string;
    signature: string;
  }> {
    const message = await createSiweMessage(
      wallet.address,
      "Sign in with Ethereum to the app.",
      nonce
    );
    const signature = await wallet.signMessage(message);
    return { message, signature };
  }

  async function createSiweMessage(
    address: string,
    statement: string,
    nonce: string
  ): Promise<string> {
    const message = new SiweMessage({
      domain: "factory.sismo.io",
      address,
      statement,
      uri: "htpps://factory.sismo.io",
      version: "1",
      chainId: 1,
      nonce,
    });

    return message.prepareMessage();
  }

  async function saveWhiteboard(
    sismoConnectResponse: SismoConnectResponse,
    signedMessage: WhiteboardCreateSignedMessage
  ): Promise<NextResponse> {
    if (signedMessage.message.name.length > MAX_CHARACTERS_WHITEBOARD_NAME) {
      return NextResponse.json({
        error: MAX_CHARACTERS_WHITEBOARD_NAME_MESSAGE,
      });
    }
    if (
      signedMessage.message.name.length > MAX_CHARACTERS_WHITEBOARD_DESCRIPTION
    ) {
      return NextResponse.json({
        error: MAX_CHARACTERS_WHITEBOARD_DESCRIPTION_MESSAGE,
      });
    }
    if (signedMessage.message.groupIds.length > MAX_WHITEBOARD_GROUPS) {
      return NextResponse.json({
        error: MAX_WHITEBOARD_GROUPS_MESSAGE,
      });
    }
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
    signedMessage: WhiteboardCreateSignedMessage
  ): Promise<NextResponse> {
    const user = await prisma.user.findUnique({
      where: {
        vaultId: vaultId,
      },
      include: {
        createdWhiteboards: true,
      },
    });
    if (!user) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        { status: 404 }
      );
    }
    if (user?.createdWhiteboards.length >= 10) {
      return NextResponse.json(
        {
          error: "You've reached the maximum number of whiteboards created.",
        },
        { status: 403 }
      );
    }

    // const whiteboard = await prisma.whiteboard.create({
    //   data: {
    //     name: signedMessage.message.name,
    //     description: signedMessage.message.description,
    //     groupIds: signedMessage.message.groupIds,
    //     authorVaultId: vaultId,
    //     curated: false,
    //   },
    // });
    const whiteboard = await prisma.whiteboard.create({
      data: {
        name: signedMessage.message.name,
        description: signedMessage.message.description,
        groupIds: signedMessage.message.groupIds,
        curated: false,
        author: {
          connect: { vaultId: vaultId }, // Assurez-vous que cette relation est correcte
        },
        appId: "",
      },
    });

    console.log("whiteboard", whiteboard);

    const sismoAppId = await getAppId(whiteboard.id);
    if (!sismoAppId) {
      return NextResponse.json(
        {
          error: "App not created.",
        },
        { status: 500 }
      );
    }
    await prisma.whiteboard.update({
      where: { id: whiteboard.id },
      data: { appId: sismoAppId },
    });

    return NextResponse.json(whiteboard);
  }
}
