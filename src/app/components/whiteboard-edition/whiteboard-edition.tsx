"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Whiteboard } from "@/app/types/whiteboard-types";
// import "./whiteboards-index.css";

const WhiteboardEdition = () => {
  const router = useRouter();
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);

  useEffect(() => {}, []);

  return <div className="container">gang gang</div>;
};

export default WhiteboardEdition;
