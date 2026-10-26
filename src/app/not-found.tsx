import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { ProductCard } from "@/components/product/ProductCard";
import { BackButton } from "@/components/ui/BackButton";
import { Home, Search, PackageSearch } from "lucide-react";
import type { Product } from "@/types";

// Кастомная 404 рендерится статически — НЕ используем revalidate
export const dynamic = "force-static";

/** Загружаем 4 свежих активных товара для блока «Популярные товары» */
async function getPopularProducts(): Promise<Product[]> {
  try {
    const raw = await prisma.product.findMany({
      where: { deletedAt: null, status: "Активен" },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        price: true,
        oldPrice: true,
        images: true,
        category: true,
        subCategory: true,
        sizes: true,
        availability: true,
        description: true,
        status: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
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
                isVerified: true,
              },
            },
          },
        },
        store: {
          select: {
            name: true,
            slug: true,
            instagram: true,
            avatarUrl: true,
            cities: true,
            isVerified: true,
          },
        },
      },
    });

    return raw.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      oldPrice: item.oldPrice,
      images:
        item.images && item.images.length > 0
          ? item.images
          : ["https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80"],
      category: item.category,
      subCategory: item.subCategory,
      sizes: item.sizes || [],
      availability: item.availability || "В наличии",
      description: item.description,
      status: item.status || "Активен",
      userId: item.userId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      shopName:
        item.store?.name || item.user?.store?.name || item.user?.name || "",
      shopUsername:
        item.store?.instagram?.replace(/^@/, "") ||
        item.store?.slug ||
        item.user?.store?.instagram?.replace(/^@/, "") ||
        item.user?.store?.slug ||
        "",
      store: item.store
        ? {
            name: item.store.name,
            slug: item.store.slug,
            instagram: item.store.instagram,
            avatarUrl: item.store.avatarUrl,
            cities: item.store.cities,
            isVerified: item.store.isVerified,
          }
        : item.user?.store
        ? {
            name: item.user.store.name,
            slug: item.user.store.slug,
            instagram: item.user.store.instagram,
            avatarUrl: item.user.store.avatarUrl,
            cities: item.user.store.cities,
            isVerified: item.user.store.isVerified,
          }
        : undefined,
    }));
  } catch {
    return [];
  }
}

export default async function NotFound() {
  const popularProducts = await getPopularProducts();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50/50 pb-16">
        {/* Hero-блок */}
        <div className="mx-auto max-w-3xl px-4 pt-16 pb-12 text-center">
          {/* Иконка */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-sm border border-gray-100">
            <PackageSearch className="h-12 w-12 text-gray-300" strokeWidth={1.5} />
          </div>

          {/* Заголовок */}
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-rose-500">
            Ошибка 404
          </p>
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Страница не найдена
          </h1>
          <p className="mx-auto max-w-md text-base text-gray-500 leading-relaxed">
            Товар мог быть удалён продавцом, или ссылка устарела.{" "}
            Попробуйте поискать нужный товар или вернитесь на главную.
          </p>

          {/* CTA-кнопки */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
            >
              <Home className="h-4 w-4" />
              На главную
            </Link>
            <Link
              href="/?q="
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Search className="h-4 w-4" />
              Поиск товаров
            </Link>
            <BackButton />
          </div>
        </div>

        {/* Популярные товары */}
        {popularProducts.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 sm:px-6">
            {/* Разделитель */}
            <div className="mb-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                Свежие товары на витрине
              </h2>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {popularProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} priority={idx < 2} />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors"
              >
                Смотреть все товары →
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
