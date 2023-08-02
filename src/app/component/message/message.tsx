"use client";
import React, { CSSProperties, useRef, useState } from "react";
import { Message } from "../../types/whiteboard-types";
import { MAX_Z_INDEX, TRANSPARENCY, redColor } from "@/app/configs/configs";
import "./message.css";
import DeleteIcon from "@mui/icons-material/Delete";

interface MessageProps {
  message: Message;
  vaultId: string | null;
  onDelete?: (message: Message) => void;
}

const Message: React.FC<MessageProps> = ({ message, vaultId, onDelete }) => {
  const [x, setX] = useState(message.positionX);
  const [y, setY] = useState(message.positionY);

  const [isHovering, setIsHovering] = useState(false);

  const messageRef = useRef<HTMLInputElement>(null);
  const deleteButtonRef = useRef<HTMLInputElement>(null);

  const messageStyle: CSSProperties = {
    backgroundColor: "#" + message.color + TRANSPARENCY,
    zIndex: isHovering ? MAX_Z_INDEX : MAX_Z_INDEX - message.order,
    animation:
      vaultId === message.vaultId && !isHovering
        ? `shine 5s infinite linear`
        : "",
    top: y,
    left: x,
    ["--shadow-color" as string]: `#${message.color}`,
  };

  const deleteButtonStyle: CSSProperties = {
    zIndex: MAX_Z_INDEX + 1,
    backgroundColor: redColor,
    borderRadius: "50%",
    textAlign: "center",
    position: "absolute",

    top: "-10px",
    right: "-10px",
    transition: "opacity 0.2s, transform 0.2s, translate 0.2s",
    opacity: isHovering ? "1" : "0",
    transform: isHovering ? "scale(1.1)" : "scale(1)",
    cursor: "pointer",
    display: "inline-flex",
    padding: "5px",
    boxShadow: "rgba(0, 0, 0, 0.25) -5px 5px 15px 3px",
  };

  const handleMessageClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div
      ref={messageRef}
      key={message.vaultId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="message hoverable"
      style={messageStyle}
      onClick={(event) =>
        vaultId === message.vaultId && handleMessageClick(event)
      }>
      <div>{message.text}</div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: "normal",
            fontFamily: "Inter-Regular",
            whiteSpace: "nowrap",
          }}>
          {"from: " + message.vaultId.substring(0, 10) + "..."}
        </div>
      </div>
      {vaultId === message.vaultId && (
        <div
          ref={deleteButtonRef}
          className="delete_button"
          style={deleteButtonStyle}
          onClick={onDelete ? () => onDelete(message) : undefined}>
          <DeleteIcon
            style={{
              color: "white",
              fontSize: "small",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Message;
