"use client";
import React, { CSSProperties } from "react";
import "./loading-modal.css";

const Loading: React.FC = () => {

  const style: CSSProperties = {
    backgroundColor: "#514f4f",
    padding: "10px",
    marginBottom: "10px",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "5px",
    color: "black",
    height: "200px",
    width: "400px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  };

  return (
    <div style={style}>
      <h1
      style={{
        textAlign: "center",
        marginBottom: "20px",
        color: "white",
      }}>Checking the proof</h1>
      <div className="pl pl-leapfrog"></div>
    </div>
  );
};

export default Loading;
