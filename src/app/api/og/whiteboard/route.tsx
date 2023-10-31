import { Whiteboard } from "@prisma/client";
import { ImageResponse } from "next/server";
import React from "react";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const whiteboardId = searchParams.get("whiteboardId");

  const url = process.env.WEBSITE_DOMAIN + "/api/whiteboard";

  const response = await fetch(url, {
    method: "POST",
    body: whiteboardId,
  });

  const whiteboard: Whiteboard = await response.json();

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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Inter",
          flexDirection: "column",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%)",
          backgroundSize: "100px 100px",
        }}>
        <img src={image} style={{ width: "200px", height: "200px" }} />
        <div
          style={{
            fontSize: 80,
            marginTop: "80px",
          }}>
          Post a message on
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Inter",
            justifyItems: "center",
            alignItems: "center",
            fontSize: 50,
          }}>
          <span
            style={{
              fontFamily: "Damion",
              fontSize: 60,
            }}>
            Z
          </span>
          <span>K-whiteboard</span>
          <span
            style={{
              color: "gray",
            }}>
            /
          </span>
          <span
            style={{
              color: "gray",
              fontSize:
                whiteboard.name.length > 23
                  ? 30
                  : whiteboard.name.length > 18
                  ? 40
                  : 50,
            }}>
            {whiteboard.name ?? "whiteboard"}
          </span>
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
