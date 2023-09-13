"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WhiteboardIndex } from "@/app/types/whiteboard-types";
import SettingsIcon from "@mui/icons-material/Settings";
import VerifiedIcon from "@mui/icons-material/Verified";
import PreviewIcon from "@mui/icons-material/Preview";
import { blueColor, greenColor } from "@/app/configs/configs";
import LoginIcon from "@mui/icons-material/Login";
import {
  AuthType,
  SismoConnect,
  SismoConnectButton,
  SismoConnectClient,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";

interface WhiteboardCardProps {
  vaultId: string | null;
  whiteboard: WhiteboardIndex;
  index: number;
  maxHeightsList: Array<number>;
  baseMaxHeight: number;
  maxMaxHeight: number;
}

const WhiteboardCard: React.FC<WhiteboardCardProps> = ({
  vaultId,
  whiteboard,
  index,
  maxHeightsList,
  baseMaxHeight,
  maxMaxHeight,
}) => {
  const router = useRouter();

  const [isHovering, setIsHovering] = useState<number | null>(null);
  const [isLoging, setIsLoging] = useState<boolean>(false);

  const [maxHeights, setMaxHeights] = useState<Array<number>>([]);

  let currentVaultId = localStorage.getItem(
    "vaultId-whiteboard-" + whiteboard.id
  );

  let responseMessage: SismoConnectResponse | null = null;

  let sismoConnect: SismoConnectClient = SismoConnect({
    config: {
      appId: whiteboard.appId ?? "",
    },
  });

  useEffect(() => {
    setMaxHeights(maxHeightsList);
  }, [maxHeightsList]);

  const handleDivClick = (index: number) => {
    const newMaxHeights = [...maxHeights];
    newMaxHeights[index] =
      maxHeights[index] === baseMaxHeight ? maxMaxHeight : baseMaxHeight;
    setMaxHeights(newMaxHeights);
  };

  const whiteboardClick = (whiteboard: WhiteboardIndex) => {
    router.push("/whiteboard/" + whiteboard.id);
  };

  const handleMouseEnter = (whiteboardId: number) => {
    setIsHovering(whiteboardId);
  };

  const handleMouseLeave = () => {
    setIsHovering(null);
  };

  function onSettings(whiteboard: WhiteboardIndex): void {
    router.push("/whiteboard/" + whiteboard.id + "/settings");
  }

  const requestLoginToWhiteboard = async () => {
    currentVaultId = localStorage.getItem(
      "vaultId-whiteboard-" + whiteboard.id
    );
    if (currentVaultId) {
      whiteboardClick(whiteboard);
    } else {
      sismoConnect.request({
        namespace: "main",
        auth: { authType: AuthType.VAULT },
      });
    }
  };

  useEffect(() => {
    if (responseMessage) {
      loginToWhiteboard(responseMessage);
    }
  }, [responseMessage]);

  async function loginToWhiteboard(sismoConnectResponse: SismoConnectResponse) {
    if (!currentVaultId) {
      setIsLoging(true);
      const response = await fetch("/api/whiteboard/login", {
        method: "POST",
        body: JSON.stringify(sismoConnectResponse),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      localStorage.setItem("vaultId-whiteboard-" + whiteboard.id, res.vaultId);
      setIsLoging(false);
    }
    whiteboardClick(whiteboard);
  }

  useEffect(() => {
    responseMessage = sismoConnect.getResponse();
    if (responseMessage?.appId === whiteboard.appId && responseMessage) {
      loginToWhiteboard(responseMessage);
    }
  }, []);

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "10px",
        boxShadow: "rgba(0, 0, 0, 0.25) 0px 1px 2px",
        color: "black",
        backgroundColor: "lightgrey",
        overflow: "visible",
      }}
      onMouseEnter={() => handleMouseEnter(whiteboard.id)}
      onMouseLeave={() => handleMouseLeave()}>
      <div
        className="whiteboard-item"
        style={{
          position: "relative",
          padding: "10px",
          marginBottom: "10px",
          cursor: "pointer",
          flex: "1",
          fontSize: "15px",
          display: "flex",
          flexDirection: "column",
          overflowY: "hidden",
          maxHeight: maxHeights[index],
          transition: "max-height 0.7s ease",
        }}
        onClick={(e) => {
          handleDivClick(index);
        }}>
        <div
          style={{
            marginBottom: "15px",
            fontSize: "15px",
            display: "grid",
          }}>
          {" "}
          <div
            style={{
              gridRow: 1,
              gridColumn: 1,
            }}>
            {whiteboard.name}{" "}
            {whiteboard.curated && (
              <VerifiedIcon
                style={{
                  fontSize: "12px",
                }}
                color="primary"
              />
            )}
          </div>
          <div
            title={whiteboard.authorVaultId}
            style={{
              color: "gray",
              fontSize: "10px",
              gridRow: 2,
              gridColumn: 1,
            }}>
            {" "}
            from: {whiteboard.authorVaultId.substring(0, 7)}{" "}
          </div>{" "}
          <div
            style={{
              gridRow: "1 / 3",
              gridColumn: "2",
              justifySelf: "end",
              display: "flex",
            }}>
            <button
              style={{
                backgroundColor: blueColor,
                marginLeft: "10px",
                padding: "5px",
                cursor: "pointer",
                borderRadius: "10px",
                border: "none",
                boxShadow: "rgba(0, 0, 0, 0.25) 0px 1px 2px",
                fontSize: "10px",
              }}
              onClick={(e) => {
                e.stopPropagation();
                whiteboardClick(whiteboard);
              }}>
              <PreviewIcon />
            </button>
            <button
              style={{
                backgroundColor: greenColor,
                marginLeft: "10px",
                padding: "5px",
                cursor: "pointer",
                borderRadius: "10px",
                border: "none",
                boxShadow: "rgba(0, 0, 0, 0.25) 0px 1px 2px",
              }}
              onClick={(e) => {
                e.stopPropagation();
                requestLoginToWhiteboard();
              }}>
              <LoginIcon />
            </button>
          </div>
        </div>
        <div
          style={{
            color: "gray",
            fontSize: "12px",
            gridRow: 3,
            gridColumn: 3,
          }}>
          <div>
            <span
              style={{
                color: "black",
              }}>
              Description:
            </span>{" "}
            {whiteboard.description}
          </div>
          <div
            style={{
              color: "black",
            }}>
            {" "}
            Group names:{" "}
          </div>
          {whiteboard.groupNames.map((groupName: string, index) => (
            <span key={groupName}>
              <a
                style={{
                  textDecoration: "underline",
                }}
                target="_blank"
                href={
                  "https://factory.sismo.io/groups-explorer?search=" + groupName
                }
                onClick={(e) => {
                  e.stopPropagation();
                }}>
                {groupName}
              </a>
              {index < whiteboard.groupNames.length - 1 && ", "}
            </span>
          ))}
        </div>
      </div>
      {vaultId === whiteboard.authorVaultId && (
        <button
          className="delete-button"
          style={{
            backgroundColor: "black",
            borderRadius: "50%",
            textAlign: "center",
            position: "absolute",

            top: "-10px",
            right: "-10px",
            transition: "opacity 0.2s, transform 0.2s, translate 0.2s",
            opacity: isHovering == whiteboard.id ? "1" : "0",
            transform: isHovering == whiteboard.id ? "scale(1.1)" : "scale(1)",
            cursor: "pointer",
            display: "inline-flex",
            padding: "5px",
            boxShadow: "rgba(0, 0, 0, 0.25) -5px 5px 15px 3px",
          }}
          onClick={() => onSettings(whiteboard)}>
          <SettingsIcon
            style={{
              color: "white",
              fontSize: "small",
            }}
          />
        </button>
      )}
    </div>
  );
};

export default WhiteboardCard;
