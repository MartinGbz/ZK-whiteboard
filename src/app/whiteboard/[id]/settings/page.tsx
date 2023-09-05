"use client";
import { MobileModal } from "@/app/components/mobile-modal/mobile-modal";
import WhiteboardCreation from "@/app/components/whiteboard-creation/whiteboard-creation";
import WhiteboardEdition from "@/app/components/whiteboard-edition/whiteboard-edition";
import { Whiteboard } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter, withRouter } from "next/router";
import React from "react";

import "../../../page.css";

interface pageProps {
  params: { id: number };
}

const page = ({ params }: pageProps) => {
  // const router = useRouter();

  // useEffect(() => {
  //   console.log("hey");
  //   // const whiteboard = router.query;
  //   console.log(whiteboard);
  // });

  return (
    <div>
      <MobileModal />
      <WhiteboardCreation isEdition={true} whiteboardId={params.id} />
    </div>
  );
};

export default page;
