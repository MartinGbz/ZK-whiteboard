"use client";
import React, { CSSProperties, useEffect, useRef, useState } from "react";

interface MessageModalProps {
  style?: CSSProperties;
  modalRef?: React.RefObject<HTMLDivElement>;
  inputValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  onClickCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClickSave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  // Autres attributs que tu souhaites utiliser
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
    backgroundColor: "whitesmoke",
    padding: "20px",
    border: "1px solid gray",
  };

  const combinedStyle: CSSProperties = { ...baseStyle, ...style };

  useEffect(() => {}, []);

  return (
    <div className="message-modal" ref={modalRef} style={combinedStyle}>
      <input
        type="text"
        value={inputValue}
        onChange={onChange ? (e) => onChange(e) : undefined}
        onKeyDown={onKeyDown ? (e) => onKeyDown(e) : undefined}
        ref={inputRef}
      />
      <button onClick={onClickCancel ? (e) => onClickCancel(e) : undefined}>
        {" "}
        Cancel{" "}
      </button>
      <button onClick={onClickSave ? (e) => onClickSave(e) : undefined}>
        {" "}
        Save{" "}
      </button>
    </div>
  );
};

export default MessageModal;
