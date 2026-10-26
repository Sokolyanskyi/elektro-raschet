import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Электроэнергия — расчёт и оплата",
  description:
    "Личный расчёт оплаты за электроэнергию по дневному и ночному тарифам с историей показаний и оплат за годы.",
  applicationName: "Электроэнергия",
  robots: {
    index: false,
    follow: false,
  },
  appleWebApp: {
    capable: true,
    title: "Электроэнергия",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5fb" },
    { media: "(prefers-color-scheme: dark)", color: "#080d1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
