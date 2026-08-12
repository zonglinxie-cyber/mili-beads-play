import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "米粒的拼豆助手",
  description: "复杂、好玩、带机关的私人拼豆图纸库，支持逐色陪拼、A4 打印和作品互动。",
  openGraph: { title: "米粒的拼豆助手", description: "会发光、会转，还会藏小秘密的拼豆图纸。", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "米粒的拼豆助手", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
