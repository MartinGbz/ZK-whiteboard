"use client";
import React, { CSSProperties } from "react";
import { MAX_Z_INDEX, redColor } from "@/configs/configs";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useRouter, usePathname } from "next/navigation";

interface ErrorModalProps {
  text: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ text }) => {
  const modalStyle: CSSProperties = {
    backgroundColor: "white",
    marginBottom: "10px",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "5px",
    height: "10h",
    width: "40vh",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  };

  const messageStyle: CSSProperties = {
    textAlign: "center",
    color: "black",
    minHeight: "150px",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      style={{
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        width: "100%",
        height: "100%",
        position: "absolute",
        zIndex: MAX_Z_INDEX + 3,
      }}>
      <div style={modalStyle}>
        <div>
          <div
            style={{
              backgroundColor: redColor,
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              textAlign: "center",
              height: "50px",
              borderTopLeftRadius: "5px",
              borderTopRightRadius: "5px",
            }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                color: "white",
                fontSize: "20px",
              }}>
              {" "}
              <ErrorOutlineIcon
                style={{
                  color: "white",
                  marginRight: "5px",
                }}
              />
              Error
            </div>
          </div>
          <div style={messageStyle}>
            <p
              style={{
                fontSize: "18px",
                minHeight: "50px",
                height: "fit-content",
                marginBottom: "25px",
                fontFamily: "Inter-Regular",
              }}>
              {text}
            </p>
            <div
              style={{
                backgroundColor: redColor,
                color: "white",
                padding: "5px 10px 5px 10px",
                borderRadius: "5px",
                border: "none",
                alignSelf: "center",
                fontSize: "17px",
              }}>
              Please refresh the page: ⌘+R
            </div>
            <p
              style={{
                fontSize: "10px",
                marginTop: "10px",
                fontFamily: "Inter-Regular",
              }}>
              {" "}
              If the issue persists, please contact{" "}
              <a
                style={{
                  textDecoration: "underline",
                }}
                href="https://twitter.com/0xMartinGbz">
                0xMartinGbz
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
