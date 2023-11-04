import "./globals.css";
import { Inter } from "next/font/google";
import { GlobalContextProvider } from "@/context/login-context";
import Header from "@/components/header/header";
import { ToastProvider } from "@/providers/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ZK-whiteboard",
  description:
    "Powered by Sismo. Create ZK Proofs using Sismo Connect to post a message. Express yourself freely & anonymously.",
  openGraph: {
    title: "ZK-whiteboard",
    description: "Express yourself freely & anonymously",
    type: "website",
    image: process.env.WEBSITE_DOMAIN + "/api/og/default",
    url: process.env.WEBSITE_DOMAIN,
    site_name: "zk-whiteboard",
  },
  twitter: {
    title: "ZK-whiteboard",
    description: "Express yourself freely & anonymously",
    creator: "@0xMartinGbz",
    image: process.env.WEBSITE_DOMAIN + "/api/og/default",
    url: process.env.WEBSITE_DOMAIN,
  },
  metadataBase: new URL(process.env.WEBSITE_DOMAIN ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="./favicon.ico" />
      </head>
      <body className={inter.className}>
        <GlobalContextProvider>
          <div className="main-container">
            <Header />
            <div className="children-container">{children}</div>
          </div>
          <ToastProvider />
        </GlobalContextProvider>
      </body>
    </html>
  );
}
