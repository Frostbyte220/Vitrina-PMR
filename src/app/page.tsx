import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { LogIn, LayoutDashboard, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ProductCard } from "@/components/product/ProductCard";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { Pagination } from "@/components/Pagination";
import { FavoritesButton } from "@/components/layout/FavoritesButton";
import { VisualCategories } from "@/components/home/VisualCategories";

// Мета-теги для SEO главной страницы
export const metadata: Metadata = {
  title: "Единая витрина локальных магазинов Приднестровья",
  description: "Единый каталог товаров от локальных брендов и магазинов ПМР (Тирасполь, Бендеры). Одежда, обувь, электроника и многое другое.",
  openGraph: {
    title: "Единая витрина локальных магазинов Приднестровья",
    description: "Удобный поиск товаров из локальных магазинов в одном месте.",
    siteName: "Vitrina PMR",
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
  const params = await searchParams;
  
  // Извлекаем параметры поиска
  const { category, sub, q, page, ...otherFilters } = params;

  const currentPage = Number(page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const dynamicFilters = Object.keys(otherFilters)
    .filter((key) => Boolean(otherFilters[key]))
    .map((key) => ({
      description: { contains: otherFilters[key]!, mode: "insensitive" as const },
    }));

  // 🔥 Безопасное формирование whereClause без передачи undefined полей
  const whereClause: any = {
    deletedAt: null,
    status: "Активен",
  };

  if (category && category !== "Все") {
    whereClause.category = category;
  }

  if (sub) {
    whereClause.subCategory = sub;
  }

  if (dynamicFilters.length > 0) {
    whereClause.AND = dynamicFilters;
  }

  if (q) {
    whereClause.OR = [
      { title: { contains: q, mode: "insensitive" as const } },
      { description: { contains: q, mode: "insensitive" as const } },
    ];
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      skip: skip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        category: true,
        subCategory: true,
        user: {
          select: {
            name: true,
            instagram: true,
            avatar: true,
            store: {
              select: {
                name: true,
                slug: true,
                instagram: true,
                avatarUrl: true,
                cities: true,
              }
            }
          }
        },
        store: {
          select: {
            name: true,
            slug: true,
            instagram: true,
            avatarUrl: true,
            cities: true,
          }
        },
      },
    }),
    prisma.product.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <main className="relative min-h-screen bg-gray-50 pb-24">
      
      {/* Контейнер для кнопок в правом верхнем углу */}
      <div className="absolute right-4 top-4 z-50 flex items-center gap-2 md:right-8 md:top-6 md:gap-3">
        {/* Кнопка Магазинов (десктоп) */}
        <Link
          href="/shops"
          className="hidden sm:flex items-center gap-2 rounded-full bg-white px-4 py-2.5 sm:px-5 text-sm font-medium text-gray-700 shadow-sm outline outline-1 outline-gray-200 transition-all hover:bg-gray-50 hover:text-rose-800 hover:shadow-md"
        >
          <Store className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Все магазины</span>
        </Link>

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
      <section className="bg-white px-4 pt-8 pb-4 shadow-sm sm:px-6 lg:px-8 animate-fade-in">
        <div className="mx-auto max-w-2xl text-center mb-6 mt-8 sm:mt-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-rose-800 sm:text-4xl">
            Vitrina PMR
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
      <div className="animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <VisualCategories />
      </div>

      {/* Сетка товаров */}
      <section className="mx-auto max-w-7xl px-3 pt-4 sm:px-6 lg:px-8 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {q
                ? `По запросу «${q}» ничего не найдено`
                : "По вашим фильтрам ничего не найдено"}
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
              Попробуйте изменить параметры или сбросить фильтры.
            </p>
            <Link
              href="/"
              className="mt-6 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Сбросить фильтры
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
            <Pagination totalPages={totalPages} currentPage={currentPage} />
          </>
        )}
      </section>
    </main>
  );
}