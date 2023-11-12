"use client";

import React, { useEffect, useState } from "react";
import { Whiteboard as WhiteboardType } from "@/types/whiteboard-types";

import {
  AuthType,
  SismoConnect,
  SismoConnectClient,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import Whiteboard from "../whiteboard/whiteboard";
import { WHITEBOARD_VAULTID_VARNAME } from "@/configs/configs";
import { useRouter } from "next/navigation";

interface whiteboardProps {
  whiteboard: WhiteboardType;
}

let sismoConnect: SismoConnectClient | null = null;

const WhiteboardPage = ({ whiteboard }: whiteboardProps) => {
  const [whiteboardVaultId, setWhiteboardVaultId] = useState<string | null>(
    null
  );
  const router = useRouter();

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
      console.log(response);
      setWhiteboardVaultId(response.vaultId);
      localStorage.setItem(
        WHITEBOARD_VAULTID_VARNAME + whiteboard.id,
        response.vaultId
      );
      router.push("/whiteboard/" + whiteboard.id);
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
      if (responseMessage) {
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
  }, [whiteboard]);

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
