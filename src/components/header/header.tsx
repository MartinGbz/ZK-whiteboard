"use client";
import { mobileWidthThreshold } from "@/configs/configs";
import Title from "../title/title";
import "./header.css";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home } from "@mui/icons-material";
import { Whiteboard } from "@/types/whiteboard-types";
import { useLoginContext } from "@/context/login-context";
import axios from "axios";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [userAddressCropped, setUserAddressCropped] = useState<String | null>(
    null
  );

  const [whiteboardName, setWhiteboardName] = useState<string | null>(null);
  const [whiteboardNameCropped, setWhiteboardNameCropped] =
    useState<string>("");

  const [titleFontSize, setTitleFontSize] = useState<number>(20);

  const { user, isLoging, login, logout } = useLoginContext();

  useEffect(() => {
    function extractNumberFromPath(path: string): number | null {
      const regex = /^\/whiteboard\/(\d+)$/;
      const match = path.match(regex);

      if (match && match[1]) {
        return parseInt(match[1], 10);
      } else {
        return null;
      }
    }

    const getWhiteboardName = async (whiteboardId: number) => {
      try {
        const response = await axios.post("/api/whiteboard", whiteboardId, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const whiteboard: Whiteboard = response.data;
        setWhiteboardName(whiteboard.name);
      } catch (error) {
        console.error("error", error);
      }
    };

    const whiteboardId = extractNumberFromPath(pathname);
    if (!whiteboardId) return;

    getWhiteboardName(whiteboardId);
  }, [pathname]);

  useEffect(() => {
    if (window.innerWidth < mobileWidthThreshold) {
      setUserAddressCropped(user?.vaultId.substring(0, 4) + "...");
      setTitleFontSize(15);
      whiteboardName?.length &&
        setWhiteboardNameCropped(
          whiteboardName?.substring(0, 10) +
            (whiteboardName?.length > 10 ? "..." : "")
        );
    } else {
      setUserAddressCropped(user?.vaultId.substring(0, 5) + "...");
      setTitleFontSize(20);
      setWhiteboardNameCropped(whiteboardName ?? "");
    }
    function resizeHandler() {
      if (window.innerWidth < mobileWidthThreshold) {
        setUserAddressCropped(user?.vaultId.substring(0, 4) + "...");
        setTitleFontSize(15);
        whiteboardName?.length &&
          setWhiteboardNameCropped(
            whiteboardName?.substring(0, 10) +
              (whiteboardName?.length > 10 ? "..." : "")
          );
      } else {
        setUserAddressCropped(user?.vaultId.substring(0, 7) + "...");
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
