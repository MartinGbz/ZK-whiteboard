"use client";
import React from "react";

import "../../../page.css";
import WhiteboardCreationEdition from "@/components/whiteboard-creation-edition/whiteboard-creation-edition";

interface pageProps {
  params: { id: number };
}

const page = ({ params }: pageProps) => {
  return (
    <div>
      <WhiteboardCreationEdition isEdition={true} whiteboardId={params.id} />
    </div>
  );
};

export default page;
