"use client";
import React, { CSSProperties } from "react";

import "./button.css";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { greenColor, redColor } from "@/configs/configs";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  buttonType: string;
  title: string;
  onClick?: (e: any) => void;
  disabled?: boolean;
  style?: CSSProperties;
  fontSize?: string;
  iconSize?: string;
  iconSpace?: string;
  className?: string;
}

const Button = ({
  type = "button",
  buttonType,
  title,
  onClick,
  style,
  fontSize,
  iconSpace,
  disabled,
  className,
  iconSize,
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={"button-parent " + className}
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor:
          buttonType == "delete"
            ? redColor
            : buttonType == "validate" || buttonType == "create"
            ? greenColor
            : "white",
        cursor: "pointer",
        pointerEvents: "auto",
        ...style,
      }}>
      <div
        style={{
          fontSize: fontSize ?? "",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        {buttonType == "validate" && (
          <CheckCircleOutlineIcon
            className="icon"
            style={{
              fontSize: iconSize ? iconSize : fontSize ? fontSize : "",
              marginRight: iconSpace ?? "2px",
            }}
          />
        )}
        {buttonType == "create" && (
          <AddIcon
            className="icon"
            style={{
              fontSize: iconSize ? iconSize : fontSize ? fontSize : "",
              marginRight: iconSpace ?? "2px",
            }}
          />
        )}
        {buttonType == "delete" && (
          <DeleteOutlineIcon
            className="icon"
            style={{
              fontSize: iconSize ? iconSize : fontSize ? fontSize : "",
              marginRight: iconSpace ?? "2px",
            }}
          />
        )}
        {title}
      </div>
    </button>
  );
};

export default Button;
