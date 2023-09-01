"use client";
import React, { useCallback, useEffect, useState } from "react";
import "./whiteboards-index.css";
import { useRouter } from "next/navigation";
import Title from "../title/title";
import Header from "../header/header";
import { Whiteboard } from "@/app/types/whiteboard-types";
import Loading from "../loading-modal/loading-modal";
import { CircularProgress } from "@mui/material";

const WhiteboardsIndex = () => {
  const router = useRouter();

  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [isFetchingWhiteboards, setIsFetchingWhiteboards] =
    useState<boolean>(false);

  const redirectToRoot = useCallback(() => {
    router.push("/");
  }, [router]);

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

  return (
    <div className="container">
      <Header signInButton={false} />
      <div className="whiteboards_container">
        {!isFetchingWhiteboards && (
          <div className="whiteboards_list">
            <h1> Whiteboards </h1>
            {whiteboards.map((whiteboard: Whiteboard) => (
              <div
                style={{
                  color: "black",
                  backgroundColor: "lightgrey",
                  padding: "10px",
                  borderRadius: "10px",
                  margin: "10px",
                  cursor: "pointer",
                  flex: "1",
                }}
                key={whiteboard.id}
                onClick={() => whiteboardClick(whiteboard)}>
                {whiteboard.name}
              </div>
            ))}
          </div>
        )}
        {/* <div
          style={{
            flex: "1",
          }}>
          {!isFetchingWhiteboards && (
            <CircularProgress
              className="login"
              color="secondary"
              style={{
                backgroundColor: "lightgrey",
              }}
            />
          )}
        </div> */}
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
