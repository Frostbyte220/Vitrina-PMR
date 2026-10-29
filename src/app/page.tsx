import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { LogIn, LayoutDashboard, Store } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { FavoritesButton } from "@/components/layout/FavoritesButton";
import { CartButton } from "@/components/layout/CartButton";
import { VisualCategories } from "@/components/home/VisualCategories";
import { ProductCatalogClient } from "@/components/home/ProductCatalogClient";
import { getProducts } from "@/lib/cache";
import { getFuzzyProducts } from "@/lib/fuzzySearch";
import { getBanners } from "@/lib/banners";
import { AdBannerCarousel } from "@/components/ads/AdBannerCarousel";
import { RecentlyViewedSection } from "@/components/product/RecentlyViewedSection";
import { HomePreloader } from "@/components/ui/HomePreloader";

// Мета-теги для SEO главной страницы
export const metadata: Metadata = {
  title: "Единая витрина локальных магазинов Приднестровья",
  description: "Единый каталог товаров от локальных брендов и магазинов ПМР. Одежда, обувь, электроника и многое другое с доставкой по всем городам.",
  openGraph: {
    title: "Единая витрина локальных магазинов Приднестровья",
    description: "Удобный поиск товаров из локальных магазинов в одном месте.",
    siteName: "E-Vitrina PMR",
    locale: "ru_RU",
    type: "website",
  },
};

