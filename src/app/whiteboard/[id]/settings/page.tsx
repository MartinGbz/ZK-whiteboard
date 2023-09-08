"use client";
import { MobileModal } from "@/app/components/mobile-modal/mobile-modal";
import React from "react";

import "../../../page.css";
import WhiteboardCreationEdition from "@/app/components/whiteboard-creation-edition/whiteboard-creation-edition";

interface pageProps {
  params: { id: number };
}

const page = ({ params }: pageProps) => {
  return (
    <div>
      <MobileModal />
      <WhiteboardCreationEdition isEdition={true} whiteboardId={params.id} />
      {/* <div> AHHHHHH blfiur"bveîùvfbrejkm</div> */}
    </div>
  );
};

export default page;
