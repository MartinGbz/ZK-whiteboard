"use client";
import React, { CSSProperties, use, useEffect, useState } from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { TextareaAutosize } from "@mui/base";
import { MAX_CHARACTERS, greenColor, redColor } from "@/app/configs/configs";
import "./message-modal.css";

interface MessageModalProps {
  style?: CSSProperties;
  modalRef?: React.RefObject<HTMLDivElement>;
  inputValue?: string;
  inputColorValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
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
  const [maxCharacters, setMaxCharacters] = useState(false);
  // const [cancelButtonColor, setCancelButtonColor] = useState("rgb(216 206 207)")
  // const [saveButtonColor, setSaveButtonColor] = useState("rgba(206, 216, 206)")
  const [saveButtonBrightness, setSaveButtonBrightness] =
    useState("brightness(1)");
  const [cancelButtonBrightness, setCancelButtonBrightness] =
    useState("brightness(1)");
  // const [buttonNotHover, setButtonNotHover] = useState(1);
  // const [buttonDisable, setButtonDisable] = useState(0.95);

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
    // marginRight: "5px",
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

  const onTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    }
    if (e.target.value.length > MAX_CHARACTERS) {
      console.log("too long");
      // console.log(inputValue.length);
      console.log(e.target.value.length);
      setMaxCharacters(true);
      setSaveButtonBrightness("brightness(0.8)");
      console.log(setSaveButtonBrightness);
    } else {
      setMaxCharacters(false);
      setSaveButtonBrightness("brightness(1)");
      console.log(setSaveButtonBrightness);
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
            // height: "30px",
            // flex: "1 1 auto",
          }}>
          {/* <input
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
        /> */}
          {/* <TextareaAutosize
          value={inputValue}
          onChange={onChange ? (e) => onChange(e) : undefined}
          onKeyDown={onKeyDown ? (e) => onKeyDown(e) : undefined}
          ref={inputRef}
          style={{
            borderRadius: "5px",
            border: "1px solid",
            padding: "5px",
            display: "block",
            // height: "100%",
            // width: "100%",
            fontSize: "15px",
          }}
        /> */}
          {/* <div
          style={{
            width: "100%",
            alignSelf: "center",
            margin: "10px",
            display: "flex",
            flexDirection: "column",
          }}> */}
          {/* <textarea
            value={inputValue}
            onChange={(e) => onTextAreaChange(e)}
            onKeyDown={onKeyDown ? (e) => onKeyDown(e) : undefined}
            ref={inputRef}
            style={{
              borderRadius: "5px",
              border: "1px solid",
              padding: "5px",
              fontSize: "15px",
            }}
          /> */}
          <TextareaAutosize
            value={inputValue}
            onChange={(e) => onTextAreaChange(e)}
            onKeyDown={onKeyDown ? (e) => onKeyDown(e) : undefined}
            ref={inputRef}
            style={{
              borderRadius: "5px",
              border: "1px solid",
              padding: "5px",
              fontSize: "15px",
            }}
          />
          {/* </div> */}
          <input
            style={{
              borderRadius: "5px",
              // height: "100%",
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
          onClick={onClickCancel ? (e) => onClickCancel(e) : undefined}
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
          onClick={onClickSave ? (e) => onClickSave(e) : undefined}
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
