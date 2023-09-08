"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./whiteboard.css";
import {
  Position,
  SignedMessage,
  MessageOperationType,
  Whiteboard,
} from "../../types/whiteboard-types";

import {
  AuthType,
  SismoConnect,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import {
  MAX_Z_INDEX,
  defaultInputColor,
  sismoConnectConfig,
} from "../../configs/configs";
import MessageModal from "../message-modal/message-modal";
import Message from "../message/message";
import { useRouter } from "next/navigation";
import Loading from "../loading-modal/loading-modal";
import Header from "../header/header";
import { Message as MessageType } from "@prisma/client";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopyOutlined";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import ShareIcon from "@mui/icons-material/Share";
import Image from "next/image";
import xTwitterIcon from "../../medias/icons/x-twitter.svg";
import lensIcon from "../../medias/icons/lens-icon-T-Green.svg";
import farcasterIcon from "../../medias/icons/farcaster-icon.png";
import Link from "next/link";

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

const API_BASE_URL = "/api/message";
const API_ENDPOINTS = {
  POST: "/post",
  DELETE: "/delete",
};

interface WhiteboardProps {
  whiteboardId: number;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ whiteboardId }) => {
  const [whiteboard, setWhiteboard] = useState<Whiteboard>();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageInputValue, setMessageInputValue] = useState("");
  const [messageInputColorValue, setMessageInputColorValue] =
    useState(defaultInputColor);
  const [messagePosition, setMessagePosition] = useState<Position>({
    x: 0,
    y: 0,
  });
  const [vaultId, setVaultId] = useState<string | null>(null);
  const [sismoConnectResponseMessage, setSismoConnectResponseMessage] =
    useState<SismoConnectResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isUserMessageExists, setIsUserMessageExists] =
    useState<boolean>(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState<boolean>(false);

  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messageModalRef = useRef<HTMLDivElement>(null);

  const [currentURL, setCurrentURL] = useState("");

  const router = useRouter();

  const redirectToRoot = useCallback(() => {
    router.push("/whiteboard/" + whiteboardId);
  }, [router, whiteboardId]);

  useEffect(() => {
    setCurrentURL(`${window.location.origin}/whiteboard/${whiteboardId}`);
  }, [whiteboardId]);

  useEffect(() => {
    const constructUrlFromMessage = (message: SismoConnectResponse) => {
      let url = API_BASE_URL;
      const signedMessage = message.signedMessage
        ? (JSON.parse(message.signedMessage) as SignedMessage)
        : null;

      if (signedMessage?.type === MessageOperationType.POST) {
        url += API_ENDPOINTS.POST;
      } else if (signedMessage?.type === MessageOperationType.DELETE) {
        url += API_ENDPOINTS.DELETE;
      }

      return url;
    };

    const performApiRequest = async (
      url: string,
      message: SismoConnectResponse
    ) => {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(message),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.json() as Promise<MessageType[]>;
    };

    const handleApiResponse = async (apiResponse: MessageType[]) => {
      setMessageInputValue("");
      setMessageInputColorValue(defaultInputColor);
      setIsModalOpen(false);
      setMessages(apiResponse);
    };

    const postMessage = async (message: SismoConnectResponse) => {
      setIsVerifying(true);

      const url = constructUrlFromMessage(message);

      try {
        const allMessageFromDB: MessageType[] = await performApiRequest(
          url,
          message
        );
        handleApiResponse(allMessageFromDB);
      } catch (error) {
        console.error("API request error:", error);
      }

      setIsVerifying(false);
      redirectToRoot();
    };
    if (sismoConnectResponseMessage?.signedMessage) {
      postMessage(sismoConnectResponseMessage);
    }
  }, [redirectToRoot, sismoConnectResponseMessage]);

  useEffect(() => {
    const isUserMessageExists = messages.some(
      (message: MessageType) => message.authorVaultId === vaultId
    );
    setIsUserMessageExists(isUserMessageExists);
  }, [messages, vaultId]);

  useEffect(() => {
    if (isModalOpen && messageInputRef.current) {
      messageInputRef.current.focus();
    }
    if (isModalOpen && messageModalRef.current && messagePosition) {
      messageModalRef.current.style.top = `${messagePosition.y}px`;
      messageModalRef.current.style.left = `${messagePosition.x}px`;
    }
  }, [isModalOpen, messagePosition]);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsFetchingMessages(true);
      try {
        const response = await fetch("/api/whiteboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(whiteboardId),
          cache: "no-cache",
        });

        const whiteboard: Whiteboard = await response.json();
        setWhiteboard(whiteboard);
        if (whiteboard.messages) {
          setMessages(whiteboard.messages);
        }
      } catch (error) {
        console.error(error);
      }
      setIsFetchingMessages(false);
    };

    fetchMessages();
  }, [whiteboardId]);

  const requestAddMessage = async () => {
    const sismoConnectSignedMessage: SignedMessage = {
      type: MessageOperationType.POST,
      message: {
        text: messageInputValue,
        positionX: messagePosition.x,
        positionY: messagePosition.y,
        color: messageInputColorValue.substring(1),
        whiteboardId: whiteboardId,
      },
    };
    const claims = whiteboard?.groupIds?.map((groupId) => ({
      groupId: groupId,
    }));
    sismoConnect.request({
      namespace: "main",
      auth: { authType: AuthType.VAULT },
      claims: claims,
      signature: {
        message: JSON.stringify(sismoConnectSignedMessage),
      },
    });
  };

  const requestDeleteMessage = async (message: MessageType) => {
    const sismoConnectSignedMessage: SignedMessage = {
      type: MessageOperationType.DELETE,
      message: {
        text: message.text,
        positionX: message.positionX,
        positionY: message.positionY,
        color: message.color,
        whiteboardId: whiteboardId,
      },
    };
    sismoConnect.request({
      namespace: "main",
      auth: { authType: AuthType.VAULT },
      signature: {
        message: JSON.stringify(sismoConnectSignedMessage),
      },
    });
  };

  useEffect(() => {
    const responseMessage: SismoConnectResponse | null =
      sismoConnect.getResponse();
    if (responseMessage) {
      const fetchData = async () => {
        if (responseMessage.signedMessage) {
          setSismoConnectResponseMessage(responseMessage);
        }
      };
      fetchData();
    }
  }, []);

  const startMessageCreation = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const containerRect = event.currentTarget.getBoundingClientRect();
    const initialPosition = {
      x: event.clientX - containerRect.left,
      y: event.clientY - containerRect.top,
    };
    setMessagePosition(initialPosition);
    setIsModalOpen(true);
  };

  const actions = [
    {
      icon: (
        <a
          target="_blank"
          href={
            "http://twitter.com/intent/tweet?text=Access%20this%20whiteboard%2C%20and%20post%20your%20message%20anonymously%21%20%F0%9F%8E%AD%0A%E2%9E%A1%EF%B8%8F%20" +
            currentURL +
            "%0A%0Aby.%20%400xMartinGbz"
          }>
          <Image
            src={xTwitterIcon}
            alt={""}
            style={{
              padding: "7px",
            }}
          />
        </a>
        // </Link>
      ),
      name: "X",
    },
    {
      icon: (
        <a
          target="_blank"
          href={
            "https://lenster.xyz/?text=Access%20this%20whiteboard%2C%20and%20post%20your%20message%20anonymously%21%20%F0%9F%8E%AD%0A%E2%9E%A1%EF%B8%8F%20" +
            currentURL +
            "%0A%0Aby.%20%40martingbz.lens"
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
            "https://warpcast.com/~/compose?text=Access%20this%20whiteboard%2C%20and%20post%20your%20message%20anonymously%21%20%F0%9F%8E%AD%0A%E2%9E%A1%EF%B8%8F%20" +
            currentURL +
            "%0A%0Aby.%20%40martingbz"
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
    <div className="whiteboard">
      <Header
        currentRoute={"/whiteboard/" + whiteboardId}
        onChangeVaultId={(vaultId) => setVaultId(vaultId)}
        whiteboardName={whiteboard?.name}
      />
      {messages && (
        <div
          className="messages_container"
          style={{
            cursor: isUserMessageExists || !vaultId ? "default" : "pointer",
            position: "relative",
          }}
          onClick={(e) =>
            !isUserMessageExists && vaultId && startMessageCreation(e)
          }>
          {messages.map((message: MessageType) => (
            <Message
              key={message.authorVaultId}
              message={message}
              vaultId={vaultId}
              onDelete={(message) => requestDeleteMessage(message)}
            />
          ))}
          {isVerifying && <Loading text="Checking the proof..." />}
        </div>
      )}
      {isFetchingMessages && messages.length == 0 && (
        <Loading text="Loading messages..." />
      )}
      <MessageModal
        modalRef={messageModalRef}
        style={{
          position: "absolute",
          zIndex: MAX_Z_INDEX + 2,
          display: isModalOpen ? "flex" : "none",
        }}
        initialPositionX={messagePosition?.x}
        initialPositionY={messagePosition?.y}
        inputValue={messageInputValue}
        inputColorValue={messageInputColorValue}
        onChange={(e) => setMessageInputValue(e.target.value)}
        onColorChange={(e) => setMessageInputColorValue(e.target.value)}
        inputRef={messageInputRef}
        onClickCancel={() => setIsModalOpen(false)}
        onClickSave={() => requestAddMessage()}
      />
      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
        }}
        FabProps={{
          sx: {
            color: "black",
            bgcolor: "white",
            "&:hover": {
              color: "white",
              bgcolor: "black",
            },
          },
        }}
        icon={<ShareIcon />}>
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onclick}
          />
        ))}
      </SpeedDial>
    </div>
  );
};

export default Whiteboard;
