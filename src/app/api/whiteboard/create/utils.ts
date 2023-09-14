import { ethers } from "ethers";
import { SiweMessage } from "siwe";
import axios from "axios";
import { LOGO_BASE_64 } from "@/app/configs/configs";

export async function getAppId(whiteboardName: string): Promise<string> {
  const wallet = ethers.Wallet.createRandom();

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

  const { message, signature } = await signSiweMessage(wallet, nonce);

  const bodyVerify = JSON.stringify({ message, signature });

  const responseVerify = await axios.post(
    "https://factory-api.sismo.io/siwe/verify",
    bodyVerify,
    {
      headers: { "Content-Type": "application/json", Cookie: nonceCookie },
      withCredentials: true,
    }
  );

  const verifyCookie = responseVerify.headers["set-cookie"];
  if (!verifyCookie) {
    throw new Error("No verifyCookie");
  }

  if (!process.env.APP_DOMAIN_NAME) {
    throw new Error("No APP_DOMAIN_NAME env variable set");
  }
  if (!process.env.APP_TITLE) {
    throw new Error("No APP_TITLE env variable set");
  }

  const body = {
    appInput: {
      name: process.env.APP_TITLE + whiteboardName,
      description:
        "This is an app created by zk-whiteboard.xyz user. It lets you create a new whiteboard.",
      authorizedDomains: [process.env.APP_DOMAIN_NAME],
      logoBase64: LOGO_BASE_64,
      creatorId: wallet.address,
    },
  };

  const response = await axios.post(
    "https://factory-api.sismo.io/apps/create",
    body,
    {
      headers: { "Content-Type": "application/json", Cookie: verifyCookie },
      withCredentials: true,
    }
  );

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
