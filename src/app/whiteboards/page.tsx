"use client";

import "./page.css";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header/header";
import {
  User,
  Whiteboard,
  WhiteboardIndex,
  whiteboardWithMessageCount,
} from "@/types/whiteboard-types";
import Loading from "@/components/loading-modal/loading-modal";
import {
  MAX_WHITEBOARD_PER_USER,
  greenColor,
  greenColorDisabled,
} from "@/configs/configs";
import AddIcon from "@mui/icons-material/Add";
import WhiteboardCard from "@/components/whiteboard-card/whiteboard-card";
import { Tooltip } from "@mui/material";
import ErrorModal from "@/components/error-modal/error-modal";
import axios from "axios";
import Button from "@/components/button/button";

export default function Home() {
  const router = useRouter();

  const [whiteboards, setWhiteboards] = useState<WhiteboardIndex[]>([]);

  const [isFetchingWhiteboards, setIsFetchingWhiteboards] =
    useState<boolean>(false);
  const [user, setUser] = useState<User | null>();

  // icon size 30px =so> button 40px =so> div 60px (because padding 10px)
  const baseMaxHeight = 60;
  const maxMaxHeight = 200;

  const [maxHeights, setMaxHeights] = useState<Array<number>>([]);

  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (whiteboards.length == 0) return;
    setMaxHeights(Array(whiteboards.length).fill(baseMaxHeight));
  }, [whiteboards]);

  useEffect(() => {
    async function getWhiteboards() {
      setIsFetchingWhiteboards(true);
      const whiteboards = await fetchWhiteboards();
      if (!whiteboards) return;
      const whiteboardsWithResolvedGroupIds: WhiteboardIndex[] =
        await convertWhiteboardIdsToNames(whiteboards);
      if (!whiteboardsWithResolvedGroupIds) return;
      const whiteboardsSorted = await sortWhiteboards(
        whiteboardsWithResolvedGroupIds
      );

      setWhiteboards(whiteboardsSorted);
      setIsFetchingWhiteboards(false);
    }

    const fetchWhiteboards = async () => {
      let response;
      try {
        response = await axios.get("/api/whiteboard", {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error: any) {
        console.error("API request error:", error);
        const defaultErrorMessage =
          "An error occured while fetching whiteboards";
        const errorMessage = error.response.data.error
          ? `${defaultErrorMessage}: ${error.response.data.error}`
          : defaultErrorMessage;
        setErrorMessage(errorMessage);
        return null;
      }
      const whiteboards: whiteboardWithMessageCount[] = await response.data;
      return whiteboards;
    };

    async function convertWhiteboardIdsToNames(
      whiteboards: whiteboardWithMessageCount[]
    ) {
      const whiteboardsWithResolvedGroupIds: WhiteboardIndex[] =
        await Promise.all(
          whiteboards.map(async (whiteboard: whiteboardWithMessageCount) => {
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
              appId: whiteboard.appId,
              authorVaultId: whiteboard.authorVaultId,
              curated: whiteboard.curated,
              groupNames: resolvedGroupNames,
              messagesCount: whiteboard.messagesCount,
            };
          })
        );
      return whiteboardsWithResolvedGroupIds;
    }

    async function sortWhiteboards(
      whiteboardsWithResolvedGroupIds: WhiteboardIndex[]
    ) {
      console.log(
        "whiteboardsWithResolvedGroupIds:",
        whiteboardsWithResolvedGroupIds
      );
      // sort by curated and then by creation date (oldest first) and then by name
      whiteboardsWithResolvedGroupIds.sort((a, b) => {
        if (a.curated && !b.curated) {
          return -1;
        } else if (!a.curated && b.curated) {
          return 1;
        } else {
          if (a.messagesCount > b.messagesCount) {
            return -1;
          } else if (a.messagesCount < b.messagesCount) {
            return 1;
          } else {
            if (a.id < b.id) {
              return -1;
            } else if (a.id > b.id) {
              return 1;
            } else {
              return 0;
            }
          }
        }
      });
      return whiteboardsWithResolvedGroupIds;
    }

    const resolveGroupId = async (groupId: string): Promise<string> => {
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
        return groupSnapshots.items[0].name;
      } catch (error) {
        console.error(error);
        return "";
      }
    };

    getWhiteboards();
  }, []);

  const onChangeUser = useCallback((user: User | null) => {
    setUser(user);
  }, []);

  return (
    <div
      className="container"
      style={{
        width: "100%",
      }}>
      <Header onChangeUser={onChangeUser} />
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
            {(!user ||
              user.createdWhiteboards.length >= MAX_WHITEBOARD_PER_USER) && (
              <Tooltip
                title={
                  !user
                    ? "Sign in to create a whiteboard"
                    : "You have already created " +
                      MAX_WHITEBOARD_PER_USER +
                      " whiteboards"
                }>
                <span>
                  <Button
                    type="create"
                    title="Create"
                    onClick={() => {
                      router.push("/create-whiteboard");
                    }}
                    fontSize="20px"
                    disabled={true}
                    style={{
                      backgroundColor: greenColorDisabled,
                      cursor: "default",
                      filter: "brightness(1.1)",
                    }}></Button>
                </span>
              </Tooltip>
            )}
            {user &&
              user.createdWhiteboards.length < MAX_WHITEBOARD_PER_USER && (
                <Button
                  type="create"
                  title="Create"
                  onClick={() => {
                    router.push("/create-whiteboard");
                  }}
                  iconSize="30px"
                  fontSize="20px"></Button>
              )}
          </div>
        </div>
      </div>
      <div
        style={{
          padding: "20px",
          maxHeight: "700px",
          overflow: "auto",
        }}>
        {!isFetchingWhiteboards &&
          whiteboards.map((whiteboard: WhiteboardIndex, index) => (
            <WhiteboardCard
              key={whiteboard.id}
              vaultId={user?.vaultId ?? ""}
              whiteboard={whiteboard}
              index={index}
              maxHeightsList={maxHeights}
              baseMaxHeight={baseMaxHeight}
              maxMaxHeight={maxMaxHeight}
            />
          ))}
      </div>
      {!errorMessage && whiteboards.length == 0 && isFetchingWhiteboards && (
        <Loading text="Loading whiteboards..." />
      )}
      {errorMessage && <ErrorModal text={errorMessage} />}
    </div>
  );
}
