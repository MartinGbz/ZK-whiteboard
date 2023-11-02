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
import { User, Whiteboard } from "@/types/whiteboard-types";
import { useLoginContext } from "@/context/login-context";
import axios from "axios";

const Header: React.FC = () => {
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
    console.log("isLoging", isLoging);
  }, [isLoging]);

  useEffect(() => {
    console.log("user", user);
  }, [user]);

  // console.log("$$$$$$ pathname", pathname);

  useEffect(() => {
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
        console.log("error", error);
      }
    };

    const whiteboardId = extractNumberFromPath(pathname);
    console.log("------- whiteboardId", whiteboardId);
    if (!whiteboardId) return;

    getWhiteboardName(whiteboardId);
  }, [pathname]);

  function extractNumberFromPath(path: string): number | null {
    const regex = /^\/whiteboard\/(\d+)$/; // Regex pattern to match "/whiteboard/{number}"
    const match = path.match(regex); // Try to match the input string with the regex pattern

    if (match && match[1]) {
      // If there is a match and capturing group is present (number part)
      return parseInt(match[1], 10); // Parse the captured number and return
    } else {
      // If no match was found, or capturing group is missing
      return null;
    }
  }

  useEffect(() => {
    console.log(" --- €€€€€€whiteboardName", whiteboardName);
  }, [whiteboardName]);

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
