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
import { Home } from "@mui/icons-material";
import { User } from "@/app/types/whiteboard-types";

interface HeaderProps {
  currentRoute: string;
  onChangeUser?: (user: User | null) => void;
  whiteboardName?: string;
}

const Header: React.FC<HeaderProps> = ({
  onChangeUser,
  whiteboardName,
  currentRoute,
}) => {
  const router = useRouter();
  const [isLoging, setIsLoging] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storagedVaultId = localStorage.getItem("vaultId");
    if (storagedVaultId) {
      setIsLoging(true);
      getUser(storagedVaultId);
      setIsLoging(false);
    }
  }, []);

  async function getUser(vaultId: string) {
    const response = await fetch("/api/user", {
      method: "POST",
      body: JSON.stringify(vaultId),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const res = await response.json();
    const user = res.user;
    setUser(user);
    onChangeUser ? onChangeUser(user) : undefined;
  }

  async function loginWithSismo(sismoConnectResponse: SismoConnectResponse) {
    // if the reponse does not have a signed message, it means there is no action to perform, only a login
    // if the appId is the same as the one in the config, it means the login is for the app not for a whiteboard
    if (
      sismoConnectResponse.appId === sismoConnectConfig.appId &&
      !sismoConnectResponse.signedMessage
    ) {
      setIsLoging(true);
      const response = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify(sismoConnectResponse),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      const user: User = res.user;
      setUser(user);
      onChangeUser ? onChangeUser(user) : undefined;
      localStorage.setItem("vaultId", user.vaultId);
      router.push(currentRoute);
      setIsLoging(false);
    }
  }

  async function logout() {
    setUser(null);
    localStorage.removeItem("vaultId");
    onChangeUser ? onChangeUser(null) : undefined;
  }

  return (
    <div className="header">
      {currentRoute !== "/" && (
        <Home
          style={{
            gridColumn: 1,
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
        <Title
          text="ZK-whiteboard"
          style={{
            cursor: "pointer",
          }}
          onClick={() => {
            router.push("/");
          }}
        />
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
      {!user && !isLoging && (
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
      {user && !isLoging && (
        <div className="login">
          <span className="user_id">
            {" "}
            {user.vaultId.substring(0, 5) + "..."}{" "}
          </span>
          <button
            className="logout_button"
            onClick={() => {
              logout();
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
