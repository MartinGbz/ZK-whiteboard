"use client";
import { sismoConnectConfig } from "@/app/configs/configs";
import {
  AuthType,
  SismoConnectButton,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import Title from "../title/title";
import "./header.css";
import LogoutIcon from "@mui/icons-material/Logout";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Home } from "@mui/icons-material";

interface HeaderProps {
  currentRoute: string;
  onChangeVaultId?: (vaultId: string | null) => void;
  whiteboardName?: string;
}

const Header: React.FC<HeaderProps> = ({
  onChangeVaultId,
  whiteboardName,
  currentRoute,
}) => {
  const router = useRouter();
  const [isLoging, setIsLoging] = useState<boolean>(false);
  const [vaultId, setVaultId] = useState<string | null>();

  useEffect(() => {
    const storagedVaultId = localStorage.getItem("vaultId");
    if (storagedVaultId) {
      setVaultId(storagedVaultId);
      onChangeVaultId ? onChangeVaultId(storagedVaultId) : undefined;
    }
  }, []);

  async function loginWithSismo(sismoConnectResponse: SismoConnectResponse) {
    // if the reponse does not come from the message creation
    if (sismoConnectResponse.proofs.length < 2) {
      setIsLoging(true);
      const response = await fetch("/api/whiteboard/login", {
        method: "POST",
        body: JSON.stringify(sismoConnectResponse),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      const vaultId = data.vaultId;
      setVaultId(vaultId);
      onChangeVaultId ? onChangeVaultId(vaultId) : undefined;
      localStorage.setItem("vaultId", vaultId);
      router.push(currentRoute);
      setIsLoging(false);
    }
  }

  return (
    <div className="header">
      {currentRoute !== "/" && (
        <Home
          style={{
            gridColumn: 1,
            // backgroundColor: "lightgray",
            justifySelf: "start",
            alignSelf: "center",
            cursor: "pointer",
            color: "white",
          }}
          fontSize="medium"
          onClick={() => router.push("/")}
        />
      )}
      <div
        style={{
          textAlign: "center",
          alignSelf: "center",
          gridColumn: 2,
          width: "max-content",
          display: "inline-flex",
        }}>
        <Title text="ZK-whiteboard" />
        {whiteboardName && (
          <div
            style={{
              color: "gray",
              alignSelf: "center",
              marginLeft: "5px",
            }}>
            {" "}
            / {whiteboardName}
          </div>
        )}
      </div>
      {!vaultId && !isLoging && (
        <SismoConnectButton
          overrideStyle={{
            gridColumn: "3",
            width: "fit-content",
            justifySelf: "end",
            height: "15px",
            backgroundColor: "lightgray",
            color: "black",
            alignSelf: "center",
          }}
          config={sismoConnectConfig}
          auth={{ authType: AuthType.VAULT }}
          namespace="main"
          onResponse={(response: SismoConnectResponse) => {
            loginWithSismo(response);
          }}
        />
      )}
      {vaultId && !isLoging && (
        <div className="login">
          <span className="user_id"> {vaultId.substring(0, 5) + "..."} </span>
          <button
            className="logout_button"
            onClick={() => {
              setVaultId(null);
              onChangeVaultId ? onChangeVaultId(null) : undefined;
              localStorage.removeItem("vaultId");
            }}>
            {" "}
            <LogoutIcon
              style={{
                fontSize: "20px",
              }}
            />
          </button>
        </div>
      )}
      {isLoging && <CircularProgress color="inherit" className="login" />}
    </div>
  );
};

export default Header;
