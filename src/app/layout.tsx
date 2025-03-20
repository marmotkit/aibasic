import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI 技術演進學習平台",
  description: "體驗 AI 技術的發展歷程，從基礎對話到智能代理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <nav className="bg-gray-800 text-white p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              AI 學習平台
            </Link>
            <div className="flex gap-4">
              <Link href="/" className="hover:text-gray-300">
                首頁
              </Link>
              <a href="https://platform.openai.com/docs" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                文檔
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
