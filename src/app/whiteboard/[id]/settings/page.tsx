// "use client";
import React from "react";

import WhiteboardCreationEdition from "@/components/whiteboard-creation-edition/whiteboard-creation-edition";
import { getWhiteboard } from "@/lib/whiteboard";
import { notFound } from "next/navigation";
import { fetchGroups } from "@/lib/groups";

interface pageProps {
  params: { id: number };
}

const page = async ({ params }: pageProps) => {
  if (isNaN(params.id)) return notFound();
  const whiteboard = await getWhiteboard(params.id);
  const groups = await fetchGroups();
  return (
    <WhiteboardCreationEdition
      isEdition={true}
      whiteboard={whiteboard}
      groups={groups}
    />
  );
};

export default page;
