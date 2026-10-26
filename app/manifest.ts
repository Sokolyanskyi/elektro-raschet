import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Электроэнергия — расчёт и оплата",
    short_name: "Электроэнергия",
    description:
      "Расчёт оплаты за электроэнергию по дневному и ночному тарифам. История показаний и оплат.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f3f5fb",
    theme_color: "#1e1b4b",
    lang: "ru",
    categories: ["utilities", "finance"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
