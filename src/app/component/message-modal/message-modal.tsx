"use client";
import React, { CSSProperties, use, useEffect, useState } from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { greenColor, redColor } from "@/app/configs/configs";
import "./message-modal.css";

interface MessageModalProps {
  style?: CSSProperties;
  modalRef?: React.RefObject<HTMLDivElement>;
  inputValue?: string;
  inputColorValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onColorChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  onClickCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClickSave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  initialPositionX: number;
  initialPositionY: number;
}

const MessageModal: React.FC<MessageModalProps> = ({
  style,
  modalRef,
  inputValue,
  inputColorValue,
  onChange,
  onColorChange,
  onKeyDown,
  inputRef,
  onClickCancel,
  onClickSave,
  initialPositionX,
  initialPositionY,
}) => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const baseStyle: CSSProperties = {
    backgroundColor: "rgb(200 200 200 / 30%)",
    backdropFilter: "blur(5px)",
    padding: "20px",
    border: "1px solid transparent",
    borderRadius: "5px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "150px",
    width: "300px",
    boxShadow: "5px 5px 35px 1px grey",
    color: "black",
    position: "fixed",
    top: `${y}px`,
    left: `${x}px`,
  };

  const buttonStyle: CSSProperties = {
    borderRadius: "5px",
    border: "1px solid transparent",
    padding: "5px",
    marginRight: "5px",
    width: "100px",
    fontSize: "15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const cancelButtonStyle: CSSProperties = {
    backgroundColor: "rgb(216 206 207)",
  };

  const saveButtonStyle: CSSProperties = {
    backgroundColor: "rgba(206, 216, 206)",
  };

  const combinedStyle: CSSProperties = { ...baseStyle, ...style };

  useEffect(() => {
    if (modalRef?.current) {
      const divRect = modalRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let newX = initialPositionX;
      let newY = initialPositionY;

      if (divRect.width + initialPositionX > windowWidth) {
        newX = windowWidth - divRect.width;
      }
      if (divRect.height + initialPositionY > windowHeight) {
        newY = windowHeight - divRect.height;
      }

      setX(newX);
      setY(newY);

      console.log("divRect", divRect);
      console.log("windowWidth", windowWidth);
      console.log("windowHeight", windowHeight);
      console.log("positionX", initialPositionX);
      console.log("positionY", initialPositionY);
    }
  }, [modalRef, initialPositionX, initialPositionY]);

  return (
    <div className="message-modal" ref={modalRef} style={combinedStyle}>
      <span
        style={{
          alignSelf: "center",
          fontSize: "20px",
        }}>
        New message
      </span>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "30px",
        }}>
        <input
          type="text"
          value={inputValue}
          onChange={onChange ? (e) => onChange(e) : undefined}
          onKeyDown={onKeyDown ? (e) => onKeyDown(e) : undefined}
          ref={inputRef}
          style={{
            borderRadius: "5px",
            border: "1px solid",
            padding: "5px",
            height: "100%",
            width: "100%",
            fontSize: "15px",
          }}
        />
        <input
          style={{
            borderRadius: "5px",
            height: "100%",
            marginLeft: "5px",
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
          type="color"
          value={inputColorValue}
          onChange={onColorChange ? (e) => onColorChange(e) : undefined}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
        }}>
        <button
          onClick={onClickCancel ? (e) => onClickCancel(e) : undefined}
          style={{ ...cancelButtonStyle, ...buttonStyle }}
          className="button">
          <CancelIcon
            style={{
              fontSize: "25px",
              color: redColor,
            }}
          />{" "}
          Cancel
        </button>
        <button
          onClick={onClickSave ? (e) => onClickSave(e) : undefined}
          style={{ ...saveButtonStyle, ...buttonStyle }}
          className="button">
          <CheckCircleIcon
            style={{
              fontSize: "25px",
              color: greenColor,
            }}
          />{" "}
          Save
        </button>
      </div>
    </div>
  );
};

export default MessageModal;
