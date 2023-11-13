"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Whiteboard as WhiteboardType } from "@/types/whiteboard-types";

import {
  AuthType,
  SismoConnect,
  SismoConnectClient,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import Whiteboard from "../whiteboard/whiteboard";
import { WHITEBOARD_VAULTID_VARNAME } from "@/configs/configs";
import { usePathname, useRouter } from "next/navigation";

interface whiteboardProps {
  whiteboard: WhiteboardType;
}

let sismoConnect: SismoConnectClient | null = null;

const WhiteboardPage = ({ whiteboard }: whiteboardProps) => {
  const [whiteboardVaultId, setWhiteboardVaultId] = useState<string | null>(
    null
  );
  const router = useRouter();
  const pathname = usePathname();

  const redirectToRoot = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  useEffect(() => {
    const loginToWhiteboard = async (
      sismoConnectResponseMessage: SismoConnectResponse
    ) => {
      const response = await fetch("/api/whiteboard/login", {
        method: "POST",
        body: JSON.stringify(sismoConnectResponseMessage),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
      setWhiteboardVaultId(response.vaultId);
      localStorage.setItem(
        WHITEBOARD_VAULTID_VARNAME + whiteboard.id,
        response.vaultId
      );
      redirectToRoot();
    };

    if (whiteboard?.id && whiteboard?.appId) {
      // configure sismo connect
      sismoConnect = SismoConnect({
        config: {
          appId: whiteboard.appId,
        },
      });

      // if we are in the whiteboard connexion process
      const responseMessage: SismoConnectResponse | null =
        sismoConnect.getResponse();
      if (responseMessage && !responseMessage.signedMessage) {
        loginToWhiteboard(responseMessage);
        return;
      }

      // if we are already connected to the whiteboard
      if (localStorage.getItem(WHITEBOARD_VAULTID_VARNAME + whiteboard.id)) {
        setWhiteboardVaultId(
          localStorage.getItem(WHITEBOARD_VAULTID_VARNAME + whiteboard.id)
        );
        // if not, start connexion with sismo connect process
      } else {
        sismoConnect.request({
          namespace: "main",
          auth: { authType: AuthType.VAULT },
        });
      }
    }
  }, [redirectToRoot, whiteboard]);

  return (
    whiteboardVaultId && (
      <Whiteboard
        whiteboard={whiteboard}
        whiteboardVaultId={whiteboardVaultId}
      />
    )
  );
};

export default WhiteboardPage;
