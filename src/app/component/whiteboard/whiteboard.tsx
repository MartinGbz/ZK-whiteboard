"use client";
import React, { useEffect, useRef, useState } from "react";
import "./whiteboard.css";
import { Message as MessageType } from "../../types/whiteboard-types";

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
import { useRouter } from 'next/navigation';
import Loading from "../loading-modal/loading-modal";

const Whiteboard = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageInputValue, setMessageInputValue] = useState("");
  const [messagePosition, setMessagePosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [vaultId, setVaultId] = useState<string | null>(null);
  const [sismoConnectResponseMessage, setSismoConnectResponseMessage] = useState<SismoConnectResponse | null>(null);
  const [isNewMessageCalled, setIsNewMessageCalled] = useState<Boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const router = useRouter();

  // Fonction pour rediriger à la racine du site
  const redirectToRoot = () => {
    router.push('/');
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("useEffect");
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
        if(sismoConnectResponseMessage) {
          await verifySaveMessage(sismoConnectResponseMessage, messages);
        }
      } catch (error) {
        console.error(error);
      }
    };
    if (!messages.length) {
      fetchData();
    }
    const storagedVaultId = localStorage.getItem("vaultId");
    if (storagedVaultId) {
      console.log("storagedVaultId", storagedVaultId);
      setVaultId(storagedVaultId);
    }
  }, [messages, sismoConnectResponseMessage]);

  useEffect(() => {
    console.log("useEffect 2");
    // Focus the input when the modal opens
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }

    // Reset the modal position when it opens
    if (isModalOpen && modalRef.current && messagePosition) {
      modalRef.current.style.top = `${messagePosition.y}px`;
      modalRef.current.style.left = `${messagePosition.x}px`;
    }
  }, [isModalOpen, messagePosition, isNewMessageCalled]);

  async function loginWithSismo(sismoConnectResponse: SismoConnectResponse) {
    // if the reponse come from the message creation
    if(sismoConnectResponse.proofs.length < 2) {
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
    const response = await fetch("/api/whiteboard", {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if(data) {
      setMessages((messages) => [...messages, message]);
    }
  };

  const verifySaveMessage = async (message: SismoConnectResponse, argMessages: MessageType[]) => {
    setIsVerifying(true);
    const response = await fetch("/api/sismo-connect-message", {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const messageSigned = await response.json();
    
    const isUserMessageExists = argMessages.some((message: MessageType) => message.vaultId === messageSigned.vaultId);
    if(isUserMessageExists) {
      alert("Error: you already have created a message");
    }
    else if(messageSigned) {
      const newMessage: MessageType = messageSigned;
      setMessageInputValue("");
      setIsModalOpen(false);
      saveMessage(newMessage);
    }
    else {
      console.error("Error: vaultId is null");
    }
    setIsVerifying(false);
    redirectToRoot();
  };

  const sismoConnect = SismoConnect({ config: sismoConnectConfig });

  const requestSaveMessage = async () => {
    sismoConnect.request({
      namespace: "main",
      auth: { authType: AuthType.VAULT },
      claim: { groupId: "0x3d7589d9259eb410180f085cada87030" },
      signature: { message: JSON.stringify({
        text: messageInputValue,
        positionX: messagePosition.x,
        positionY: messagePosition.y,
      })},
    });
  };

  useEffect(() => {
    const responseMessage: SismoConnectResponse | null = sismoConnect.getResponse();
    if(responseMessage) {
      const fetchData = async () => {
        if(responseMessage.signedMessage) {
          setSismoConnectResponseMessage(responseMessage);
        }
      };
      fetchData();
    }
  }, []);

  const startMessageCreation = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    setIsNewMessageCalled(true);
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
        <Title text="whiteboard" style={{
            textAlign: "center",
            alignSelf: "center",
            gridColumn: 2,
        }}/>
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
            <span style={{
              marginRight: "5px",
              fontSize: "12px",
              color: "white",
            }}> {vaultId.substring(0, 10) + "..."} </span>
            <button
              onClick={() => {
                console.log("logout");
                setVaultId(null);
                localStorage.removeItem("vaultId");
              }}
              style={{
                fontSize: "15px",
                fontWeight: "bold",
                color: "white",
              }}>
              {" "}
              ↪️ Logout
            </button>
          </div>
        )}
      </div>
      <div
        className="messages_container"
        onDoubleClick={(e) => startMessageCreation(e)}>
        {messages.map((message: MessageType) => (
          <Message 
            key={message.vaultId}
            message={message}
            vaultId={vaultId}
          />
        ))}
        <Loading isVerifying={isVerifying}/>
      </div>
      {isModalOpen && (
        <MessageModal
          modalRef={modalRef}
          style={{
            position: "absolute",
            top: messagePosition?.y,
            left: messagePosition?.x,
          }}
          inputValue={messageInputValue}
          onChange={(e) => setMessageInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              requestSaveMessage();
            } else if (e.key === "Escape") {
              setIsModalOpen(false);
            }
          }}
          inputRef={inputRef}
          onClickCancel={(e) => setIsModalOpen(false)}
          onClickSave={(e) => requestSaveMessage()}
        />
      )}
    </div>
  );
};

export default Whiteboard;
