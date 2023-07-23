"use client";
import React, { CSSProperties, useEffect, useState } from "react";
import "./loading-modal.css";

interface LoadingProps {
  isVerifying: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  isVerifying
}) => {

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

  const checkmarkStyle: CSSProperties = {
    textAlign: "center",
    fontSize: "50px",
  };

  return (
    <div style={{
      backdropFilter: "blur(10px)",
      width: "100%",
      height: "100%",
      position: "absolute",
      display: isVerifying ? "flex" : "none",
    }}>
      <div style={loadingStyle}>
        <div>
          <h1 style={titleStyle}>Checking the proof...</h1>
          <div className="pl pl-leapfrog"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
