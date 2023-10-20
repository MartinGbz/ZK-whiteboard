"use client";
import {
  ZKWHITEBOARD_VAULTID_VARNAME,
  sismoConnectConfig,
} from "@/configs/configs";
import {
  AuthType,
  SismoConnect,
  SismoConnectButton,
  SismoConnectClient,
  SismoConnectResponse,
  useSismoConnect,
} from "@sismo-core/sismo-connect-react";
import Title from "../title/title";
import "./header.css";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home } from "@mui/icons-material";
import { User } from "@/types/whiteboard-types";

interface HeaderProps {
  onChangeUser: (user: User | null) => void;
  whiteboardName?: string;
}

const Header: React.FC<HeaderProps> = ({ onChangeUser, whiteboardName }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoging, setIsLoging] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [userAddressCropped, setUserAddressCropped] = useState<String | null>(
    null
  );
  const [loginButtonText, setLoginButtonText] = useState<string>("");

  useEffect(() => {
    const getUser = async () => {
      setIsLoging(true);
      const storagedVaultId = localStorage.getItem(
        ZKWHITEBOARD_VAULTID_VARNAME
      );
      if (storagedVaultId) {
        const response = await fetch("/api/user", {
          method: "POST",
          body: JSON.stringify(storagedVaultId),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const res = await response.json();
        const user = res.user;
        setUser(user);
        onChangeUser(user);
      }
      setIsLoging(false);
    };
    getUser();
  }, [onChangeUser]);

  useEffect(() => {
    if (window.innerWidth < 800) {
      setUserAddressCropped(user?.vaultId.substring(0, 4) + "...");
      setLoginButtonText("Login");
    } else {
      setUserAddressCropped(user?.vaultId.substring(0, 7) + "...");
      setLoginButtonText("Login w/ Sismo");
    }
    function resizeHandler() {
      if (window.innerWidth < 800) {
        setUserAddressCropped(user?.vaultId.substring(0, 4) + "...");
        setLoginButtonText("Login");
      } else {
        setUserAddressCropped(user?.vaultId.substring(0, 7) + "...");
        setLoginButtonText("Login w/ Sismo");
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
  }, [user?.vaultId]);

  async function logout() {
    setUser(null);
    localStorage.removeItem(ZKWHITEBOARD_VAULTID_VARNAME);
    onChangeUser(null);
  }

  // const loginWithSismo = useCallback(
  //   async (sismoConnectResponse: SismoConnectResponse) => {
  //     console.log("---sismoConnectResponse", sismoConnectResponse);
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
  //       onChangeUser(user);
  //       localStorage.setItem(ZKWHITEBOARD_VAULTID_VARNAME, user.vaultId);
  //       router.push(pathname);
  //       setIsLoging(false);
  //     }
  //   },
  //   [onChangeUser, pathname, router]
  // );

  let sismoConnect = useRef<SismoConnectClient | null>(null);
  sismoConnect.current = SismoConnect({
    config: {
      appId: sismoConnectConfig.appId,
    },
  });
  sismoConnect.current = SismoConnect({
    config: {
      appId: sismoConnectConfig.appId,
    },
  });

  function login() {
    if (!sismoConnect.current) {
      console.error("Error with sismoConnect");
      return;
    }
    sismoConnect.current.request({
      namespace: "main",
      auth: { authType: AuthType.VAULT },
    });
  }

  useEffect(() => {
    async function loginWithSismo(sismoConnectResponse: SismoConnectResponse) {
      console.log("---sismoConnectResponse", sismoConnectResponse);
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
        onChangeUser(user);
        localStorage.setItem(ZKWHITEBOARD_VAULTID_VARNAME, user.vaultId);
        router.push(pathname);
        setIsLoging(false);
      }
    }
    console.log("getResponse");
    // console.log(pathname);
    // console.log(router);

    if (!sismoConnect.current) return;
    const responseMessage: SismoConnectResponse | null =
      sismoConnect.current.getResponse();

    if (responseMessage) {
      loginWithSismo(responseMessage);
    }

    // Because react strictmode is enabled by default since nextjs 13.4, he call is made twice on dev (on prod 1 call should be done)
    // It means the useEffec shouldn't be used here but I don't know how to do it otherwise for now
  }, [onChangeUser, pathname, router]);

  return (
    <div className="header">
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
        // <SismoConnectButton
        //   overrideStyle={{
        //     gridColumn: "3",
        //     width: "fit-content",
        //     justifySelf: "end",
        //     height: "15px",
        //     backgroundColor: "lightgray",
        //     color: "black",
        //     alignSelf: "center",
        //     fontSize: "10px",
        //   }}
        //   text={loginButtonText}
        //   config={sismoConnectConfig}
        //   auth={{ authType: AuthType.VAULT }}
        //   namespace="main"
        //   onResponse={(response: SismoConnectResponse) => {
        //     loginWithSismo(response);
        //   }}
        // />
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
