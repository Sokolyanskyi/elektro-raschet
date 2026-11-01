import type { Metadata, Viewport } from "next";
import { I18nProvider } from "@/components/i18n-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { ThemeProvider } from "@/components/theme-provider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Electricity — meter readings & payments",
  description:
    "Personal electricity bill calculator for day and night tariffs with multi-year meter reading and payment history.",
  applicationName: "Electricity",
  robots: {
    index: false,
    follow: false,
  },
  appleWebApp: {
    capable: true,
    title: "Electricity",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // theme-color не задаётся статически: в PWA при переходах между страницами
  // Next вернул бы светлый цвет из этого поля, и статус-бар мигал белым.
  // Мета-тег управляется THEME_INIT_SCRIPT (до первой отрисовки) и ThemeProvider.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ServiceWorkerRegister />
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
