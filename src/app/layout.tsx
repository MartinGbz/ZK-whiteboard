import "./globals.css";
import { Inter } from "next/font/google";
import { MobileModal } from "@/components/mobile-modal/mobile-modal";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ZK-whiteboard",
  description: "Express yourself freely & anonymously",
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
        <title>{metadata.title}</title>
      </head>
      <body className={inter.className}>
        <MobileModal />
        {children}
      </body>
    </html>
  );
}
