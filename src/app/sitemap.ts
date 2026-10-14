import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vitrina-pmr.vercel.app";

// Размеры, для которых создаём отдельные URL в sitemap
const CLOTHING_SIZES_SEO = ["XS", "S", "M", "L", "XL", "2XL", "42", "44", "46", "48", "50"];
const SHOE_SIZES_SEO = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Статические страницы
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/partnership`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    // Страницы категорий
    {
      url: `${BASE_URL}/?category=${encodeURIComponent("Одежда")}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/?category=${encodeURIComponent("Обувь")}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // SEO-страницы одежда+размер (высокий коммерческий спрос)
  const clothingSizePages: MetadataRoute.Sitemap = CLOTHING_SIZES_SEO.map((size) => ({
    url: `${BASE_URL}/?category=${encodeURIComponent("Одежда")}&sizes=${encodeURIComponent(size)}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.65,
  }));

  // SEO-страницы обувь+размер
  const shoeSizePages: MetadataRoute.Sitemap = SHOE_SIZES_SEO.map((size) => ({
    url: `${BASE_URL}/?category=${encodeURIComponent("Обувь")}&sizes=${encodeURIComponent(size)}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.65,
  }));

  // Динамические страницы товаров
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null, status: "Активен" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    productPages = products.map((product) => ({
      url: `${BASE_URL}/product/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("[SITEMAP] Ошибка загрузки товаров:", error);
  }

  // Динамические страницы магазинов
  let storePages: MetadataRoute.Sitemap = [];
  try {
    const stores = await prisma.store.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    storePages = stores.map((store) => ({
      url: `${BASE_URL}/shop/${store.slug}`,
      lastModified: store.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("[SITEMAP] Ошибка загрузки магазинов:", error);
  }

  return [
    ...staticPages,
    ...clothingSizePages,
    ...shoeSizePages,
    ...productPages,
    ...storePages,
  ];
}
