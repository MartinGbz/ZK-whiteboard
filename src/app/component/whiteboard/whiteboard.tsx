"use client";
import React, { useEffect, useRef, useState } from "react";
import "./whiteboard.css";
import { Message } from "../../types/whiteboard-types";
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

const Whiteboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagePosition, setMessagePosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [newMessage, setNewMessage] = useState<Message | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
        console.log("messages");
        console.log(data);
        console.log(messages);
      } catch (error) {
        console.error(error);
      }
    };

    if (!messages.length) {
      fetchData();
    }

    const userId = localStorage.getItem("userId");
    if (userId) {
      setUserId(userId);
    }
    console.log("userId");
    console.log(userId);
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

  async function onSismoConnectResponse(response: SismoConnectResponse) {
    console.log("Sismo Connect Response");
    console.log(response);
    if (response) {
      // verify on the backend that the response is valid
      const res = await fetch("/api/sismo-connect", {
        method: "POST",
        body: JSON.stringify(response),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("data");
      console.log(data);
      const vaultId = data.vaultId;
      console.log("vaultId");
      console.log(vaultId);
      setUserId(vaultId);
    }
  }

  const handleSave2 = async (message: SismoConnectResponse) => {
    // if(responseMessage) {
      console.log("HEYYYYYYYYYYY");
      console.log(inputValue);
      const res = await fetch("/api/sismo-connect-message", {
        method: "POST",
        body: JSON.stringify(message),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const messageSigned = await res.json();
      console.log("data");
      console.log(messageSigned);

      if(messageSigned) {
        const newMessage: Message = messageSigned;

        console.log("===>>>> newMessage");
        console.log(newMessage);
    
        setNewMessage(newMessage);
        // setMessages([...messages, newMessage]);
        // setMessages([newMessage, ...messages]);
        // set the new message in the messages array
        setMessages((messages) => [...messages, newMessage]);
        setInputValue("");
        setIsModalOpen(false);
    
        const response = await fetch("/api/whiteboard", {
          method: "POST",
          body: JSON.stringify(newMessage),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log("----------->>>>> data");
        console.log(data);
      }
      else {
        console.error("Error: vaultId is null");
      }
    // }
  };

  const sismoConnect = SismoConnect({ config: sismoConnectConfig });

  const handleSave = async () => {
    sismoConnect.request({
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
        console.log("555555555555");
        if(responseMessage.signedMessage) {
          console.log("responseMessage.signedMessage");
          console.log(responseMessage.signedMessage);
          await handleSave2(responseMessage);
        }
      };
      fetchData();
    }
  }, []);

  const handleMessageClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
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
      <div className="header">
        <h1>Whiteboard</h1>
        {/* {!userId && (
          <SismoConnectButton
            overrideStyle={{
              gridColumn: "3",
              width: "fit-content",
              justifySelf: "end",
            }}
            // the client config created
            config={sismoConnectConfig}
            // the auth request we want to make
            // here we want the proof of a Sismo Vault ownership from our users
            auth={{ authType: AuthType.VAULT }}
            // claim={{ groupId: "0x3d7589d9259eb410180f085cada87030" }}
            // onResponseBytes calls a 'setResponse' function with the responseBytes returned by the Sismo Vault
            onResponse={(response: SismoConnectResponse) => {
              onSismoConnectResponse(response);
            }}
          />
        )} */}
        {userId && (
          <div className="user">
            <span> {userId.substring(0, 10) + "..."} </span>
            <button
              onClick={() => {
                setUserId(null);
                localStorage.removeItem("userId");
              }}>
              {" "}
              Logout
            </button>
          </div>
        )}
      </div>
      <div
        className="messages_container"
        onDoubleClick={(e) => startMessageCreation(e)}>
        {messages.map((message: Message) => (
          <Draggable
            // className="custom-draggable"
            key={message.userId}
            defaultPosition={{ x: message.positionX, y: message.positionY }}
            bounds="parent"
            // disabled={message.userId !== newMessage?.userId}
            disabled={message.userId !== userId}>
            <div className="message" onClick={handleMessageClick}>
              {message.text}
            </div>
          </Draggable>
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
              handleSave();
            } else if (e.key === "Escape") {
              setIsModalOpen(false);
            }
          }}
          inputRef={inputRef}
          onClickCancel={(e) => setIsModalOpen(false)}
          onClickSave={(e) => handleSave()}
        />
      )}
    </div>
  );
};

export default Whiteboard;
