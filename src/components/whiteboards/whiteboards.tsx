"use client";

import "./whiteboards.css";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header/header";
import {
  User,
  WhiteboardIndex,
  whiteboardWithMessageCount,
} from "@/types/whiteboard-types";
import Loading from "@/components/loading-modal/loading-modal";
import { MAX_WHITEBOARD_PER_USER, greenColorDisabled } from "@/configs/configs";
import WhiteboardCard from "@/components/whiteboard-card/whiteboard-card";
import { Tooltip } from "@mui/material";
import ErrorModal from "@/components/error-modal/error-modal";
import axios from "axios";
import Button from "@/components/button/button";
import { useLoginContext } from "@/context/login-context";
import { getWhiteboards } from "@/utils/get-whiteboards";

type WhiteboardsProps = {
  whiteboards: WhiteboardIndex[];
};

export const Whiteboards = ({ whiteboards }: WhiteboardsProps) => {
  const router = useRouter();

  // const [whiteboards, setWhiteboards] = useState<WhiteboardIndex[]>([]);

  // const [isFetchingWhiteboards, setIsFetchingWhiteboards] =
  //   useState<boolean>(false);

  // icon size 30px =so> button 40px =so> div 60px (because padding 10px)
  const baseMaxHeight = 60;
  const maxMaxHeight = 200;

  const maxHeights = Array(whiteboards.length).fill(baseMaxHeight);

  // const [errorMessage, setErrorMessage] = useState<string>("");

  const { user } = useLoginContext();

  return (
    <div className="whiteboards-container">
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
          {user && user.createdWhiteboards.length < MAX_WHITEBOARD_PER_USER && (
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
      <div
        style={{
          padding: "20px",
          maxHeight: "700px",
          overflow: "auto",
        }}>
        {/* {!isFetchingWhiteboards &&
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
          ))} */}
        {whiteboards.map((whiteboard: WhiteboardIndex, index) => (
          <WhiteboardCard
            key={whiteboard.id}
            vaultId={user?.vaultId ?? ""}
            whiteboard={whiteboard}
            index={index}
            baseMaxHeight={baseMaxHeight}
            maxMaxHeight={maxMaxHeight}
          />
        ))}
      </div>
      {/* {!errorMessage && whiteboards.length == 0 && isFetchingWhiteboards && (
        <Loading text="Loading whiteboards..." />
      )} */}
      {/* {errorMessage && <ErrorModal errorMessage={errorMessage} />} */}
    </div>
  );
};
