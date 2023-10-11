"use client";

import "../../page.css";
import "./page.css";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Position,
  SignedMessage,
  MessageOperationType,
  Whiteboard,
  User,
  PostDeletionResponse,
} from "../../../types/whiteboard-types";

import {
  AuthType,
  SismoConnect,
  SismoConnectClient,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import {
  CURRENT_APPID_VARNAME,
  MAX_Z_INDEX,
  WHITEBOARD_VAULTID_VARNAME,
  defaultInputColor,
} from "../../../configs/configs";
import MessageModal from "../../../components/message-modal/message-modal";
import Message from "../../../components/message/message";
import { useRouter } from "next/navigation";
import Loading from "../../../components/loading-modal/loading-modal";
import Header from "../../../components/header/header";
import { Message as MessageType } from "@prisma/client";
import ShareWhiteboard from "../../../components/share-whiteboard/share-whiteboard";
import axios from "axios";
import ErrorModal from "@/components/error-modal/error-modal";

let sismoConnect: SismoConnectClient | null = null;

const API_BASE_URL = "/api/message";
const API_ENDPOINTS = {
  POST: "/post",
  DELETE: "/delete",
};

interface pageProps {
  params: { id: number };
}

const Whiteboard = ({ params }: pageProps) => {
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
  const [whiteboardVaultId, setWhiteboardVaultId] = useState<string | null>();

  const [errorMessage, setErrorMessage] = useState<string>("");

  const router = useRouter();

  const redirectToRoot = useCallback(() => {
    router.push("/whiteboard/" + params.id);
  }, [router, params.id]);

  useEffect(() => {
    setCurrentURL(`${window.location.origin}/whiteboard/${params.id}`);
  }, [params.id]);

  useEffect(() => {
    console.log("user", user);
    console.log("whiteboard", whiteboard);
    whiteboard?.authorVaultId === user?.vaultId
      ? setIsWhiteboardAuthor(true)
      : setIsWhiteboardAuthor(false);
    if (whiteboard?.appId) {
      localStorage.setItem(CURRENT_APPID_VARNAME, whiteboard.appId);
      sismoConnect = SismoConnect({
        config: {
          appId: whiteboard.appId,
        },
      });
      console.log("sismoConnect", sismoConnect);
      const responseMessage: SismoConnectResponse | null =
        sismoConnect.getResponse();
      if (responseMessage?.signedMessage) {
        setSismoConnectResponseMessage(responseMessage);
      }
    }
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
      let response;
      try {
        response = await axios.post(url, message, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error: any) {
        console.error("API request error:", error);
        if (error.response.data.error) {
          setErrorMessage(error.response.data.error);
        } else if (message.signedMessage) {
          const signedMessage = JSON.parse(message.signedMessage);
          const type =
            signedMessage.message.type === "POST" ? "posting" : "deleting";
          setErrorMessage(`An error occured while ${type} your message`);
        } else {
          setErrorMessage(
            "An error occured while deleting or posting your message"
          );
        }
        return null;
      }
      console.log("333");
      return response.data as PostDeletionResponse;
    };

    const handleApiResponse = async (messages: MessageType[]) => {
      setMessageInputValue("");
      setMessageInputColorValue(defaultInputColor);
      setIsModalOpen(false);
      setMessages(messages);
    };

    const postMessage = async (message: SismoConnectResponse) => {
      setIsVerifying(true);

      const url = constructUrlFromMessage(message);

      const response = await performApiRequest(url, message);
      if (response) {
        if (!whiteboardVaultId) {
          localStorage.setItem(
            WHITEBOARD_VAULTID_VARNAME + params.id,
            response.vaultId
          );
          setWhiteboardVaultId(response.vaultId);
        }
        handleApiResponse(response.messages);
      }
      setIsVerifying(false);
      redirectToRoot();
    };
    if (sismoConnectResponseMessage?.signedMessage) {
      postMessage(sismoConnectResponseMessage);
    }
  }, [
    redirectToRoot,
    sismoConnectResponseMessage,
    params.id,
    whiteboardVaultId,
  ]);

  useEffect(() => {
    if (messages) {
      const isUserMessageExists = messages.some(
        (message: MessageType) => message.authorVaultId === whiteboardVaultId
      );
      setIsUserMessageExists(isUserMessageExists);
    }
  }, [messages, whiteboardVaultId]);

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
    setWhiteboardVaultId(
      localStorage.getItem(WHITEBOARD_VAULTID_VARNAME + params.id)
    );

    const fetchMessages = async () => {
      setIsFetchingMessages(true);
      try {
        const response = await axios.post("/api/whiteboard", params.id, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const whiteboard: Whiteboard = response.data;
        setWhiteboard(whiteboard);
        if (whiteboard.messages) {
          setMessages(whiteboard.messages);
        }
      } catch (error: any) {
        console.error("API request error:", error);
        if (error.response.data.error) {
          setErrorMessage(error.response.data.error);
        } else {
          setErrorMessage(
            "An error occured while fetching the messages of this whiteboard"
          );
        }
      }
      setIsFetchingMessages(false);
    };

    fetchMessages();
  }, [router, params.id]);

  const requestAddMessage = async () => {
    const sismoConnectSignedMessage: SignedMessage = {
      type: MessageOperationType.POST,
      message: {
        text: messageInputValue,
        positionX: messagePosition.x,
        positionY: messagePosition.y,
        color: messageInputColorValue.substring(1),
        whiteboardId: params.id,
      },
    };
    const claims = whiteboard?.groupIds?.map((groupId) => ({
      groupId: groupId,
    }));
    if (!sismoConnect) {
      console.error("Error with sismoConnect");
      return;
    }
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
        whiteboardId: params.id,
      },
    };
    if (!sismoConnect) {
      console.error("Error with sismoConnect");
      return;
    }
    sismoConnect.request({
      namespace: "main",
      auth: { authType: AuthType.VAULT },
      signature: {
        message: JSON.stringify(sismoConnectSignedMessage),
      },
    });
  };

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
        onChangeUser={(user) => setUser(user)}
        whiteboardName={whiteboard?.name}
      />
      {messages && (
        <div
          className="messages_container"
          style={{
            cursor: isUserMessageExists ? "default" : "pointer",
            position: "relative",
          }}
          onClick={(e) =>
            !isUserMessageExists &&
            !isFetchingMessages &&
            startMessageCreation(e)
          }>
          {messages.map((message: MessageType) => (
            <Message
              key={message.authorVaultId}
              message={message}
              vaultId={whiteboardVaultId ?? ""}
              onDelete={(message) => requestDeleteMessage(message)}
            />
          ))}
          {messages.length == 0 && !isFetchingMessages && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                color: "gray",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
              }}>
              <div
                style={{
                  fontSize: "50px",
                }}>
                {"👀"}
              </div>
              <div>No messages yet</div>
              <div>Be the first to post a message!</div>
            </div>
          )}
          {isVerifying && <Loading text="Checking the proof..." />}
        </div>
      )}
      {!isVerifying && isFetchingMessages && messages.length == 0 && (
        <Loading text="Loading messages..." />
      )}
      {isModalOpen && (
        <MessageModal
          modalRef={messageModalRef}
          style={{
            position: "absolute",
            zIndex: MAX_Z_INDEX + 2,
            display: "flex",
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
      )}
      {whiteboard && (
        <ShareWhiteboard
          currentURL={currentURL}
          isAuthor={isWhiteboardAuthor}
          whiteboardName={whiteboard.name}
        />
      )}
      {errorMessage && <ErrorModal text={errorMessage} />}
    </div>
  );
};

export default Whiteboard;
