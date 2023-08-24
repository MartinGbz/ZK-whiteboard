"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./whiteboard.css";
import {
  Position,
  Message as MessageType,
  SignedMessage,
  OperationType,
} from "../../types/whiteboard-types";
import LogoutIcon from "@mui/icons-material/Logout";

import {
  AuthType,
  SismoConnect,
  SismoConnectButton,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import {
  MAX_Z_INDEX,
  defaultInputColor,
  sismoConnectConfig,
} from "../../configs/configs";
import MessageModal from "../message-modal/message-modal";
import Message from "../message/message";
import Title from "../title/title";
import { useRouter } from "next/navigation";
import Loading from "../loading-modal/loading-modal";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";

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
    const postMessage = async (message: SismoConnectResponse) => {
      setIsVerifying(true);

      let url = "/api/whiteboard";
      let signedMessage;
      if (message.signedMessage) {
        signedMessage = JSON.parse(message.signedMessage) as SignedMessage;
      }

      switch (signedMessage?.type) {
        case OperationType.POST:
          url += "/post";
          break;
        case OperationType.DELETE:
          url += "/delete";
          break;
        default:
          break;
      }

      let allMessageFromDB;
      console.log("message", message);
      console.log(
        "sismoConnectResponseMessage.signedMessage",
        sismoConnectResponseMessage?.signedMessage
      );
      console.log("url", url);
      try {
        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify(message),
          headers: {
            "Content-Type": "application/json",
          },
        });
        allMessageFromDB = await response.json();
      } catch (error) {
        console.error(error);
      }

      if (!allMessageFromDB.error) {
        setMessageInputValue("");
        setMessageInputColorValue(defaultInputColor);
        setIsModalOpen(false);

        setMessages(allMessageFromDB);
      } else {
        alert("Error: " + allMessageFromDB.error);
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
    const fetchData = async () => {
      try {
        const response = await fetch("/api/whiteboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const messages = await response.json();
        setMessages(messages);
      } catch (error) {
        console.error(error);
      }
    };
    if (!messages.length) {
      fetchData();
    }

    const storagedVaultId = localStorage.getItem("vaultId");
    if (storagedVaultId) {
      setVaultId(storagedVaultId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const sismoConnect = SismoConnect({ config: sismoConnectConfig });

  const requestAddMessage = async () => {
    const sismoConnectSignedMessage: SignedMessage = {
      type: OperationType.POST,
      message: {
        text: messageInputValue,
        positionX: messagePosition.x,
        positionY: messagePosition.y,
        color: messageInputColorValue.substring(1),
      },
    };
    sismoConnect.request({
      namespace: "main",
      auth: { authType: AuthType.VAULT },
      claim: { groupId: "0x0f800ff28a426924cbe66b67b9f837e2" },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="header">
        <Title
          text="Whiteboard"
          style={{
            textAlign: "center",
            alignSelf: "center",
            gridColumn: 2,
          }}
        />
        {!vaultId && !isLoging && (
          <SismoConnectButton
            overrideStyle={{
              gridColumn: "3",
              width: "fit-content",
              justifySelf: "end",
              height: "15px",
              backgroundColor: "lightgray",
              color: "black",
              alignSelf: "center",
            }}
            config={sismoConnectConfig}
            auth={{ authType: AuthType.VAULT }}
            namespace="main"
            onResponse={(response: SismoConnectResponse) => {
              loginWithSismo(response);
            }}
          />
        )}
        {vaultId && !isLoging && (
          <div className="login">
            <span className="user_id">
              {" "}
              {vaultId.substring(0, 10) + "..."}{" "}
            </span>
            <button
              className="logout_button"
              onClick={() => {
                setVaultId(null);
                localStorage.removeItem("vaultId");
              }}>
              {" "}
              <LogoutIcon
                style={{
                  fontSize: "20px",
                }}
              />{" "}
              Logout
            </button>
          </div>
        )}
        {isLoging && <CircularProgress color="inherit" className="login" />}
      </div>
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
