"use client";
import React, { CSSProperties } from "react";

interface MessageModalProps {
  style?: CSSProperties;
  modalRef?: React.RefObject<HTMLDivElement>;
  inputValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  onClickCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClickSave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const MessageModal: React.FC<MessageModalProps> = ({
  style,
  modalRef,
  inputValue,
  onChange,
  onKeyDown,
  inputRef,
  onClickCancel,
  onClickSave,
}) => {
  const baseStyle: CSSProperties = {
    backgroundColor: "rgb(200 200 200 / 30%)",
    backdropFilter: "blur(4px)",
    padding: "20px",
    border: "1px solid transparent",
    borderRadius: "5px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "150px",
    boxShadow: "5px 5px 15px 1px grey",
  };

  const buttonStyle: CSSProperties = {
    borderRadius: "5px",
    border: "1px solid transparent",
    padding: "5px",
    marginRight: "5px",
  };

  const cancelButtonStyle: CSSProperties = {
    backgroundColor: "rgb(216 206 207)"
  }

  const saveButtonStyle: CSSProperties = {
    backgroundColor: "rgba(206, 216, 206)"
  }

  const combinedStyle: CSSProperties = { ...baseStyle, ...style };

  return (
    <div className="message-modal" ref={modalRef} style={combinedStyle}>
      <h3>New message</h3>
      <div style={{
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
          style={{ borderRadius: "5px", border: "1px solid", padding: "5px", height: "100%" }}
        />
        <input style={{ borderRadius: "5px", height: "100%"}} type="color" defaultValue={"whitesmoke"}/>
      </div>
      <div style={{
        display: "flex",
        flexDirection: "row",
      }}>
        <button onClick={onClickCancel ? (e) => onClickCancel(e) : undefined} style={{...cancelButtonStyle, ...buttonStyle}}>
          ❌ Cancel
        </button>
        <button onClick={onClickSave ? (e) => onClickSave(e) : undefined} style={{...saveButtonStyle, ...buttonStyle}}>
          ✅ Save
        </button>
      </div>
    </div>
  );
};

export default MessageModal;
