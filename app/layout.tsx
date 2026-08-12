import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "米粒的拼豆助手",
  description: "给小小创作者的原创拼豆图纸库与作品魔法屋。",
  openGraph: { title: "米粒的拼豆助手", description: "把小小的豆子，拼成大大的快乐。", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "米粒的拼豆助手", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
