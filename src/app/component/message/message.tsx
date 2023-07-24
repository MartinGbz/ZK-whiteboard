"use client";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { Message } from "../../types/whiteboard-types";

interface MessageProps {
  message: Message;
  vaultId: string | null;
}

const Message: React.FC<MessageProps> = ({ message, vaultId }) => {
  const messageStyle: CSSProperties = {
    backgroundColor: "#" + message.color,
    zIndex: 10000 - message.order,
    padding: "10px",
    marginBottom: "10px",
    cursor: "grab",
    position: "absolute",
    border: "1px solid gray",
    borderRadius: "5px",
    color: "black",
    fontSize: "20px",
  };

  useEffect(() => {}, []);

  const handleMessageClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
  };

  return (
    <Draggable
      key={message.vaultId}
      defaultPosition={{ x: message.positionX, y: message.positionY }}
      bounds="parent"
      disabled={vaultId !== message.vaultId}>
      <div
        className="message"
        style={messageStyle}
        onClick={() => vaultId === message.vaultId && handleMessageClick}>
        {message.text}
        <div
          style={{
            fontSize: "10px",
          }}>
          {"from: " + message.vaultId.substring(0, 10) + "..."}
        </div>
      </div>
    </Draggable>
  );
};

export default Message;
