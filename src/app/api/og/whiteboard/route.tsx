import { Whiteboard } from "@prisma/client";
import axios from "axios";
import { ImageResponse } from "next/server";
// App router includes @vercel/og.
// No need to install it.
import React from "react";
// import JsxParser from "react-jsx-parser";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const whiteboardId = searchParams.get("whiteboardId");
  console.log(whiteboardId);

  // const inter = fetch(
  //   new URL("../../public/fonts/Inter-Regular.woff2", import.meta.url) + ""
  // ).then((res) => res.arrayBuffer());

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

  // let w = `<div class="messages_container" style="cursor: pointer; position: relative; overflow: scroll;"><div class="message hoverable" style="background-color: rgba(221, 221, 221, 0.9); z-index: 999; top: 477.5px; left: 570px; --shadow-color: #dddddd; font-size: 19.85px; overflow-wrap: break-word; position: absolute;"><div>hey</div><div style="display: flex; justify-content: flex-end;"><div title="0x00" style="font-size: 10px; font-weight: normal; font-family: Inter-Regular; white-space: nowrap;">from: 0x00...</div></div><div class="buttons-container" style="position: absolute; display: flex; right: -15px; top: -15px;"><button class="top-button reaction-button" style="z-index: 1001; opacity: 0; transform: scale(1); background-color: rgb(94, 202, 126);"><span class="emoji-animation">👍</span><span class="count">2</span></button><button class="top-button reaction-button" style="z-index: 1001; opacity: 0; transform: scale(1); background-color: rgb(130, 165, 255);"><span class="emoji-animation">💜</span></button><button class="top-button reaction-button" style="z-index: 1001; opacity: 0; transform: scale(1); background-color: rgb(130, 165, 255);"><span class="emoji-animation">👌</span></button></div></div><div class="message hoverable" style="background-color: rgba(141, 91, 215, 0.9); z-index: 965; animation: 5s linear 0s infinite normal none running shine; top: 705.5px; left: 323px; --shadow-color: #8d5bd7; font-size: 19.8px; overflow-wrap: break-word; position: absolute;"><div>gang</div><div style="display: flex; justify-content: flex-end;"><div title="0x1ccb1b27b6043be6af3ecc9920402cdc53aa08f0d6be54c5e519964b353ade68" style="font-size: 10px; font-weight: normal; font-family: Inter-Regular; white-space: nowrap;">from: You</div></div><button class="top-button delete-button" style="z-index: 1001; opacity: 0; transform: scale(1); background-color: rgb(255, 86, 86);"><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DeleteIcon" style="color: white; font-size: 15px;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg></button></div></div>`

  // const parser = new DOMParser();
  // const html = parser.parseFromString(whiteboard, "text/html");

  // return new ImageResponse(<JsxParser jsx={w} />, {
  //   width: 1200,
  //   height: 630,
  // });

  // const a = new URL(
  //   "../../../medias/icons/ZK-whiteboard-500x500.png",
  //   import.meta.url
  // ).toString();

  // console.log("aaaaa");
  // console.log(a);

  const url = process.env.WEBSITE_DOMAIN + "/api/whiteboard";
  console.log("--url");
  console.log(url);
  // const response = await axios.post(url, whiteboardId);

  const response = await fetch(url, {
    method: "POST",
    body: whiteboardId,
  });

  // const response = await fetch(new URL("../whiteboard/" + whiteboardId));
  // const response = await fetch("../whiteboard/" + whiteboardId).then((res) => {
  //   console.log(res);
  //   const a = res.json();
  //   console.log(a);
  // });
  console.log(response);
  const whiteboard: Whiteboard = await response.json();

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
          // minWidth: "100%",
          // minHeight: "100%",
          // flexWrap: "wrap",
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
              // fontSize: whiteboard.name.length > 20 ? 40 : 60,
              fontSize:
                whiteboard.name.length > 23
                  ? 30
                  : whiteboard.name.length > 18
                  ? 40
                  : 50,
              // fontSize:
              //   "mmMMmmMMmmPPmmOOmmQ".length > 23
              //     ? 30
              //     : "mmMMmmMMmmPPmmOOmmQ".length > 18
              //     ? 40
              //     : 50,
            }}>
            {/* {"/" + whiteboard.name ?? "whiteboard"} */}
            {whiteboard.name ?? "whiteboard"}
            {/* {"mmmmOOmmmmmmMMmmmmDDmmmMMmmmmm"} */}
            {/* {"whiteboard whiteboard whiteboard mmm"} */}
          </span>
        </div>
        {/* {whiteboard ?? "hello, world"} */}
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

//  <div class="messages_container" style="cursor: pointer; position: relative; overflow: scroll;"><div class="message hoverable" style="background-color: rgba(221, 221, 221, 0.9); z-index: 999; top: 477.5px; left: 570px; --shadow-color: #dddddd; font-size: 19.85px; overflow-wrap: break-word; position: absolute;"><div>hey</div><div style="display: flex; justify-content: flex-end;"><div title="0x00" style="font-size: 10px; font-weight: normal; font-family: Inter-Regular; white-space: nowrap;">from: 0x00...</div></div><div class="buttons-container" style="position: absolute; display: flex; right: -15px; top: -15px;"><button class="top-button reaction-button" style="z-index: 1001; opacity: 0; transform: scale(1); background-color: rgb(94, 202, 126);"><span class="emoji-animation">👍</span><span class="count">2</span></button><button class="top-button reaction-button" style="z-index: 1001; opacity: 0; transform: scale(1); background-color: rgb(130, 165, 255);"><span class="emoji-animation">💜</span></button><button class="top-button reaction-button" style="z-index: 1001; opacity: 0; transform: scale(1); background-color: rgb(130, 165, 255);"><span class="emoji-animation">👌</span></button></div></div><div class="message hoverable" style="background-color: rgba(141, 91, 215, 0.9); z-index: 965; animation: 5s linear 0s infinite normal none running shine; top: 705.5px; left: 323px; --shadow-color: #8d5bd7; font-size: 19.8px; overflow-wrap: break-word; position: absolute;"><div>gang</div><div style="display: flex; justify-content: flex-end;"><div title="0x1ccb1b27b6043be6af3ecc9920402cdc53aa08f0d6be54c5e519964b353ade68" style="font-size: 10px; font-weight: normal; font-family: Inter-Regular; white-space: nowrap;">from: You</div></div><button class="top-button delete-button" style="z-index: 1001; opacity: 0; transform: scale(1); background-color: rgb(255, 86, 86);"><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DeleteIcon" style="color: white; font-size: 15px;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg></button></div></div>

// aaaaaaaaaaaaaaaaeeeeeaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaddddddaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaacccccaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab
