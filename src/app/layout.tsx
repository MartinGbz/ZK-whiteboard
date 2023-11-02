import { useLogin } from "@/hooks/useLogin";
import "./globals.css";
import { Inter } from "next/font/google";
import { GlobalContextProvider } from "@/context/login-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ZK-whiteboard",
  description:
    "Powered by Sismo. Create ZK Proofs using Sismo Connect to post a message. Express yourself freely & anonymously.",
  metadataBase: new URL(process.env.WEBSITE_DOMAIN ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const login = useLogin();
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="./favicon.ico" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={"ZK-whiteboard"} />
        <meta
          property="og:description"
          content={"Express yourself freely & anonymously"}
        />
        <meta property="og:type" content={"website"} />
        <meta
          property="og:image"
          content={process.env.WEBSITE_DOMAIN + "/api/og/default"}
        />
        <meta property="og:url" content={process.env.WEBSITE_DOMAIN} />
        <meta property="og:site_name" content={"zk-whiteboard"} />
        <meta name="twitter:title" content={"ZK-whiteboard"} />
        <meta
          name="twitter:description"
          content={"Express yourself freely & anonymously"}
        />
        <meta name="twitter:creator" content={"0xMartinGbz"} />
        <meta
          name="twitter:image"
          content={process.env.WEBSITE_DOMAIN + "/api/og/default"}
        />
        <meta name="twitter:url" content={process.env.WEBSITE_DOMAIN} />
      </head>
      <body className={inter.className}>
        <GlobalContextProvider>{children}</GlobalContextProvider>
      </body>
    </html>
  );
}
