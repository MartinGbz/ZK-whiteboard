// import { MobileModal } from "./components/mobile-modal/mobile-modal";
// import Whiteboard from "./components/whiteboard/whiteboard";
// import WhiteboardsIndex from "./components/whiteboards-index/whiteboards-index";

import { MobileModal } from "@/app/components/mobile-modal/mobile-modal";
import Whiteboard from "@/app/components/whiteboard/whiteboard";
import { useParams } from "next/navigation";

import "../../page.css";

// import React from "react";

interface pageProps {
  params: { id: number };
}

const page = ({ params }: pageProps) => {
  // console.log("searchParams", params);
  return (
    <div>
      <MobileModal />
      <Whiteboard whiteboardId={params.id} />
    </div>
  );
};

export default page;