export const revalidate = 60;
const ITEMS_PER_PAGE = 12;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await getServerSession(authOptions);
  const params  = await searchParams;
  const banners = await getBanners();
  const shopsHref = params.cities
    ? `/shops?cities=${encodeURIComponent(params.cities)}`
    : "/shops";

  // SSR: загружаем первую порцию товаров на сервере (для быстрого первого рендера)
  const { category, sub, q, page, sort, minPrice, maxPrice, cities, sizes, discount, availability } = params;
  const currentPage    = Number(page) || 1;
  const skip           = (currentPage - 1) * ITEMS_PER_PAGE;
  const selectedCities = cities ? cities.split(",").filter(Boolean) : [];
  const selectedSizes  = sizes  ? sizes.split(",").map((s) => s.trim()).filter(Boolean) : [];

  let orderBy: any = { createdAt: "desc" };
  if (sort === "oldest")                        orderBy = { createdAt: "asc" };
  if (sort === "price_asc")                     orderBy = { price: "asc" };
  if (sort === "price_desc")                    orderBy = { price: "desc" };
  if (sort === "title_asc" || sort === "title") orderBy = { title: "asc" };

  const conditions: any[] = [];
  if (discount === "true") conditions.push({ oldPrice: { not: null, gt: 0 } });
  if (availability)        conditions.push({ availability });
  if (category && category !== "Все") conditions.push({ category });
  if (sub)                 conditions.push({ subCategory: sub });
  if (selectedSizes.length > 0) conditions.push({ sizes: { hasSome: selectedSizes } });
  if (minPrice || maxPrice) {
    const priceFilter: any = {};
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    if (min !== null && !isNaN(min)) priceFilter.gte = min;
    if (max !== null && !isNaN(max)) priceFilter.lte = max;
    if (Object.keys(priceFilter).length > 0) conditions.push({ price: priceFilter });
  }
  if (selectedCities.length > 0) {
    conditions.push({
      OR: [
        { store: { cities: { hasSome: selectedCities } } },
        { user: { store: { cities: { hasSome: selectedCities } } } },
      ],
    });
  }

  const whereClause: any = { deletedAt: null, status: "Активен" };
  if (conditions.length > 0) whereClause.AND = conditions;

  const isCustomSort = Boolean(sort && ["oldest", "price_asc", "price_desc", "title_asc", "title"].includes(sort));

  const [initialProducts, initialTotalCount] = q?.trim()
    ? await getFuzzyProducts(q.trim(), whereClause, skip, ITEMS_PER_PAGE, orderBy, isCustomSort)
    : await getProducts(whereClause, skip, ITEMS_PER_PAGE, orderBy);

  // Загружаем каталог активных товаров для мгновенной фильтрации в памяти на клиенте (<16 мс)
  const [catalogPool] = await getProducts(
    { deletedAt: null, status: "Активен" },
    0,
    300,
    { createdAt: "desc" }
  );

  const initialTotalPages = Math.ceil(initialTotalCount / ITEMS_PER_PAGE);

  return (
    <main className="relative min-h-screen bg-gray-50 pb-24">
      {/* Фирменный прелоадер при входе на главную страницу */}
      <HomePreloader />
      
      {/* Контейнер для кнопок в правом верхнем углу */}
      <div className="absolute right-4 top-4 z-50 flex items-center gap-2 md:right-8 md:top-6 md:gap-3">
        {/* Кнопка Магазинов (десктоп) с сохранением фильтра городов */}
        <Link
          href={shopsHref}
          className="hidden sm:flex items-center gap-2 rounded-full bg-white px-4 py-2.5 sm:px-5 text-sm font-medium text-gray-700 shadow-sm outline outline-1 outline-gray-200 transition-all hover:bg-gray-50 hover:text-rose-800 hover:shadow-md"
        >
          <Store className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Все магазины</span>
        </Link>

        {/* Кнопка Корзины */}
        <CartButton />

        {/* Кнопка Избранного */}
        <FavoritesButton />

        {session ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 sm:px-5 text-sm font-medium text-gray-700 shadow-sm outline outline-1 outline-gray-200 transition-all hover:bg-gray-50 hover:text-rose-800 hover:shadow-md"
          >
            <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Личный кабинет продавца</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 sm:px-5 text-sm font-medium text-gray-700 shadow-sm outline outline-1 outline-gray-200 transition-all hover:bg-gray-50 hover:text-rose-800 hover:shadow-md"
          >
            <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Для продавцов</span>
            <span className="sm:hidden">Вход</span>
          </Link>
        )}
      </div>

      {/* Hero-секция (заголовок сайта) */}
      <section className="bg-white px-4 pt-8 pb-4 shadow-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-6 mt-8 sm:mt-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-rose-800 sm:text-4xl">
            E-Vitrina PMR
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Единая витрина локальных магазинов Приднестровья
          </p>
        </div>
        <div className="mx-auto max-w-2xl">
          <React.Suspense fallback={<div className="h-12 w-full animate-pulse rounded-full bg-gray-100" />}>
            <SearchAndFilter />
          </React.Suspense>
        </div>
      </section>

      {/* Категории (визуальные) */}
      <div>
        <VisualCategories />
      </div>

      {/* Рекламная карусель — Баннер #1 (динамический из БД) */}
      <AdBannerCarousel banners={banners} />

      {/* Сетка товаров — клиентский компонент (мгновенные фильтры без skeleton) */}
      <section className="mx-auto max-w-7xl px-3 pt-4 sm:px-6 lg:px-8 min-h-[500px]">
        <React.Suspense fallback={<ProductsSkeleton />}>
          <ProductCatalogClient
            initialProducts={initialProducts as any[]}
            initialTotalCount={initialTotalCount}
            initialTotalPages={initialTotalPages}
            initialPage={currentPage}
            catalogPool={catalogPool as any[]}
          />
        </React.Suspense>

        {/* Недавно просмотренные товары */}
        <RecentlyViewedSection className="mt-12 border-t border-gray-200/70 pt-8" />
      </section>
    </main>
  );
}

// Скелетон-заглушка при первом SSR
function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm border border-gray-100 animate-pulse">
          <div className="aspect-[4/5] w-full rounded-xl bg-gray-200" />
          <div className="h-4 w-3/4 rounded bg-gray-200 mt-2" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
          <div className="h-8 w-full rounded-xl bg-gray-200 mt-2" />
        </div>
      ))}
    </div>
  );
}
