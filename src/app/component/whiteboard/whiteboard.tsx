"use client";
import React, { use, useCallback, useEffect, useRef, useState } from "react";
import "./whiteboard.css";
import { Position, Message as MessageType } from "../../types/whiteboard-types";

import {
  AuthType,
  SismoConnect,
  SismoConnectButton,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import { sismoConnectConfig } from "../../configs/configs";
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
    useState("#F5F5F5");
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

  const messageInputRef = useRef<HTMLInputElement>(null);
  const messageModalRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // Fonction pour rediriger à la racine du site
  const redirectToRoot = useCallback(() => {
    router.push("/");
  }, [router]);

  useEffect(() => {
    const verifySaveMessage = async (
      message: SismoConnectResponse,
      argMessages: MessageType[]
    ) => {
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
        setMessageInputColorValue("#F5F5F5");
        setIsModalOpen(false);
        saveMessage(newMessage);
      }

      setIsVerifying(false);
      redirectToRoot();
    };
    if (sismoConnectResponseMessage) {
      console.log("sismoConnectResponseMessage");
      verifySaveMessage(sismoConnectResponseMessage, messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectToRoot, sismoConnectResponseMessage]);

  useEffect(() => {
    // if there is a message with the same vaultId, set a state to true
    const isUserMessageExists = messages.some(
      (message: MessageType) => message.vaultId === vaultId
    );
    setIsUserMessageExists(isUserMessageExists);
  }, [messages, vaultId]);

  useEffect(() => {
    // Focus the input when the modal opens
    if (isModalOpen && messageInputRef.current) {
      messageInputRef.current.focus();
    }
    // Reset the modal position when it opens
    if (isModalOpen && messageModalRef.current && messagePosition) {
      messageModalRef.current.style.top = `${messagePosition.y}px`;
      messageModalRef.current.style.left = `${messagePosition.x}px`;
    }
  }, [isModalOpen, messagePosition]);

  async function loginWithSismo(sismoConnectResponse: SismoConnectResponse) {
    // if the reponse come from the message creation
    if (sismoConnectResponse.proofs.length < 2) {
      // verify on the backend that the response is valid
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
    console.log("saveMessage");
    console.log(message);
    const response = await fetch("/api/whiteboard", {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log(data);
    if (data.error) {
      alert(data.error);
    } else {
      console.log("data");
      console.log(data);
      setMessages(data);
    }
  };

  const sismoConnect = SismoConnect({ config: sismoConnectConfig });

  const requestSaveMessage = async () => {
    console.log(
      JSON.stringify({
        text: messageInputValue,
        positionX: messagePosition.x,
        positionY: messagePosition.y,
        color: messageInputColorValue,
      })
    );
    sismoConnect.request({
      namespace: "main",
      auth: { authType: AuthType.VAULT },
      claim: { groupId: "0x3d7589d9259eb410180f085cada87030" },
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
  }, []);

  useEffect(() => {
    console.log("messages");
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
  }, []);

  const startMessageCreation = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    console.log("startMessageCreation");
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
            }}
            config={sismoConnectConfig}
            auth={{ authType: AuthType.VAULT }}
            namespace="main"
            onResponse={(response: SismoConnectResponse) => {
              // loginWithSismo(response);
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
              ↪️ Logout
            </button>
          </div>
        )}
      </div>
      <div
        className="messages_container"
        style={{
          cursor: isUserMessageExists ? "not-allowed" : "pointer",
        }}
        onDoubleClick={(e) => !isUserMessageExists && startMessageCreation(e)}>
        {messages.map((message: MessageType) => (
          <Message key={message.vaultId} message={message} vaultId={vaultId} />
        ))}
        <Loading isVerifying={isVerifying} />
      </div>
      {isModalOpen && (
        <MessageModal
          modalRef={messageModalRef}
          style={{
            position: "absolute",
            top: messagePosition?.y,
            left: messagePosition?.x,
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
