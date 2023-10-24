"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WhiteboardIndex } from "@/types/whiteboard-types";
import SettingsIcon from "@mui/icons-material/Settings";
import VerifiedIcon from "@mui/icons-material/Verified";
import LoginIcon from "@mui/icons-material/Login";
import { Tooltip } from "@mui/material";

import "./whiteboard-card.css";

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

  const [maxHeights, setMaxHeights] = useState<Array<number>>([]);
  const [loginMouseOver, setLoginMouseOver] = useState<boolean>(false);
  const [settingsMouseOver, setSettingsMouseOver] = useState<boolean>(false);
  const padding = useRef<number>(10);

  useEffect(() => {
    setMaxHeights(maxHeightsList);
  }, [maxHeightsList]);

  const handleDivClick = (index: number) => {
    const newMaxHeights = [...maxHeights];
    newMaxHeights[index] =
      maxHeights[index] === baseMaxHeight ? maxMaxHeight : baseMaxHeight;
    setMaxHeights(newMaxHeights);
  };

  const whiteboardClick = useCallback(
    (whiteboard: WhiteboardIndex) => {
      router.push("/whiteboard/" + whiteboard.id);
    },
    [router]
  );

  const handleMouseEnter = (whiteboardId: number) => {
    setIsHovering(whiteboardId);
  };

  const handleMouseLeave = () => {
    setIsHovering(null);
  };

  function onSettings(whiteboard: WhiteboardIndex): void {
    router.push("/whiteboard/" + whiteboard.id + "/settings");
  }

  return (
    <div
      className="whiteboard-card"
      style={{
        padding: padding.current + "px",
        maxHeight: maxHeights[index],
      }}
      onMouseEnter={() => handleMouseEnter(whiteboard.id)}
      onMouseLeave={() => handleMouseLeave()}
      onClick={(e) => {
        handleDivClick(index);
      }}>
      <div
        style={{
          marginBottom: "15px",
          fontSize: "15px",
          display: "grid",
          // gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
          gridAutoColumns: "minmax(0, 1fr)",
        }}>
        <div
          style={{
            gridRow: 1,
            gridColumn: 1,
            display: "flex",
            alignItems: "center",
          }}>
          <div>{whiteboard.name}</div>
          {whiteboard.curated && (
            <div
              style={{
                marginLeft: "5px",
              }}>
              <VerifiedIcon
                style={{
                  fontSize: "17px",
                }}
                color="primary"
              />
            </div>
          )}
        </div>
        <div
          style={{
            color: "gray",
            fontSize: "10px",
            gridRow: 2,
            gridColumn: 1,
          }}>
          <div
            title={whiteboard.authorVaultId}
            style={{
              width: "fit-content",
            }}>
            {whiteboard.authorVaultId !== vaultId
              ? "from: " + whiteboard.authorVaultId.substring(0, 7) + "..."
              : "from: You"}
          </div>
        </div>
        <div
          style={{
            color: "gray",
            fontSize: "10px",
            gridRow: 2,
            gridColumn: "2 / 6",
            display: "flex",
            justifySelf: "start",
          }}>
          <div
            title={whiteboard.authorVaultId}
            style={{
              width: "fit-content",
            }}>
            {whiteboard.messagesCount + " messages"}
          </div>
        </div>
        <div
          style={{
            gridRow: "1 / 3",
            gridColumn: "6",
            justifySelf: "end",
            display: "flex",
          }}>
          {vaultId == whiteboard.authorVaultId && (
            <Tooltip title="Settings">
              <button
                style={{
                  marginLeft: "10px",
                  padding: "5px",
                  cursor: "pointer",
                  borderRadius: "10px",
                  border: "none",

                  height: baseMaxHeight - 2 * padding.current + "px",
                  width: baseMaxHeight - 2 * padding.current + "px",

                  background: !settingsMouseOver
                    ? "linear-gradient(145deg, #ffffff, #e6e6e6)"
                    : "linear-gradient(145deg, #e6e6e6, #ffffff)",
                  boxShadow: !settingsMouseOver
                    ? "10px 10px 20px #cdcdcd, -10px -10px 20px #cdcdcd"
                    : "10px 10px 20px #cdcdcd, -10px -10px 20px #cdcdcd",
                }}
                onMouseOver={() => {
                  setSettingsMouseOver(true);
                }}
                onMouseLeave={() => {
                  setSettingsMouseOver(false);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSettings(whiteboard);
                }}>
                <SettingsIcon
                  style={{
                    fontSize: "30px",
                  }}
                />
              </button>
            </Tooltip>
          )}
          <Tooltip title="Enter">
            <button
              style={{
                marginLeft: "10px",
                padding: "5px",
                cursor: "pointer",
                borderRadius: "10px",
                border: "none",

                height: baseMaxHeight - 2 * padding.current + "px",
                width: baseMaxHeight - 2 * padding.current + "px",

                background: !loginMouseOver
                  ? "linear-gradient(145deg, #65d887, #55b671)"
                  : "linear-gradient(145deg, #55b671, #65d887)",
                boxShadow: !loginMouseOver
                  ? "10px 10px 20px #cdcdcd, -10px -10px 20px #cdcdcd"
                  : "10px 10px 20px #cdcdcd, -10px -10px 20px #cdcdcd",
              }}
              onMouseOver={() => {
                setLoginMouseOver(true);
              }}
              onMouseLeave={() => {
                setLoginMouseOver(false);
              }}
              onClick={(e) => {
                e.stopPropagation();
                whiteboardClick(whiteboard);
              }}>
              <LoginIcon
                style={{
                  fontSize: "30px",
                }}
              />
            </button>
          </Tooltip>
        </div>
      </div>
      <div
        style={{
          color: "gray",
          fontSize: "12px",
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
  );
};

export default WhiteboardCard;
