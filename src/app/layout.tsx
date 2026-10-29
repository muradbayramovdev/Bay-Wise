import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { QuickAddProvider } from "@/context/QuickAddContext";

export const metadata: Metadata = {
  title: "BayWise — Kişisel Finans Takibi",
  description: "Basit ve hızlı kişisel finans yönetimi",
};

// Runs before React hydration to prevent flash
const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('theme');
      var preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      var theme = stored || preferred;
      if (theme === 'dark') document.documentElement.classList.add('dark');
    } catch(e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <QuickAddProvider>
            <ToastProvider>{children}</ToastProvider>
          </QuickAddProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
