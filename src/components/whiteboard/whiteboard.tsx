"use client";

import "./whiteboard.css";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Position,
  SignedMessage,
  Whiteboard,
  PostDeletionResponse,
  OperationType,
} from "@/types/whiteboard-types";

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
} from "@/configs/configs";
import MessageModal from "@/components/message-modal/message-modal";
import Message from "@/components/message/message";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/components/loading-modal/loading-modal";
import { Message as MessageType } from "@prisma/client";
import ShareWhiteboard from "@/components/share-whiteboard/share-whiteboard";
import axios from "axios";
import { useLoginContext } from "@/context/login-context";

import { toast } from "react-hot-toast";

interface whiteboardProps {
  whiteboard: Whiteboard;
}

let sismoConnect: SismoConnectClient | null = null;

const API_BASE_URL = "/api/message";
const API_ENDPOINTS = {
  POST: "/post",
  DELETE: "/delete",
};

const messageModalWidth = 275;

const Whiteboard = ({ whiteboard }: whiteboardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageInputValue, setMessageInputValue] = useState("");
  const [messageInputColorValue, setMessageInputColorValue] =
    useState(defaultInputColor);
  const [messagePosition, setMessagePosition] = useState<Position>({
    x: 0,
    y: 0,
  });
  const [sismoConnectResponseMessage, setSismoConnectResponseMessage] =
    useState<SismoConnectResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isUserMessageExists, setIsUserMessageExists] =
    useState<boolean>(false);
  const [isWhiteboardAuthor, setIsWhiteboardAuthor] = useState<boolean>(false);

  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messageModalRef = useRef<HTMLDivElement>(null);
  const containerMessageModalRef = useRef<HTMLDivElement>(null);

  const [currentURL, setCurrentURL] = useState("");
  const whiteboardVaultId = useRef<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const redirectToRoot = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  useEffect(() => {
    setCurrentURL(`${window.location.origin}${pathname}`);
  }, [pathname]);

  const { user } = useLoginContext();

  useEffect(() => {
    whiteboardVaultId.current = localStorage.getItem(
      WHITEBOARD_VAULTID_VARNAME + whiteboard.id
    );

    const isUserMessageExists = whiteboard.messages.some(
      (message: MessageType) =>
        message.authorVaultId === whiteboardVaultId.current
    );

    setIsUserMessageExists(isUserMessageExists);
  }, [whiteboard.id]);

  useEffect(() => {
    whiteboard?.authorVaultId === user?.vaultId
      ? setIsWhiteboardAuthor(true)
      : setIsWhiteboardAuthor(false);
  }, [user, whiteboard]);

  useEffect(() => {
    if (whiteboard?.appId) {
      localStorage.setItem(CURRENT_APPID_VARNAME, whiteboard.appId);
      sismoConnect = SismoConnect({
        config: {
          appId: whiteboard.appId,
        },
      });
      const responseMessage: SismoConnectResponse | null =
        sismoConnect.getResponse();
      if (responseMessage?.signedMessage) {
        // check if the message is not a reaction
        if (!JSON.parse(responseMessage.signedMessage).message.type) {
          setSismoConnectResponseMessage(responseMessage);
        }
      }
    }
  }, [whiteboard]);

  useEffect(() => {
    const constructUrlFromMessage = (message: SismoConnectResponse) => {
      let url = API_BASE_URL;
      const signedMessage = message.signedMessage
        ? (JSON.parse(message.signedMessage) as SignedMessage)
        : null;

      if (signedMessage?.type === OperationType.POST) {
        url += API_ENDPOINTS.POST;
      } else if (signedMessage?.type === OperationType.DELETE) {
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
        const type = message.signedMessage
          ? (JSON.parse(message.signedMessage) as SignedMessage).type
          : null;
        let errorMessage = type
          ? `An error occured while ${type} your message`
          : "An error occured while deleting or posting your message";
        errorMessage = error.response.data.error
          ? `${errorMessage}: ${error.response.data.error}`
          : errorMessage;
        toast.error(errorMessage);
        return null;
      }
      return response.data as PostDeletionResponse;
    };

    const postMessage = async (message: SismoConnectResponse) => {
      setIsVerifying(true);

      const url = constructUrlFromMessage(message);

      const response = await performApiRequest(url, message);
      if (response) {
        localStorage.setItem(
          WHITEBOARD_VAULTID_VARNAME + whiteboard.id,
          response.vaultId
        );
        whiteboardVaultId.current = response.vaultId;
        setMessageInputValue("");
        setMessageInputColorValue(defaultInputColor);
        setIsModalOpen(false);
      }
      setIsVerifying(false);
      // no need to refresh the page to update the messages (because the root redirection do the job)
      redirectToRoot();
    };
    if (sismoConnectResponseMessage?.signedMessage && whiteboard.id) {
      postMessage(sismoConnectResponseMessage);
    }
  }, [redirectToRoot, sismoConnectResponseMessage, whiteboard.id]);

  useEffect(() => {
    if (isModalOpen && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [isModalOpen, messagePosition]);

  const requestAddMessage = async () => {
    const sismoConnectSignedMessage: SignedMessage = {
      type: OperationType.POST,
      message: {
        text: messageInputValue,
        positionX: messagePosition.x,
        positionY: messagePosition.y,
        color: messageInputColorValue.substring(1),
        whiteboardId: whiteboard.id,
      },
    };
    const claims = whiteboard?.groupIds?.map((groupId) => ({
      groupId: groupId,
    }));
    if (!sismoConnect) {
      console.error("Error with sismoConnect");
      toast.error("Error with sismoConnect");
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
      type: OperationType.DELETE,
      message: {
        text: message.text,
        positionX: message.positionX,
        positionY: message.positionY,
        color: message.color,
        whiteboardId: whiteboard.id,
      },
    };
    if (!sismoConnect) {
      console.error("Error with sismoConnect");
      toast.error("Error with sismoConnect");
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
    setIsModalOpen((m) => !m);
  };

  return (
    <div className="whiteboard">
      {whiteboard.messages && whiteboardVaultId.current && (
        <div
          className="messages_container"
          ref={containerMessageModalRef}
          style={{
            cursor: isModalOpen ? "default" : "pointer",
            position: "relative",
            overflow: "scroll",
          }}
          onClick={(e) => !isUserMessageExists && startMessageCreation(e)}>
          {whiteboard.messages.map((message: MessageType) => (
            <Message
              key={message.authorVaultId}
              message={message}
              appId={whiteboard?.appId ?? ""}
              vaultId={whiteboardVaultId.current ?? ""}
              onDelete={(message) => requestDeleteMessage(message)}
              onError={(errorMessage) => {
                throw new Error(errorMessage);
              }}
            />
          ))}
          {whiteboard.messages.length == 0 && (
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
                width: "max-content",
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
          {isModalOpen && (
            <MessageModal
              modalRef={messageModalRef}
              containerRef={containerMessageModalRef}
              style={{
                position: "absolute",
                zIndex: MAX_Z_INDEX + 2,
                display: "flex",
                height: "fit-content",
                width: messageModalWidth + "px",
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
        </div>
      )}
      {isVerifying && <Loading text="Checking the proof..." />}
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
