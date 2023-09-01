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

interface HeaderProps {
  vaultId?: string | null;
  isLoging?: boolean | null;
  loginWithSismo?: (response: SismoConnectResponse) => void;
  setVaultId?: (vaultId: string | null) => void;
  signInButton: boolean;
  whiteboardName?: string;
}

const Header: React.FC<HeaderProps> = ({
  vaultId,
  isLoging,
  loginWithSismo,
  setVaultId,
  signInButton,
  whiteboardName,
}) => {
  return (
    <div className="header">
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
      {signInButton && !vaultId && !isLoging && (
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
            loginWithSismo ? loginWithSismo(response) : undefined;
          }}
        />
      )}
      {signInButton && vaultId && !isLoging && (
        <div className="login">
          <span className="user_id"> {vaultId.substring(0, 5) + "..."} </span>
          <button
            className="logout_button"
            onClick={() => {
              setVaultId ? setVaultId(null) : undefined;
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
      {signInButton && isLoging && (
        <CircularProgress color="inherit" className="login" />
      )}
    </div>
  );
};

export default Header;
