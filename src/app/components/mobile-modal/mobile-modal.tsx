"use client";
import { MAX_Z_INDEX } from "@/app/configs/configs";
import { useEffect, useState } from "react";

export const MobileModal = () => {
  const [isDisplay, setIsDisplay] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 800) {
      console.log("isDisplay");
      setIsDisplay(true);
    }
    function resizeHandler() {
      if (window.innerWidth < 800) {
        setIsDisplay(true);
      } else {
        setIsDisplay(false);
      }
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", resizeHandler);
    }
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", resizeHandler);
      }
    };
  }, []);

  useEffect(() => {
    const html: any = document.getElementsByTagName("HTML")[0];
    if (isDisplay) {
      html.style.overflowX = "hidden";
      html.style.overflowY = "hidden";
    } else {
      html.style.overflowX = "initial";
      html.style.overflowY = "initial";
    }
  }, [isDisplay]);

  if (!isDisplay) return;

  return (
    <div
      style={{
        position: "fixed",
        zIndex: MAX_Z_INDEX + 10,
        width: "100vw",
        height: "100vh",
        background: "rgb(170 170 170 / 50%)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
      <div
        style={{
          height: "fit-content",
          width: "fit-content",
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "rgb(0 0 0 / 25%) 0px 1px 15px 2px",
          textAlign: "center",
        }}>
        <p>
          {"Mobiles are not supported yet :("}
          <br />
          {"Try it on desktop 👍"}
        </p>
      </div>
    </div>
  );
};
