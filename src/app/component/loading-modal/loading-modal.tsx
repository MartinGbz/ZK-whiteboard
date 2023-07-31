"use client";
import React, { CSSProperties } from "react";
import "./loading-modal.css";
import { MAX_Z_INDEX } from "@/app/configs/configs";

interface LoadingProps {
  // isVerifying: boolean;
  text: string;
}

const Loading: React.FC<LoadingProps> = ({ text }) => {
  const loadingStyle: CSSProperties = {
    backgroundColor: "#514f4f",
    padding: "10px",
    marginBottom: "10px",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "5px",
    color: "black",
    height: "10h",
    width: "40vh",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  };

  const titleStyle: CSSProperties = {
    textAlign: "center",
    marginBottom: "20px",
    color: "white",
  };

  return (
    <div
      style={{
        backdropFilter: "blur(10px)",
        width: "100%",
        height: "100%",
        position: "absolute",
        // display: isVerifying ? "flex" : "none",
        zIndex: MAX_Z_INDEX + 3,
      }}>
      <div style={loadingStyle}>
        <div>
          <h1 style={titleStyle}>{text}</h1>
          <div className="pl pl-leapfrog"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
