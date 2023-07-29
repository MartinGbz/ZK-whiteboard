import Whiteboard from "./component/whiteboard/whiteboard";
import Head from "next/head";
import "./page.css";

export default function Home() {
  return (
    <>
      <Head>
        <title> Whiteboard </title>
      </Head>
      <Whiteboard />
    </>
  );
}
