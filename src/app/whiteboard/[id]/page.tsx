import { Metadata } from "next";
import "./page.css";

import Whiteboard from "@/components/whiteboard/whiteboard";

interface pageProps {
  params: { id: number };
}

export async function generateMetadata({
  params,
}: pageProps): Promise<Metadata> {
  return {
    // return your metadata here
    // title: "ZK-whiteboard",
    // description: "Express yourself freely & anonymously",
    // ...
    // <meta property="og:image" content={`https://next-dynamic-og-image.vercel.app/api/og?title=${title}`} />
    openGraph: {
      // title: "Next.js",
      // description: "The React Framework for the Web",
      url: "https://nextjs.org",
      siteName: "Next.js",
      images: [
        {
          url:
            "https://zk-whiteboard.vercel.app/api/og?whiteboardId=" + params.id,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "ZK-whiteboard",
      description: "Express yourself freely & anonymously",
      // siteId: '1467726470533754880',
      // creator: '@nextjs',
      // creatorId: '1467726470533754880',
      images: [
        "https://zk-whiteboard.vercel.app/api/og?whiteboardId=" + params.id,
      ],
    },
  };
}

const page = ({ params }: pageProps) => {
  return <Whiteboard params={params} />;
};

export default page;
