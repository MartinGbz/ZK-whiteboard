"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./whiteboard.css";
import { Position, Message as MessageType } from "../../types/whiteboard-types";
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
  const [isUserMessageExists, setIsUserMessageExists] =
    useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const messageInputRef = useRef<HTMLInputElement>(null);
  const messageModalRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const redirectToRoot = useCallback(() => {
    router.push("/");
  }, [router]);

  useEffect(() => {
    const verifySaveMessage = async (message: SismoConnectResponse) => {
      setIsVerifying(true);
      const response = await fetch("/api/sismo-connect-message", {
        method: "POST",
        body: JSON.stringify(message),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const messageSigned = await response.json();

      if (messageSigned) {
        const newMessage: MessageType = messageSigned;
        setMessageInputValue("");
        setMessageInputColorValue(defaultInputColor);
        setIsModalOpen(false);

        saveMessage(newMessage);
      }

      setIsVerifying(false);
      redirectToRoot();
    };
    if (sismoConnectResponseMessage) {
      verifySaveMessage(sismoConnectResponseMessage);
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
      const response = await fetch("/api/sismo-connect", {
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
    }
  }

  const saveMessage = async (message: MessageType) => {
    const response = await fetch("/api/whiteboard", {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (data.error) {
      console.error(data);
      alert(data.error);
    } else {
      setMessages(data);
    }
  };

  const sismoConnect = SismoConnect({ config: sismoConnectConfig });

  const requestSaveMessage = async () => {
    sismoConnect.request({
      namespace: "main",
      auth: { authType: AuthType.VAULT },
      claim: { groupId: "0x0f800ff28a426924cbe66b67b9f837e2" },
      signature: {
        message: JSON.stringify({
          text: messageInputValue,
          positionX: messagePosition.x,
          positionY: messagePosition.y,
          color: messageInputColorValue.substring(1),
        }),
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

  async function deleteMessage(message: MessageType): Promise<void> {
    // delete message from the database
    if (message.vaultId == vaultId) {
      setIsDeleting(true);
      await deleteMessageFromDatabase(message);
      setIsDeleting(false);
    }
  }

  const deleteMessageFromDatabase = async (message: MessageType) => {
    console.log("deleting message");
    console.log(message);
    console.log(JSON.stringify(message));

    const response = await fetch(`/api/whiteboard?vaultId=${message.vaultId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (data.error) {
      console.error(data);
    } else {
      // delete message from the state
      const newMessages = messages.filter(
        (message: MessageType) => message.vaultId !== data.vaultId
      );
      setMessages(newMessages);
    }
  };

  return (
    <div className="whiteboard">
      <div className="header">
        <Title
          text="whiteboard"
          style={{
            textAlign: "center",
            alignSelf: "center",
            gridColumn: 2,
          }}
        />
        {!vaultId && (
          <SismoConnectButton
            overrideStyle={{
              gridColumn: "3",
              width: "fit-content",
              justifySelf: "end",
              height: "15px",
              backgroundColor: "lightgray",
              color: "black",
            }}
            config={sismoConnectConfig}
            auth={{ authType: AuthType.VAULT }}
            namespace="main"
            onResponse={(response: SismoConnectResponse) => {
              loginWithSismo(response);
            }}
          />
        )}
        {vaultId && (
          <div className="user">
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
              <LogoutIcon /> Logout
            </button>
          </div>
        )}
      </div>
      <div
        className="messages_container"
        style={{
          cursor: isUserMessageExists ? "default" : "pointer",
          position: "relative",
        }}
        onDoubleClick={(e) => !isUserMessageExists && startMessageCreation(e)}>
        {messages.map((message: MessageType) => (
          <Message
            key={message.vaultId}
            message={message}
            vaultId={vaultId}
            onDelete={(message) => deleteMessage(message)}
          />
        ))}
        {isVerifying && <Loading text="Checking the proof..." />}
        {isDeleting && <Loading text="Message deletion..." />}
      </div>
      {isModalOpen && (
        <MessageModal
          modalRef={messageModalRef}
          style={{
            position: "absolute",
            top: messagePosition?.y,
            left: messagePosition?.x,
            zIndex: MAX_Z_INDEX + 2,
          }}
          inputValue={messageInputValue}
          inputColorValue={messageInputColorValue}
          onChange={(e) => setMessageInputValue(e.target.value)}
          onColorChange={(e) => setMessageInputColorValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              requestSaveMessage();
            } else if (e.key === "Escape") {
              setIsModalOpen(false);
            }
          }}
          inputRef={messageInputRef}
          onClickCancel={(e) => setIsModalOpen(false)}
          onClickSave={(e) => requestSaveMessage()}
        />
      )}
    </div>
  );
};

export default Whiteboard;
