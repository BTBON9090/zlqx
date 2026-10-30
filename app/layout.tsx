import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { AppProvider } from "@/lib/store";
import { ThemeProvider } from "@/lib/theme";
import { ConfirmProvider } from "@/components/ui/confirm";
import "./globals.css";

export const metadata: Metadata = {
  title: "智聘千寻 · AI 招聘工作台",
  description:
    "智聘千寻是面向中大型企业的 AI 招聘管理平台，覆盖职位、候选人、面试、Offer、组织权限与 AI 招聘助手。",
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="mono" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ConfirmProvider>
            <AppProvider>{children}</AppProvider>
          </ConfirmProvider>
          <Toaster
            position="top-center"
            closeButton
            toastOptions={{
              style: {
                background: "#ffffff",
                border: "1px solid var(--line)",
                borderRadius: "12px",
                color: "var(--ink)",
                fontSize: "12.5px",
                boxShadow: "0 20px 50px -24px rgba(0,0,0,.24)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
