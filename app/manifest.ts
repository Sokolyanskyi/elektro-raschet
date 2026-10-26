import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Electricity — meter readings & payments",
    short_name: "Electricity",
    description:
      "Personal electricity bill calculator for day and night tariffs with multi-year reading and payment history.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f3f5fb",
    theme_color: "#1e1b4b",
    lang: "en",
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
