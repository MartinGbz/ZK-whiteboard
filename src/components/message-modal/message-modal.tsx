"use client";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { TextareaAutosize } from "@mui/base";
import { MAX_CHARACTERS, greenColor, redColor } from "@/configs/configs";

interface MessageModalProps {
  style?: CSSProperties;
  containerRef?: React.RefObject<HTMLDivElement>;
  inputValue?: string;
  inputColorValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onColorChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  onClickCancel?: () => void;
  onClickSave?: () => void;
  initialPositionX: number;
  initialPositionY: number;
}

const MessageModal: React.FC<MessageModalProps> = ({
  style,
  containerRef,
  inputValue,
  inputColorValue,
  onChange,
  onColorChange,
  inputRef,
  onClickCancel,
  onClickSave,
  initialPositionX,
  initialPositionY,
}) => {
  const [x, setX] = useState(-1000);
  const [y, setY] = useState(-1000);
  const [maxCharacters, setMaxCharacters] = useState(false);
  const [saveButtonBrightness, setSaveButtonBrightness] =
    useState("brightness(1)");
  const [cancelButtonBrightness, setCancelButtonBrightness] =
    useState("brightness(1)");

  const modalRef = useRef<HTMLDivElement>(null);

  const baseStyle: CSSProperties = {
    backgroundColor: "rgb(200 200 200 / 30%)",
    backdropFilter: "blur(15px)",
    padding: "15px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
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
    width: "100px",
    fontSize: "15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const cancelButtonStyle: CSSProperties = {
    backgroundColor: "rgb(216 206 207)",
    filter: cancelButtonBrightness,
  };

  const saveButtonStyle: CSSProperties = {
    backgroundColor: "rgba(206, 216, 206)",
    filter: saveButtonBrightness,
  };

  const combinedStyle: CSSProperties = { ...baseStyle, ...style };

  useEffect(() => {
    if (modalRef?.current && containerRef?.current) {
      const divRect = modalRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      let newX = initialPositionX - divRect.width / 2;
      let newY = initialPositionY - divRect.height / 2;

      if (divRect.width / 2 + initialPositionX > containerRect.width) {
        newX = containerRect.width - divRect.width;
      }
      if (initialPositionX - divRect.width / 2 < 0) {
        newX = 0;
      }
      if (divRect.height / 2 + initialPositionY > containerRect.height) {
        // need to add 8px (I don't know where this gap comes from)
        newY = containerRect.height - divRect.height - 8;
      }
      if (initialPositionY - divRect.height / 2 < 0) {
        newY = 0;
      }

      setX(newX);
      setY(newY);
    }
  }, [modalRef, initialPositionX, initialPositionY, containerRef]);

  const textAreaOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    }
    if (e.target.value.length > MAX_CHARACTERS) {
      setMaxCharacters(true);
      setSaveButtonBrightness("brightness(0.8)");
    } else {
      setMaxCharacters(false);
      setSaveButtonBrightness("brightness(1)");
    }
  };

  const textAreaOnKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!maxCharacters) {
        if (onClickSave) {
          onClickSave();
        }
      }
    } else if (e.key === "Escape") {
      if (onClickCancel) {
        onClickCancel();
      }
    }
  };

  return (
    <div
      className="message-modal"
      ref={modalRef}
      style={combinedStyle}
      onClick={(e) => {
        e.stopPropagation();
      }}>
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
          flexDirection: "column",
          margin: "5px",
          marginBottom: "10px",
        }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
          <TextareaAutosize
            value={inputValue}
            onChange={(e) => textAreaOnChange(e)}
            onKeyDown={(e) => textAreaOnKeyDown(e)}
            ref={inputRef}
            style={{
              borderRadius: "5px",
              border: "1px solid",
              padding: "5px",
              fontSize: "15px",
            }}
          />
          <input
            style={{
              borderRadius: "5px",
              backgroundColor: "transparent",
              cursor: "pointer",
              alignSelf: "center",
            }}
            type="color"
            value={inputColorValue}
            onChange={onColorChange ? (e) => onColorChange(e) : undefined}
          />
        </div>
        {
          <span
            style={{
              fontSize: "10px",
              color: "red",
              marginTop: "5px",
              display: maxCharacters ? "block" : "none",
            }}>
            Maximum message length is {MAX_CHARACTERS} characters.
          </span>
        }
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
        }}>
        <button
          onClick={
            onClickCancel
              ? (e) => {
                  e.stopPropagation();
                  onClickCancel();
                }
              : undefined
          }
          onMouseEnter={() => setCancelButtonBrightness("brightness(1.05)")}
          onMouseLeave={() => setCancelButtonBrightness("brightness(1)")}
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
          onClick={
            onClickSave
              ? (e) => {
                  e.stopPropagation();
                  onClickSave();
                }
              : undefined
          }
          onMouseEnter={() => setSaveButtonBrightness("brightness(1.05)")}
          onMouseLeave={() => setSaveButtonBrightness("brightness(1)")}
          style={{ ...saveButtonStyle, ...buttonStyle }}
          className="button"
          disabled={maxCharacters}>
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
