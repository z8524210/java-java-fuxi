import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_SC } from "next/font/google";

import { PageShell } from "@/components/page-shell";
import "./globals.css";

const sans = Noto_Sans_SC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Java 面试速记",
    template: "%s · Java 面试速记",
  },
  description:
    "集合是容器，泛型是标签，Stream 是流水线，JVM 是它们跑起来的场地。每个专题内部有自己的主链。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}
