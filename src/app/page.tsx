import Whiteboard from "./component/whiteboard/whiteboard";
import Head from "next/head";
import "./page.css";

export default function Home() {
  return (
    <>
      {/* <Head>
        <title> Whiteboard </title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,900&display=swap"
          rel="stylesheet"
        />
      </Head> */}
      <Whiteboard />
    </>
  );
}
