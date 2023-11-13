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
        <svg
          version="1.0"
          xmlns="http://www.w3.org/2000/svg"
          width="200pt"
          height="200pt"
          viewBox="0 0 500.000000 500.000000"
          preserveAspectRatio="xMidYMid meet">
          <g
            transform="translate(0.000000,500.000000) scale(0.100000,-0.100000)"
            fill="#000000"
            stroke="none">
            <path
              d="M380 4984 c-94 -25 -161 -64 -230 -133 -38 -39 -77 -90 -93 -123 -61
              -127 -57 20 -57 -2228 0 -2248 -4 -2104 57 -2230 35 -72 141 -177 215 -213
              127 -61 -20 -57 2228 -57 2248 0 2104 -4 2230 57 72 35 177 141 213 215 61
              127 57 -20 57 2228 0 2248 4 2104 -57 2230 -35 72 -141 177 -215 213 -127 61
              21 57 -2233 56 -1773 0 -2068 -2 -2115 -15z m1942 -1109 c79 -13 253 -52 388
              -85 279 -70 388 -82 570 -60 119 13 173 32 271 91 60 36 75 41 111 36 73 -10
              129 -67 130 -134 1 -70 -25 -106 -151 -205 -147 -117 -414 -383 -606 -603
              -176 -203 -935 -1110 -935 -1118 0 -3 17 -11 38 -17 20 -7 118 -54 217 -105
              230 -119 255 -128 376 -127 220 2 394 84 567 267 92 97 143 170 254 364 93
              162 115 183 197 184 93 1 212 -82 211 -148 -1 -31 -71 -192 -129 -297 -82
              -148 -178 -275 -296 -393 -252 -253 -553 -393 -852 -397 -106 -2 -130 8 -294
              112 -206 132 -342 183 -489 183 -164 0 -266 -41 -475 -192 -224 -161 -238
              -165 -315 -95 -56 51 -80 147 -51 203 11 20 309 272 416 351 163 120 386 378
              1241 1435 115 143 214 266 218 274 8 12 -6 13 -85 7 -122 -9 -189 1 -499 76
              -209 50 -275 62 -365 66 -134 5 -155 -2 -339 -112 -72 -42 -149 -82 -173 -89
              -38 -10 -46 -9 -70 9 -37 28 -48 67 -33 117 27 90 252 279 425 357 166 75 291
              86 527 45z"
            />
          </g>
        </svg>
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
