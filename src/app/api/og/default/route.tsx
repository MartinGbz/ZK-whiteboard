import { ImageResponse } from "next/server";
import React from "react";

export const runtime = "edge";

export async function GET(request: Request) {
  const inter = fetch(
    new URL("../../../../fonts/Inter/Inter-SemiBold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const damion = fetch(
    new URL("../../../../fonts/Damion-Regular.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const image = await fetch(
    new URL(
      "../../../../medias/icons/ZK-whiteboard-500x500.png",
      import.meta.url
    )
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          color: "black",
          background: "white",
          width: "100%",
          height: "100%",
          padding: "50px 200px",
          textAlign: "center",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Inter",
          display: "flex",
          flexDirection: "column",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%)",
          backgroundSize: "100px 100px",
        }}>
        <img src={image} style={{ width: "200px", height: "200px" }} />
        <div
          style={{
            display: "flex",
            fontFamily: "Inter",
            justifyItems: "center",
            alignItems: "center",
            fontSize: 100,
          }}>
          <span
            style={{
              fontFamily: "Damion",
              fontSize: 120,
            }}>
            Z
          </span>
          <span>K-whiteboard</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: await inter,
          weight: 400,
          style: "normal",
        },
        {
          name: "Damion",
          data: await damion,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}
