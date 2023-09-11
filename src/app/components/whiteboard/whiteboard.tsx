"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./whiteboard.css";
import {
  Position,
  SignedMessage,
  MessageOperationType,
  Whiteboard,
  User,
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
import ShareWhiteboard from "../share-whiteboard/share-whiteboard";

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
  const [user, setUser] = useState<User | null>();
  const [sismoConnectResponseMessage, setSismoConnectResponseMessage] =
    useState<SismoConnectResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isUserMessageExists, setIsUserMessageExists] =
    useState<boolean>(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState<boolean>(false);
  const [isWhiteboardAuthor, setIsWhiteboardAuthor] = useState<boolean>(false);

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
    whiteboard?.authorVaultId === user?.vaultId
      ? setIsWhiteboardAuthor(true)
      : setIsWhiteboardAuthor(false);
  }, [user, whiteboard]);

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
      (message: MessageType) => message.authorVaultId === user?.vaultId
    );
    setIsUserMessageExists(isUserMessageExists);
  }, [messages, user]);

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

  return (
    <div className="whiteboard">
      <Header
        currentRoute={"/whiteboard/" + whiteboardId}
        onChangeUser={(user) => setUser(user)}
        whiteboardName={whiteboard?.name}
      />
      {messages && (
        <div
          className="messages_container"
          style={{
            cursor:
              isUserMessageExists || !user?.vaultId ? "default" : "pointer",
            position: "relative",
          }}
          onClick={(e) =>
            !isUserMessageExists && user?.vaultId && startMessageCreation(e)
          }>
          {messages.map((message: MessageType) => (
            <Message
              key={message.authorVaultId}
              message={message}
              vaultId={user?.vaultId ?? ""}
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
      {whiteboard && (
        <ShareWhiteboard
          currentURL={currentURL}
          isAuthor={isWhiteboardAuthor}
          whiteboardName={whiteboard.name}
        />
      )}
    </div>
  );
};

export default Whiteboard;
