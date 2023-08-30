"use client";
import React, { CSSProperties, use, useEffect, useState } from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { TextareaAutosize } from "@mui/base";
import { MAX_CHARACTERS, greenColor, redColor } from "@/app/configs/configs";

interface MessageModalProps {
  style?: CSSProperties;
  modalRef?: React.RefObject<HTMLDivElement>;
  inputValue?: string;
  inputColorValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onColorChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  onClickCancel?: () => void;
  onClickSave?: () => void;
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
  inputRef,
  onClickCancel,
  onClickSave,
  initialPositionX,
  initialPositionY,
}) => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [maxCharacters, setMaxCharacters] = useState(false);
  const [saveButtonBrightness, setSaveButtonBrightness] =
    useState("brightness(1)");
  const [cancelButtonBrightness, setCancelButtonBrightness] =
    useState("brightness(1)");

  const baseStyle: CSSProperties = {
    backgroundColor: "rgb(200 200 200 / 30%)",
    backdropFilter: "blur(15px)",
    padding: "15px",
    border: "1px solid transparent",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "fit-content",
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
    }
  }, [modalRef, initialPositionX, initialPositionY]);

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
          onClick={onClickCancel ? (e) => onClickCancel() : undefined}
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
          onClick={onClickSave ? () => onClickSave() : undefined}
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
