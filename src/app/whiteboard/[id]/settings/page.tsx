"use client";
import React from "react";

import WhiteboardCreationEdition from "@/components/whiteboard-creation-edition/whiteboard-creation-edition";

interface pageProps {
  params: { id: number };
}

const page = ({ params }: pageProps) => {
  return (
    <WhiteboardCreationEdition isEdition={true} whiteboardId={params.id} />
  );
};

export default page;
