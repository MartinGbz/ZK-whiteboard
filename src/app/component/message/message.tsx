"use client";
import React, { CSSProperties, useEffect, useState } from "react";
import Draggable from "react-draggable";
import { Message } from "../../types/whiteboard-types";
import { MAX_Z_INDEX, TRANSPARENCY } from "@/app/configs/configs";
import "./message.css";
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

  const messageStyle: CSSProperties = {
    backgroundColor: "#" + message.color + TRANSPARENCY,
    zIndex: isHovering ? MAX_Z_INDEX : MAX_Z_INDEX - message.order,
    // animation:
    //   vaultId === message.vaultId
    //     ? "bright-in-bright-out 8s cubic-bezier(1, 1, 1, 1) infinite"
    //     : "none",
    cursor: vaultId === message.vaultId ? "grab" : "default",
    position: "absolute",
    top: y,
    left: x,
    display: isDragging ? "none" : "flex",
    // "&::before": {
    //   content: "",
    //   position: "absolute",
    //   width: "100px",
    //   height: "100%",
    //   backgroundImage:
    //     "linear-gradient(120deg,rgba(255, 255, 255, 0) 30%,rgba(255, 255, 255, 0.8),rgba(255, 255, 255, 0) 70%)",
    //   top: "0",
    //   left: "-100px",
    //   animation: "shine 3s infinite linear",
    // },
  };

  const handleMessageClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
  };

  const onDrag = (event: React.DragEvent<HTMLDivElement>) => {
    // console.log(event);
    // console.log(message.positionX, message.positionY);
    // console.log(x, y);
    // console.log(startClientX);
    setIsDragging(true);
    if (startClientX === 0 && startClientY === 0) {
      console.log("heyyyyy");
      console.log(startClientX);
      console.log(startClientY);
      console.log(event.clientX);
      console.log(event.clientY);
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
    console.log("mouse enter");
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    console.log("mouse enter");
    setIsHovering(false);
  };

  return (
    <div
      key={message.vaultId}
      draggable={vaultId === message.vaultId}
      onDrag={(event) => onDrag(event)}
      onDragEnd={(event) => onDragEnd(event)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`message hoverable ${
        vaultId === message.vaultId && !isDragging ? "shine" : ""
      }`}
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
    </div>
  );
};

export default Message;
