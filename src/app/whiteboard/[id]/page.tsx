import { Metadata } from "next";

import Whiteboard from "@/components/whiteboard/whiteboard";
import { getWhiteboard } from "@/lib/whiteboard";
import { notFound } from "next/navigation";

interface pageProps {
  params: { id: number };
}

export async function generateMetadata({
  params,
}: pageProps): Promise<Metadata> {
  return {
    openGraph: {
      title: "ZK-whiteboard",
      description: "Express yourself freely & anonymously",
      siteName: "zk-whiteboard",
      type: "website",
      images: [
        {
          url:
            process.env.WEBSITE_DOMAIN +
            "/api/og/whiteboard/?whiteboardId=" +
            params.id,
        },
      ],
      url: process.env.WEBSITE_DOMAIN,
    },
    twitter: {
      card: "summary_large_image",
      title: "ZK-whiteboard",
      description: "Express yourself freely & anonymously",
      creator: "@0xMartinGbz",
      images: [
        process.env.WEBSITE_DOMAIN +
          "/api/og/whiteboard?whiteboardId=" +
          params.id,
      ],
    },
  };
}

const page = async ({ params }: pageProps) => {
  if (isNaN(params.id)) return notFound();
  const whiteboard = await getWhiteboard(params.id);
  return <Whiteboard whiteboard={whiteboard} />;
};

export default page;
