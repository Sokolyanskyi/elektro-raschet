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
  // The provider updates this meta when the user picks another colour scheme.
  themeColor: "#f3f5fb",
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
