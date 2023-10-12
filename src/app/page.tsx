"use client";

import { redirect } from "next/navigation";
import "./page.css";

export default function Home() {
  redirect("/whiteboards");
}
