import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "米粒拼豆社",
  description: "给米粒的拼豆图纸与触控游戏：完整图案、逐颗挑战、作品收藏。",
  manifest: "/manifest.webmanifest",
  applicationName: "米粒拼豆社",
  appleWebApp: { capable: true, title: "米粒拼豆", statusBarStyle: "default" },
  openGraph: { title: "米粒拼豆社", description: "把小豆子拼成大冒险。", images: ["/og-v2.png"] },
  twitter: { card: "summary_large_image", title: "米粒拼豆社", description: "把小豆子拼成大冒险。", images: ["/og-v2.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
