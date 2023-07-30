"use client";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { Message } from "../../types/whiteboard-types";
import { MAX_Z_INDEX, TRANSPARENCY } from "@/app/configs/configs";
import "./message.css";
import DeleteIcon from "@mui/icons-material/Delete";

interface MessageProps {
  message: Message;
  vaultId: string | null;
}

const Message: React.FC<MessageProps> = ({ message, vaultId }) => {
  const [x, setX] = useState(message.positionX);
  const [y, setY] = useState(message.positionY);

  const [startClientX, setStartClientX] = useState(0);
  const [startClientY, setStartClientY] = useState(0);

  const [isDragging, setIsDragging] = useState(false);

  const [isHovering, setIsHovering] = useState(false);

  const messageRef = useRef<HTMLInputElement>(null);
  const deleteButtonRef = useRef<HTMLInputElement>(null);

  const [scale, setScale] = useState(1);
  const [originalWidth, setOriginalWidth] = useState(1);

  useEffect(() => {
    if (messageRef.current) {
      const rect = messageRef.current.getBoundingClientRect();
      setScale(rect.width / messageRef.current.offsetWidth);
      console.log(scale);
      setOriginalWidth(rect.width);
    }
  }, []);

  const messageStyle: CSSProperties = {
    backgroundColor: "#" + message.color + TRANSPARENCY,
    zIndex: isHovering ? MAX_Z_INDEX : MAX_Z_INDEX - message.order,
    cursor: vaultId === message.vaultId ? "grab" : "default",
    top: y,
    left: x,
  };

  const deleteButtonStyle: CSSProperties = {
    zIndex: MAX_Z_INDEX + 100,
    backgroundColor: "#ff5656",
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

  const onDrag = (event: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (startClientX === 0 && startClientY === 0) {
      setStartClientX(event.clientX);
      setStartClientY(event.clientY);
    }
    if (
      startClientX !== 0 &&
      startClientY !== 0 &&
      event.clientX !== 0 &&
      event.clientX !== 0
    ) {
      const diffX = startClientX - event.clientX;
      const diffY = startClientY - event.clientY;
      setX(message.positionX - diffX);
      setY(message.positionY - diffY);
    }
  };

  const onDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (messageRef.current) {
      console.log(messageRef.current?.width);
      const rect = messageRef.current.getBoundingClientRect();
      console.log(rect.width);
      console.log(originalWidth);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (messageRef.current) {
      console.log(messageRef.current?.width);
      const rect = messageRef.current.getBoundingClientRect();
      console.log(rect.width);
    }
  };

  return (
    <div
      ref={messageRef}
      key={message.vaultId}
      draggable={vaultId === message.vaultId}
      onDrag={(event) => onDrag(event)}
      onDragEnd={(event) => onDragEnd(event)}
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
          }}>
          {"from: " + message.vaultId.substring(0, 10) + "..."}
        </div>
      </div>
      {vaultId === message.vaultId && (
        <div
          ref={deleteButtonRef}
          className="delete_button"
          style={deleteButtonStyle}>
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
