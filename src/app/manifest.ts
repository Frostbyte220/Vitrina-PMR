import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "E-Vitrina PMR — Каталог товаров Приднестровья",
    short_name: "Витрина ПМР",
    description:
      "Единый каталог товаров из локальных магазинов Приднестровья (Тирасполь, Бендеры, Рыбница и др.).",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
