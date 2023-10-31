import WhiteboardCreationEdition from "@/components/whiteboard-creation-edition/whiteboard-creation-edition";
import { Metadata } from "next";
import Head from "next/head";

// export async function generateMetadata(): Promise<Metadata> {
//   return {
//     // return your metadata here
//     // title: "ZK-whiteboard",
//     // description: "Express yourself freely & anonymously",
//     // ...
//     // <meta property="og:image" content={`https://next-dynamic-og-image.vercel.app/api/og?title=${title}`} />
//     openGraph: {
//       // title: "Next.js",
//       // description: "The React Framework for the Web",
//       url: "https://nextjs.org",
//       siteName: "Next.js",
//       images: [
//         {
//           url: "https://nextjs.org/og.png",
//         },
//       ],
//     },
//   };
// }

const page = () => {
  return (
    <div>
      <WhiteboardCreationEdition />
    </div>
  );
};

export default page;
