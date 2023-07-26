"use client";
import React, { CSSProperties, useEffect } from "react";
import Draggable from "react-draggable";
import { Message } from "../../types/whiteboard-types";
import { MAX_Z_INDEX } from "@/app/configs/configs";
import "./message.css";
interface MessageProps {
  message: Message;
  vaultId: string | null;
}

const Message: React.FC<MessageProps> = ({ message, vaultId }) => {
  const messageStyle: CSSProperties = {
    backgroundColor: "#" + message.color,
    zIndex: MAX_Z_INDEX - message.order,
    animation:
      vaultId === message.vaultId
        ? "zoom-in-zoom-out 8s cubic-bezier(1, 1, 1, 1) infinite"
        : "none",
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
        onClick={(event) =>
          vaultId === message.vaultId && handleMessageClick(event)
        }>
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
