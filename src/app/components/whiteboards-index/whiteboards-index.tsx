"use client";
import React, { useEffect, useState } from "react";
import "./whiteboards-index.css";
import { useRouter } from "next/navigation";
import Header from "../header/header";
import { Whiteboard, WhiteboardIndex } from "@/app/types/whiteboard-types";
import Loading from "../loading-modal/loading-modal";
import { greenColor } from "@/app/configs/configs";
import AddIcon from "@mui/icons-material/Add";
import WhiteboardCard from "../whiteboard-card/whiteboard-card";

const WhiteboardsIndex = () => {
  const router = useRouter();

  const [whiteboards, setWhiteboards] = useState<WhiteboardIndex[]>([]);

  const [isFetchingWhiteboards, setIsFetchingWhiteboards] =
    useState<boolean>(false);
  const [isResolveGroupId, setIsResolveGroupId] = useState<boolean>(false);
  const [vaultId, setVaultId] = useState<string | null>(null);

  // icon size 30px =so> button 40px =so> div 60px (because padding 10px)
  const baseMaxHeight = 60;
  const maxMaxHeight = 200;

  const [maxHeights, setMaxHeights] = useState<Array<number>>([]);

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
              <WhiteboardCard
                key={whiteboard.id}
                vaultId={vaultId}
                whiteboard={whiteboard}
                index={index}
                maxHeightsList={maxHeights}
                baseMaxHeight={baseMaxHeight}
                maxMaxHeight={maxMaxHeight}
              />
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
