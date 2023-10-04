"use client";
import React, { useEffect, useState } from "react";
import {
  creatorFarcasterName,
  creatorLensName,
  creatorXName,
  preWrittenPostFarcasterSlug,
  preWrittenPostLensSlug,
  preWrittenPostXSlug,
} from "../../configs/configs";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopyOutlined";
import ShareIcon from "@mui/icons-material/Share";
import Image from "next/image";
import xTwitterIcon from "../../medias/icons/x-twitter.svg";
import lensIcon from "../../medias/icons/lens-icon-T-Green.svg";
import farcasterIcon from "../../medias/icons/farcaster-icon.png";
import "./share-whiteboard.css";

interface ShareWhiteboard {
  currentURL: string;
  whiteboardName: string;
  isAuthor: boolean;
}

const ShareWhiteboard: React.FC<ShareWhiteboard> = ({
  currentURL,
  whiteboardName,
  isAuthor,
}) => {
  const [shareMessageAuthor, setShareMessageAuthor] = useState("");
  const [shareMessageDefault, setShareMessageDefault] = useState("");
  const [isHovering, setIsHovering] = useState<boolean>(false);

  useEffect(() => {
    setShareMessageDefault(
      "Access%20the%20%22" +
        whiteboardName +
        "%22%20whiteboard%2C%20and%20post%20your%20message%20anonymously%21%20%F0%9F%8E%AD%0A%E2%9E%A1%EF%B8%8F%20" +
        currentURL +
        "%0A%0Aby.%20%40"
    );
    setShareMessageAuthor(
      "I%27ve%20created%20the%20%22" +
        whiteboardName +
        "%22%20whiteboard%21%0AAccess%20it%20and%20post%20your%20message%20anonymously%20%F0%9F%8E%AD%0A%E2%9E%A1%EF%B8%8F%20" +
        currentURL +
        "%0A%0Aby.%20%40"
    );
  }, [currentURL, whiteboardName]);

  const actions = [
    {
      icon: (
        <a
          target="_blank"
          href={
            isAuthor
              ? preWrittenPostXSlug + shareMessageAuthor + creatorXName
              : preWrittenPostXSlug + shareMessageDefault + creatorXName
          }>
          <Image
            src={xTwitterIcon}
            alt={""}
            style={{
              padding: "7px",
            }}
          />
        </a>
      ),
      name: "X",
    },
    {
      icon: (
        <a
          target="_blank"
          href={
            isAuthor
              ? preWrittenPostLensSlug + shareMessageAuthor + creatorLensName
              : preWrittenPostLensSlug + shareMessageDefault + creatorLensName
          }>
          <Image src={lensIcon} alt={""} />
        </a>
      ),
      name: "Lens",
    },
    {
      icon: (
        <a
          target="_blank"
          href={
            isAuthor
              ? preWrittenPostFarcasterSlug +
                shareMessageAuthor +
                creatorFarcasterName
              : preWrittenPostFarcasterSlug +
                shareMessageDefault +
                creatorFarcasterName
          }>
          <Image
            src={farcasterIcon}
            alt={""}
            style={{
              padding: "7px",
            }}
          />
        </a>
      ),
      name: "Farcaster",
    },
    {
      icon: <FileCopyIcon sx={{ color: "black", padding: "3px" }} />,
      name: "Copy link",
      onclick: () => {
        navigator.clipboard.writeText(currentURL);
      },
    },
  ];

  return (
    <SpeedDial
      ariaLabel="SpeedDial basic example"
      sx={{
        position: "absolute",
        bottom: 16,
        right: 16,
      }}
      FabProps={{
        sx: {
          color: "white",
          bgcolor: "black",
          "&:hover": {
            color: "black",
            bgcolor: "white",
          },
        },
      }}
      icon={<ShareIcon />}
      onMouseOver={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      open={isHovering}>
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={action.onclick}
        />
      ))}
    </SpeedDial>
  );
};

export default ShareWhiteboard;
