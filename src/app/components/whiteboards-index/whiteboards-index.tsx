"use client";
import React, { useEffect, useState } from "react";
import "./whiteboards-index.css";
import { useRouter } from "next/navigation";
import Header from "../header/header";
import { Whiteboard, WhiteboardIndex } from "@/app/types/whiteboard-types";
import Loading from "../loading-modal/loading-modal";
import {
  Button,
  CircularProgress,
  MenuItem,
  menuItemClasses,
  styled,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { greenColor } from "@/app/configs/configs";
import AddIcon from "@mui/icons-material/Add";
import VerifiedIcon from "@mui/icons-material/Verified";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ShareIcon from "@mui/icons-material/Share";

import { Dropdown } from "@mui/base/Dropdown";
import { Menu } from "@mui/base/Menu";
import { blue, grey } from "@mui/material/colors";
import { MenuButton } from "@mui/base/MenuButton";
// import { MenuItem, menuItemClasses } from "@mui/base/MenuItem";

const WhiteboardsIndex = () => {
  const router = useRouter();

  const [whiteboards, setWhiteboards] = useState<WhiteboardIndex[]>([]);

  const [isFetchingWhiteboards, setIsFetchingWhiteboards] =
    useState<boolean>(false);
  const [isResolveGroupId, setIsResolveGroupId] = useState<boolean>(false);
  const [vaultId, setVaultId] = useState<string | null>(null);

  const [isHovering, setIsHovering] = useState<number | null>(null);

  // icon size 30px =so> button 40px =so> div 60px (because padding 10px)
  const baseMaxHeight = 60;
  const maxMaxHeight = 200;
  // const [maxHeight, setMaxHeight] = useState(baseMaxHeight);

  const [maxHeights, setMaxHeights] = useState<Array<number>>([]);

  const handleDivClick = (index: number) => {
    const newMaxHeights = [...maxHeights];
    newMaxHeights[index] =
      maxHeights[index] === baseMaxHeight ? maxMaxHeight : baseMaxHeight;
    setMaxHeights(newMaxHeights);
    console.log(maxHeights);
  };

  useEffect(() => {
    setMaxHeights(Array(whiteboards.length).fill(baseMaxHeight));
  }, [whiteboards]);

  useEffect(() => {
    const fetchWhiteboards = async () => {
      setIsFetchingWhiteboards(true);
      try {
        const response = await fetch("/api/whiteboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-cache",
        });
        const whiteboards: Whiteboard[] = await response.json();

        const whiteboardsWithResolvedGroupIds: WhiteboardIndex[] =
          await Promise.all(
            whiteboards.map(async (whiteboard: Whiteboard) => {
              const resolvedGroupNames = await Promise.all(
                whiteboard.groupIds.map(async (groupId: string) => {
                  const groupName = await resolveGroupId(groupId);
                  return groupName;
                })
              );
              return {
                id: whiteboard.id,
                name: whiteboard.name,
                description: whiteboard.description,
                authorVaultId: whiteboard.authorVaultId,
                curated: whiteboard.curated,
                groupNames: resolvedGroupNames,
              };
            })
          );
        setWhiteboards(whiteboardsWithResolvedGroupIds);
      } catch (error) {
        console.error(error);
      }
      setIsFetchingWhiteboards(false);
    };

    const resolveGroupId = async (groupId: string): Promise<string> => {
      setIsResolveGroupId(true);
      try {
        const response = await fetch(
          "https://hub.sismo.io/group-snapshots/" + groupId,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-cache",
          }
        );
        const groupSnapshots = await response.json();
        setIsResolveGroupId(false);
        return groupSnapshots.items[0].name;
      } catch (error) {
        console.error(error);
        setIsResolveGroupId(false);
        return "";
      }
    };

    fetchWhiteboards();
  }, []);

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

  const copyWhiteboardUrlToClipboard = (whiteboard: WhiteboardIndex) => {
    const whiteboardUrl = `${window.location.origin}/whiteboard/${whiteboard.id}`;

    navigator.clipboard.writeText(whiteboardUrl);

    // // Create a temporary input element to copy the URL to the clipboard
    // const tempInput = document.createElement("input");
    // tempInput.value = whiteboardUrl;
    // document.body.appendChild(tempInput);
    // tempInput.select();
    // document.execCommand("copy");
    // document.body.removeChild(tempInput);

    // Optionally, provide some user feedback that the URL has been copied
    // alert("Whiteboard URL copied to clipboard: " + whiteboardUrl);
  };

  return (
    <div className="container">
      <Header
        currentRoute="/"
        onChangeVaultId={(vaultId) => setVaultId(vaultId)}
      />
      <div className="whiteboards_container">
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "20px 20px 0px 20px",
          }}>
          <h1 className="title"> Whiteboards </h1>
          <div className="create_whiteboard">
            <button
              className="whiteboards_create_button"
              style={{
                color: "black",
                backgroundColor: greenColor,
                padding: "10px",
                borderRadius: "10px",
                cursor: "pointer",
                boxShadow: "rgba(0, 0, 0, 0.25) 0px 1px 2px",
              }}
              onClick={() => {
                router.push("/create-whiteboard");
              }}>
              <AddIcon />
              <span> Create </span>
            </button>
          </div>
        </div>
      </div>
      <div className="whiteboards_list">
        <div
          style={{
            paddingTop: "20px",
            paddingRight: "20px",
            maxHeight: "700px",
            overflow: "auto",
          }}>
          {!isFetchingWhiteboards &&
            whiteboards.map((whiteboard: WhiteboardIndex, index) => (
              <div
                key={whiteboard.id}
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
                  }}
                  onClick={() => whiteboardClick(whiteboard)}>
                  <div
                    style={{
                      // display: "flex",
                      // justifyContent: "space-between",
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
                        // justifySelf: "flex-end",
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
                        className="button-option"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDivClick(index);
                        }}>
                        {maxHeights[index] === baseMaxHeight && (
                          <ExpandMoreIcon
                            sx={{
                              fontSize: "30px",
                            }}
                          />
                        )}
                        {maxHeights[index] === maxMaxHeight && (
                          <ExpandLessIcon
                            sx={{
                              fontSize: "30px",
                            }}
                          />
                        )}
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
                    {whiteboard.groupNames.map((groupName: string) => (
                      <div key={groupName}> {groupName} </div>
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
      </div>
      {whiteboards.length == 0 && isFetchingWhiteboards && (
        <Loading text="Loading whiteboards..." />
      )}
    </div>
  );
};

export default WhiteboardsIndex;
