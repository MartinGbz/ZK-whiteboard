"use client";
import React, { CSSProperties, useCallback, useEffect, useState } from "react";
import "./whiteboards-index.css";
import { useRouter } from "next/navigation";
import Header from "../header/header";
import { Whiteboard } from "@/app/types/whiteboard-types";
import Loading from "../loading-modal/loading-modal";
import { CircularProgress } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

const WhiteboardsIndex = () => {
  const router = useRouter();

  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [isFetchingWhiteboards, setIsFetchingWhiteboards] =
    useState<boolean>(false);
  const [vaultId, setVaultId] = useState<string | null>(null);

  const [isHovering, setIsHovering] = useState<number | null>(null);

  useEffect(() => {
    const fetchWhiteboards = async () => {
      setIsFetchingWhiteboards(true);
      try {
        const response = await fetch("/api/whiteboards", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-cache",
        });
        const whiteboards = await response.json();
        setWhiteboards(whiteboards);
      } catch (error) {
        console.error(error);
      }
      setIsFetchingWhiteboards(false);
    };

    fetchWhiteboards();
  }, []);

  const whiteboardClick = (whiteboard: Whiteboard) => {
    router.push("/whiteboard/" + whiteboard.id);
  };

  const handleMouseEnter = (whiteboardId: number) => {
    setIsHovering(whiteboardId);
  };

  const handleMouseLeave = () => {
    setIsHovering(null);
  };

  function onSettings(whiteboard: Whiteboard): void {
    router.push("/whiteboard/" + whiteboard.id + "/settings");
  }

  return (
    <div className="container">
      <Header
        currentRoute="/"
        onChangeVaultId={(vaultId) => setVaultId(vaultId)}
      />
      <div className="whiteboards_container">
        {!isFetchingWhiteboards && (
          <div className="whiteboards_list">
            <h1> Whiteboards </h1>
            {whiteboards.map((whiteboard: Whiteboard) => (
              <div
                key={whiteboard.id}
                onMouseEnter={() => handleMouseEnter(whiteboard.id)}
                onMouseLeave={() => handleMouseLeave()}
                style={{
                  position: "relative",
                  color: "black",
                  backgroundColor: "lightgrey",
                  padding: "10px",
                  borderRadius: "10px",
                  margin: "10px",
                  cursor: "pointer",
                  flex: "1",
                }}>
                <div style={{}} onClick={() => whiteboardClick(whiteboard)}>
                  {whiteboard.name}
                </div>
                {vaultId === whiteboard.authorVaultId && (
                  <button
                    className="delete-button"
                    style={{
                      // backgroundColor: "#7181E5",
                      backgroundColor: "black",
                      borderRadius: "50%",
                      textAlign: "center",
                      position: "absolute",

                      top: "-10px",
                      right: "-10px",
                      transition:
                        "opacity 0.2s, transform 0.2s, translate 0.2s",
                      opacity: isHovering == whiteboard.id ? "1" : "0",
                      transform:
                        isHovering == whiteboard.id ? "scale(1.1)" : "scale(1)",
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
            ))}
          </div>
        )}
        <div className="create_whiteboard">
          <h1> Create </h1>
          <button
            className="whiteboards_create_button"
            style={{
              color: "black",
              backgroundColor: "lightgreen",
              padding: "10px",
              borderRadius: "10px",
              margin: "10px",
              marginTop: "0px",
              cursor: "pointer",
              flex: "1",
            }}>
            Create +
          </button>
        </div>
      </div>
      {isFetchingWhiteboards && !whiteboards && (
        <Loading text="Loading whiteboards..." />
      )}
    </div>
  );
};

export default WhiteboardsIndex;
