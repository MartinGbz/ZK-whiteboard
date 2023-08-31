"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./whiteboard.css";
import {
  Position,
  Message as MessageType,
  SignedMessage,
  OperationType,
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

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

const API_BASE_URL = "/api/whiteboard";
const API_ENDPOINTS = {
  POST: "/post",
  DELETE: "/delete",
};

const Whiteboard = () => {
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
  const [isLoging, setIsLoging] = useState<boolean>(false);
  const [isUserMessageExists, setIsUserMessageExists] =
    useState<boolean>(false);

  const messageInputRef = useRef<HTMLInputElement>(null);
  const messageModalRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const redirectToRoot = useCallback(() => {
    router.push("/");
  }, [router]);

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
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(message),
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.json();
    };

    const handleApiResponse = async (apiResponse: any) => {
      if (!apiResponse.error) {
        setMessageInputValue("");
        setMessageInputColorValue(defaultInputColor);
        setIsModalOpen(false);

        setMessages(apiResponse);
      } else {
        alert("Error: " + apiResponse.error);
      }
    };

    const postMessage = async (message: SismoConnectResponse) => {
      setIsVerifying(true);

      const url = constructUrlFromMessage(message);

      try {
        const allMessageFromDB: any = await performApiRequest(url, message);
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
      (message: MessageType) => message.vaultId === vaultId
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
      try {
        const response = await fetch("/api/whiteboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-cache",
        });
        const messages = await response.json();
        setMessages(messages);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMessages();

    const storagedVaultId = localStorage.getItem("vaultId");
    if (storagedVaultId) {
      setVaultId(storagedVaultId);
    }
  }, []);

  async function loginWithSismo(sismoConnectResponse: SismoConnectResponse) {
    // if the reponse does not come from the message creation
    if (sismoConnectResponse.proofs.length < 2) {
      setIsLoging(true);
      const response = await fetch("/api/whiteboard/login", {
        method: "POST",
        body: JSON.stringify(sismoConnectResponse),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      const vaultId = data.vaultId;
      setVaultId(vaultId);
      localStorage.setItem("vaultId", vaultId);
      redirectToRoot();
      setIsLoging(false);
    }
  }

  const requestAddMessage = async () => {
    const sismoConnectSignedMessage: SignedMessage = {
      type: OperationType.POST,
      message: {
        text: messageInputValue,
        positionX: messagePosition.x,
        positionY: messagePosition.y,
        color: messageInputColorValue.substring(1),
      },
      whiteboardId: 0,
    };
    sismoConnect.request({
      namespace: "main",
      auth: { authType: AuthType.VAULT },
      claims: [
        { groupId: "0x0f800ff28a426924cbe66b67b9f837e2" },
        { groupId: "0x1cde61966decb8600dfd0749bd371f12" },
      ],
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
      },
      whiteboardId: 0,
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
        vaultId={vaultId}
        isLoging={isLoging}
        loginWithSismo={(response) => loginWithSismo(response)}
        setVaultId={(vaultId) => setVaultId(vaultId)}
      />
      <div
        className="messages_container"
        style={{
          cursor: isUserMessageExists || !vaultId ? "default" : "pointer",
          position: "relative",
        }}
        onDoubleClick={(e) =>
          !isUserMessageExists && vaultId && startMessageCreation(e)
        }>
        {messages.map((message: MessageType) => (
          <Message
            key={message.vaultId}
            message={message}
            vaultId={vaultId}
            onDelete={(message) => requestDeleteMessage(message)}
          />
        ))}
        {isVerifying && <Loading text="Checking the proof..." />}
      </div>
      {isModalOpen && (
        <MessageModal
          modalRef={messageModalRef}
          style={{
            position: "absolute",
            zIndex: MAX_Z_INDEX + 2,
          }}
          initialPositionX={messagePosition?.x}
          initialPositionY={messagePosition?.y}
          inputValue={messageInputValue}
          inputColorValue={messageInputColorValue}
          onChange={(e) => setMessageInputValue(e.target.value)}
          onColorChange={(e) => setMessageInputColorValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              requestAddMessage();
            } else if (e.key === "Escape") {
              setIsModalOpen(false);
            }
          }}
          inputRef={messageInputRef}
          onClickCancel={(e) => setIsModalOpen(false)}
          onClickSave={(e) => requestAddMessage()}
        />
      )}
    </div>
  );
};

export default Whiteboard;
