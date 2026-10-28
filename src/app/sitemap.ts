import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { HIDDEN_STORE_PRISMA_NOT, isHiddenStore } from "@/lib/storeFilter";

// Динамическое обновление sitemap: ревалидация каждый час (ISR).
// Это гарантирует, что новые товары и магазины всегда попадают в Google и Яндекс без повторного деплоя!
export const revalidate = 3600;

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://www.e-vitrina.com";

// Все категории каталога
const ALL_CATEGORIES = [
  "Одежда",
  "Обувь",
  "Косметика",
  "Парфюмерия",
  "Детские товары",
  "Handmade",
  "Электроника",
  "Дом и декор",
  "Подарки",
  "Еда и десерты",
  "Спорт и отдых",
];

// Города Приднестровья для регионального SEO
const PMR_CITIES = [
  "Тирасполь",
  "Бендеры",
  "Рыбница",
  "Дубоссары",
  "Слободзея",
  "Днестровск",
  "Григориополь",
  "Каменка",
];

// Размеры, для которых создаём отдельные URL в sitemap
const CLOTHING_SIZES_SEO = ["XS", "S", "M", "L", "XL", "2XL", "42", "44", "46", "48", "50"];
const SHOE_SIZES_SEO = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Основные статические страницы маркетплейса
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/shops`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/partnership`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // 2. Страницы всех категорий каталога
  const categoryPages: MetadataRoute.Sitemap = ALL_CATEGORIES.map((category) => ({
    url: `${BASE_URL}/?category=${encodeURIComponent(category)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // 3. Городские фильтры каталога и страницы магазинов по городам
  const cityPages: MetadataRoute.Sitemap = PMR_CITIES.flatMap((city) => [
    {
      url: `${BASE_URL}/?cities=${encodeURIComponent(city)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/shops?city=${encodeURIComponent(city)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.75,
    },
  ]);

  // 4. SEO-страницы одежда + размер
  const clothingSizePages: MetadataRoute.Sitemap = CLOTHING_SIZES_SEO.map((size) => ({
    url: `${BASE_URL}/?category=${encodeURIComponent("Одежда")}&amp;sizes=${encodeURIComponent(size)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.65,
  }));

  // 5. SEO-страницы обувь + размер
  const shoeSizePages: MetadataRoute.Sitemap = SHOE_SIZES_SEO.map((size) => ({
    url: `${BASE_URL}/?category=${encodeURIComponent("Обувь")}&amp;sizes=${encodeURIComponent(size)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.65,
  }));

  // 6. Динамические страницы ВСЕХ активных товаров (/product/[id])
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        status: "Активен",
      },
      select: {
        id: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    });

    productPages = products.map((product) => ({
      url: `${BASE_URL}/product/${product.id}`,
      lastModified: product.updatedAt || product.createdAt || now,
      changeFrequency: "daily" as const,
      priority: 0.85,
    }));
  } catch (error) {
    console.error("[SITEMAP] Ошибка загрузки товаров:", error);
  }

  // 7. Динамические страницы ВСЕХ магазинов (/shop/[username])
  let storePages: MetadataRoute.Sitemap = [];
  try {
    const stores = await prisma.store.findMany({
      where: {
        NOT: HIDDEN_STORE_PRISMA_NOT,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        instagram: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 1000,
    });

    storePages = stores
      .filter((store) => !isHiddenStore(store))
      .map((store) => {
        const identifier = (store.slug || store.instagram?.replace(/^@/, "") || store.id).trim();
        return {
          url: `${BASE_URL}/shop/${encodeURIComponent(identifier)}`,
          lastModified: store.updatedAt || store.createdAt || now,
          changeFrequency: "daily" as const,
          priority: 0.8,
        };
      });
  } catch (error) {
    console.error("[SITEMAP] Ошибка загрузки магазинов:", error);
  }

  const allEntries: MetadataRoute.Sitemap = [
    ...staticPages,
    ...categoryPages,
    ...cityPages,
    ...clothingSizePages,
    ...shoeSizePages,
    ...productPages,
    ...storePages,
  ];

  return allEntries.map((entry) => ({
    ...entry,
    // В XML по стандарту sitemaps.org амперсанд '&' обязан экранироваться как '&amp;', иначе парсер Google выдаёт "Ошибка разбора"
    url: entry.url.replace(/&(?!(amp|lt|gt|quot|apos);)/g, "&amp;"),
  }));
}
