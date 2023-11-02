"use client";
import {
  ZKWHITEBOARD_VAULTID_VARNAME,
  mobileWidthThreshold,
  sismoConnectConfig,
} from "@/configs/configs";
import {
  AuthType,
  SismoConnect,
  SismoConnectClient,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import Title from "../title/title";
import "./header.css";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { use, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home } from "@mui/icons-material";
import { User } from "@/types/whiteboard-types";
import { useLogin } from "@/hooks/useLogin";
import { useLoginContext } from "@/context/login-context";

interface HeaderProps {
  onChangeUser?: (user: User | null) => void;
  whiteboardName?: string;
}

const Header: React.FC<HeaderProps> = ({ onChangeUser, whiteboardName }) => {
  const router = useRouter();
  const pathname = usePathname();

  // console.log("***pathname", pathname);

  // const [isLoging, setIsLoging] = useState<boolean>(false);
  // const [user, setUser] = useState<User | null>(null);
  const [userAddressCropped, setUserAddressCropped] = useState<String | null>(
    null
  );
  const [loginButtonText, setLoginButtonText] = useState<string>("");
  // const [sismoConnectResponseMessage, setSismoConnectResponseMessage] =
  //   useState<SismoConnectResponse | null>(null);

  const [whiteboardNameCropped, setWhiteboardNameCropped] =
    useState<string>("");

  const [titleFontSize, setTitleFontSize] = useState<number>(20);

  // const [user, isLoging, login, logout] = useLogin();

  const { user, isLoging, login, logout } = useLoginContext();

  useEffect(() => {
    console.log("isLoging", isLoging);
  }, [isLoging]);

  useEffect(() => {
    console.log("user", user);
  }, [user]);

  // const storagedVaultId = localStorage.getItem(ZKWHITEBOARD_VAULTID_VARNAME);
  // if (storagedVaultId) {
  //   const response = await fetch("/api/user", {
  //     method: "POST",
  //     body: JSON.stringify(storagedVaultId),
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  //   const res = await response.json();
  //   const user = res.user;
  //   user(user);
  // }

  // useEffect(() => {
  //   const getUser = async () => {
  //     setIsLoging(true);
  //     const storagedVaultId = localStorage.getItem(
  //       ZKWHITEBOARD_VAULTID_VARNAME
  //     );
  //     if (storagedVaultId) {
  //       const response = await fetch("/api/user", {
  //         method: "POST",
  //         body: JSON.stringify(storagedVaultId),
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });
  //       const res = await response.json();
  //       const user = res.user;
  //       // setUser(user);
  //       onChangeUser ? onChangeUser(user) : undefined;
  //     }
  //     setIsLoging(false);
  //   };
  //   getUser();
  // }, [onChangeUser]);

  useEffect(() => {
    if (window.innerWidth < mobileWidthThreshold) {
      setUserAddressCropped(user?.vaultId.substring(0, 4) + "...");
      setLoginButtonText("Login");
      setTitleFontSize(15);
      whiteboardName?.length &&
        setWhiteboardNameCropped(
          whiteboardName?.substring(0, 10) +
            (whiteboardName?.length > 10 ? "..." : "")
        );
    } else {
      setUserAddressCropped(user?.vaultId.substring(0, 5) + "...");
      setLoginButtonText("Login w/ Sismo");
      setTitleFontSize(20);
      setWhiteboardNameCropped(whiteboardName ?? "");
    }
    function resizeHandler() {
      if (window.innerWidth < mobileWidthThreshold) {
        setUserAddressCropped(user?.vaultId.substring(0, 4) + "...");
        setLoginButtonText("Login");
        setTitleFontSize(15);
        whiteboardName?.length &&
          setWhiteboardNameCropped(
            whiteboardName?.substring(0, 10) +
              (whiteboardName?.length > 10 ? "..." : "")
          );
      } else {
        setUserAddressCropped(user?.vaultId.substring(0, 7) + "...");
        setLoginButtonText("Login w/ Sismo");
        setTitleFontSize(20);
        setWhiteboardNameCropped(whiteboardName ?? "");
      }
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", resizeHandler);
    }
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", resizeHandler);
      }
    };
  }, [user?.vaultId, whiteboardName]);

  // async function logout() {
  //   setUser(null);
  //   localStorage.removeItem(ZKWHITEBOARD_VAULTID_VARNAME);
  //   onChangeUser ? onChangeUser(null) : undefined;
  // }

  // let sismoConnect = useRef<SismoConnectClient | null>(null);
  // sismoConnect.current = SismoConnect({
  //   config: {
  //     appId: sismoConnectConfig.appId,
  //   },
  // });
  // sismoConnect.current = SismoConnect({
  //   config: {
  //     appId: sismoConnectConfig.appId,
  //   },
  // });

  // function login() {
  //   if (!sismoConnect.current) {
  //     console.error("Error with sismoConnect");
  //     return;
  //   }
  //   sismoConnect.current.request({
  //     namespace: "main",
  //     auth: { authType: AuthType.VAULT },
  //   });
  // }

  // useEffect(() => {
  //   if (!sismoConnect.current) return;
  //   const responseMessage: SismoConnectResponse | null =
  //     sismoConnect.current.getResponse();

  //   if (responseMessage) {
  //     setSismoConnectResponseMessage(responseMessage);
  //   }
  // }, []);

  // useEffect(() => {
  //   async function loginWithSismo(sismoConnectResponse: SismoConnectResponse) {
  //     // if the reponse does not have a signed message, it means there is no action to perform, only a login
  //     // if the appId is the same as the one in the config, it means the login is for the app not for a whiteboard
  //     if (
  //       sismoConnectResponse.appId === sismoConnectConfig.appId &&
  //       !sismoConnectResponse.signedMessage
  //     ) {
  //       setIsLoging(true);
  //       const response = await fetch("/api/login", {
  //         method: "POST",
  //         body: JSON.stringify(sismoConnectResponse),
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });
  //       const res = await response.json();
  //       const user: User = res.user;
  //       setUser(user);
  //       onChangeUser ? onChangeUser(user) : undefined;
  //       localStorage.setItem(ZKWHITEBOARD_VAULTID_VARNAME, user.vaultId);
  //       router.push(pathname);
  //       setIsLoging(false);
  //     }
  //   }

  //   if (sismoConnectResponseMessage) {
  //     loginWithSismo(sismoConnectResponseMessage);
  //   }
  // }, [onChangeUser, pathname, router, sismoConnectResponseMessage]);

  return (
    <div
      className="header"
      style={{
        gridTemplateColumns: !whiteboardName ? "1fr 1fr 1fr" : "",
        gridAutoColumns: whiteboardName ? "max-content" : "",
        justifyContent: whiteboardName ? "space-between" : "",
      }}>
      {pathname !== "/" && pathname !== "/whiteboards" && (
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
          fontSize: titleFontSize,
        }}>
        <Title
          text="ZK-whiteboard"
          style={{
            cursor: "pointer",
            fontSize: titleFontSize,
          }}
          onClick={() => {
            router.push("/");
          }}
        />
        {whiteboardName && whiteboardNameCropped && (
          <div
            style={{
              color: "gray",
              alignSelf: "center",
              marginLeft: "5px",
            }}>
            {" "}
            / {whiteboardNameCropped}
          </div>
        )}
      </div>
      {!user && !isLoging && (
        <button className="login login-button" onClick={login}>
          <span className="login-button-text">Login w/ Sismo</span>
          <LoginIcon
            style={{
              fontSize: "20px",
              alignSelf: "center",
            }}
          />
        </button>
      )}
      {user && !isLoging && (
        <div className="login">
          <span title={user.vaultId} className="user_id">
            {userAddressCropped}
          </span>
          <button className="logout_button" onClick={logout}>
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
