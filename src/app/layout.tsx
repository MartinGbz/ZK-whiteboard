import { usePathname } from "next/navigation";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ZK-whiteboard",
  description: "Express yourself freely & anonymously",
  metadataBase: new URL("localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // // wait for the page to load
  // if (document.readyState === "complete") {
  //   console.log("readyState is complete");
  //   // get the current html page into a string
  //   const html = document.documentElement.outerHTML;
  //   // create a new html document
  //   const parser = new DOMParser();
  //   const htmlDoc = parser.parseFromString(html, "text/html");
  //   // get the head element
  //   const head = htmlDoc.head;
  //   // get the body element
  //   const body = htmlDoc.body;

  //   const svg = satori(<div style={{ color: "black" }}>hello, world</div>, {
  //     width: 1200,
  //     height: 630,
  //     fonts: [
  //       {
  //         name: "Inter",
  //         data: inter,
  //         weight: 400,
  //         style: "normal",
  //       },
  //     ],
  //   });
  // } else {
  //   window.addEventListener("load", resolve);
  // }

  // const pathname = usePathname();
  // console.log("pathname");
  // console.log(pathname);

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="./favicon.ico" />
        <title>{metadata.title}</title>
        {/* <meta
          property="og:image"
          content="https://og-examples.vercel.sh/api/static"
        /> */}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
