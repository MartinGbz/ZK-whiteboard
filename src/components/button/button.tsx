"use client";
import React, { CSSProperties } from "react";

import "./button.css";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { greenColor, redColor } from "@/configs/configs";

interface WhiteboardCreationEditionInputProps {
  type: string;
  title: string;
  onClick: (e: any) => void;
  disabled?: boolean;
  style?: CSSProperties;
  fontSize?: string;
  iconSize?: string;
  iconSpace?: string;
  className?: string;
}

const WhiteboardCreationEdition: React.FC<
  WhiteboardCreationEditionInputProps
> = ({
  type,
  title,
  onClick,
  style,
  fontSize,
  iconSpace,
  disabled,
  className,
  iconSize,
}) => {
  return (
    <button
      className={"button-parent " + className}
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor:
          type == "delete"
            ? redColor
            : type == "validate" || type == "create"
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
        {type == "validate" && (
          <CheckCircleOutlineIcon
            className="icon"
            style={{
              fontSize: iconSize ? iconSize : fontSize ? fontSize : "",
              marginRight: iconSpace ?? "2px",
            }}
          />
        )}
        {type == "create" && (
          <AddIcon
            className="icon"
            style={{
              fontSize: iconSize ? iconSize : fontSize ? fontSize : "",
              marginRight: iconSpace ?? "2px",
            }}
          />
        )}
        {type == "delete" && (
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

export default WhiteboardCreationEdition;
