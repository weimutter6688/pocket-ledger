import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import "./globals.css";
import NextAuthProvider from "@/components/next-auth-provider";

// 设置应用程序时区为中国时区
if (typeof process !== 'undefined') {
  process.env.TZ = 'Asia/Shanghai';
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "口袋记账 - 简单易用的记账工具",
  description: "一个移动优先的极简记账应用，让您轻松管理个人财务",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 获取服务器端会话
  const session = await getServerSession(authOptions);

  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextAuthProvider session={session}>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
