"use client";
import { sismoConnectConfig } from "@/app/configs/configs";
import {
  AuthType,
  SismoConnectButton,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import Title from "../title/title";
import LogoutIcon from "@mui/icons-material/Logout";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";

interface HeaderProps {
  vaultId: string | null;
  isLoging: boolean | null;
  loginWithSismo?: (response: SismoConnectResponse) => void;
  setVaultId?: (vaultId: string | null) => void;
}

const Header: React.FC<HeaderProps> = ({
  vaultId,
  isLoging,
  loginWithSismo,
  setVaultId,
}) => {
  return (
    <div className="header">
      <Title
        text="Whiteboard"
        style={{
          textAlign: "center",
          alignSelf: "center",
          gridColumn: 2,
          width: "max-content",
        }}
      />
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
            loginWithSismo ? loginWithSismo(response) : undefined;
          }}
        />
      )}
      {vaultId && !isLoging && (
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
            />{" "}
            Logout
          </button>
        </div>
      )}
      {isLoging && <CircularProgress color="inherit" className="login" />}
    </div>
  );
};

export default Header;
