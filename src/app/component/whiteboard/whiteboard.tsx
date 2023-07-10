"use client";
import React, { useEffect, useRef, useState } from "react";
import "./whiteboard.css";
import { Message as MessageType } from "../../types/whiteboard-types";
import Draggable from "react-draggable";

import {
  AuthType,
  ClaimType,
  SismoConnect,
  SismoConnectButton,
  SismoConnectConfig,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import { sismoConnectConfig } from "../../configs/configs";
import MessageModal from "../message-modal/message-modal";
import Message from "../message/message";
import Title from "../title/title";

const Whiteboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messagePosition, setMessagePosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [vaultId, setVaultId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("useEffect");
    const fetchData = async () => {
      try {
        // Code asynchrone à exécuter une fois que le composant a fini de charger
        const response = await fetch("/api/whiteboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error(error);
      }
    };
    if (!messages.length) {
      fetchData();
    }
    const vaultId = localStorage.getItem("vaultId");
    if (vaultId) {
      setVaultId(vaultId);
      console.log("vaultId");
      console.log(vaultId);
    }
  }, [messages]);

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
  }, [isModalOpen, messagePosition]);

  async function onButtonSismoConnectResponse(response: SismoConnectResponse) {
    if (response) {
      console.log("HFGCVKJHHVJKHV");
      // verify on the backend that the response is valid
      const res = await fetch("/api/sismo-connect", {
        method: "POST",
        body: JSON.stringify(response),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      const vaultId = data.vaultId;;
      setVaultId(vaultId);
      localStorage.setItem("vaultId", vaultId);
    }
  }

  const saveMessage = async (message: MessageType) => {
    const res = await fetch("/api/whiteboard", {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if(data) {
      setMessages((messages) => [...messages, message]);
    }
    else {
      alert("Error: you already have created a message");
    }
    console.log("----------->>>>> data");
    console.log(data);
  };

  const verifySaveMessage = async (message: SismoConnectResponse) => {
    console.log("oœœ message");
    const res = await fetch("/api/sismo-connect-message", {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("oœœ res");

    const messageSigned = await res.json();

    if(messageSigned) {
      const newMessage: MessageType = messageSigned;

      // setVaultId(newMessage.vaultId);
      setInputValue("");
      setIsModalOpen(false);

      saveMessage(newMessage);
    }
    else {
      console.error("Error: vaultId is null");
    }
  };

  const sismoConnect = SismoConnect({ config: sismoConnectConfig });

  const requestSaveMessage = async () => {
    sismoConnect.request({
      namespace: "main",
      auth: { authType: AuthType.VAULT },
      claim: { groupId: "0x3d7589d9259eb410180f085cada87030" },
      signature: { message: JSON.stringify({
        text: inputValue,
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
          await verifySaveMessage(responseMessage);
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
      <div className="header">
        {/* <h1>Whiteboard</h1> */}
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
              // backgroundColor: "smokewhite",
              // color: "black",
            }}
            // the client config created
            config={sismoConnectConfig}
            // the auth request we want to make
            // here we want the proof of a Sismo Vault ownership from our users
            auth={{ authType: AuthType.VAULT }}
            namespace="main"
            // claim={{ groupId: "0x3d7589d9259eb410180f085cada87030" }}
            // onResponseBytes calls a 'setResponse' function with the responseBytes returned by the Sismo Vault
            onResponse={(response: SismoConnectResponse) => {
              onButtonSismoConnectResponse(response);
            }}
          />
        )}
        {vaultId && (
          <div className="user">
            <span style={{
              marginRight: "5px",
              fontSize: "12px",
            }}> {vaultId.substring(0, 10) + "..."} </span>
            <button
              onClick={() => {
                setVaultId(null);
                localStorage.removeItem("vaultId");
              }}
              style={{
                fontSize: "15px",
                fontWeight: "bold",
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
          // <Draggable
          //   key={message.vaultId}
          //   defaultPosition={{ x: message.positionX, y: message.positionY }}
          //   bounds="parent"
          //   disabled={vaultId !== message.vaultId}>
          //   <div className="message"
          //     onClick={() => vaultId === message.vaultId && handleMessageClick}>
          //     {message.text}
          //   </div>
          // </Draggable>
        ))}
      </div>
      {isModalOpen && (
        <MessageModal
          modalRef={modalRef}
          style={{
            position: "absolute",
            top: messagePosition?.y,
            left: messagePosition?.x,
          }}
          inputValue={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
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
