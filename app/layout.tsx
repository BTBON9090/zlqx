import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { AppProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "智聘千寻 · AI 招聘工作台",
  description:
    "智聘千寻是面向中大型企业的 AI 招聘管理平台，覆盖职位、候选人、面试、Offer、组织权限与 AI 招聘助手。",
};

export const viewport: Viewport = {
  themeColor: "#072f27",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppProvider>{children}</AppProvider>
        <Toaster
          position="top-center"
          closeButton
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid #e2e7df",
              borderRadius: "12px",
              color: "#12201b",
              fontSize: "12.5px",
              boxShadow: "0 20px 50px -24px rgba(7,47,39,.3)",
            },
          }}
        />
      </body>
    </html>
  );
}
