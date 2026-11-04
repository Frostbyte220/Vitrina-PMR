import { notFound } from "next/navigation";
import type { Metadata } from "next"; 
import { Header } from "@/components/layout/Header";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { StoreHeaderHero } from "@/components/shop/StoreHeaderHero";
import { prisma } from "@/lib/prisma";
import { fetchShopProducts } from "@/actions/shopProducts";
import { isHiddenStore } from "@/lib/storeFilter";

export const revalidate = 60;

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://www.e-vitrina.com";

interface ShopPageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const { username } = await params;

  // Ищем магазин по instagram или slug из настроек магазина ИЛИ из базового профиля пользователя
  const store = await prisma.store.findFirst({
    where: {
      OR: [
        { instagram: username },
        { instagram: `@${username}` },
        { slug: username },
        { user: { instagram: username } },
        { user: { instagram: `@${username}` } },
      ]
    },
    include: { user: true }
  });

  if (!store || isHiddenStore(store)) return { title: "Магазин не найден | E-Vitrina PMR" };


  const cityText = store.cities?.length ? `в ${store.cities[0]}` : "в ПМР";
  const description =
    store.description ||
    `Купить товары магазина ${store.name} ${cityText}. Каталог товаров на Витрине ПМР — локальные магазины Приднестровья.`;

  return {
    title: `${store.name} — магазин ${cityText} | E-Vitrina PMR`,
    description,
    keywords: [
      store.name,
      `купить ${cityText}`,
      "магазин ПМР",
      "E-Vitrina PMR",
      "магазины Тирасполя",
      "купить в Приднестровье",
    ],
    alternates: {
      canonical: `${baseUrl}/shop/${store.instagram?.replace(/^@/, "") || store.slug}`,
    },
    openGraph: {
      title: `${store.name} на E-Vitrina PMR`,
      description,
      images: store.avatarUrl ? [{ url: store.avatarUrl, alt: store.name }] : [],
      type: "website",
      siteName: "E-Vitrina PMR",
      locale: "ru_RU",
    },
  };
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { username } = resolvedParams;

  // 1. Параметры фильтрации из URL (для синхронизации начального состояния)
  const categoryFilter = typeof resolvedSearchParams.category === "string" ? resolvedSearchParams.category : "all";
  const sortFilter = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "newest";

  // 2. Ищем магазин по instagram или slug (проверяем и таблицу Store, и таблицу User)
  const store = await prisma.store.findFirst({
    where: {
      OR: [
        { instagram: username },
        { instagram: `@${username}` },
        { slug: username },
        { user: { instagram: username } },
        { user: { instagram: `@${username}` } },
      ]
    },
    // select вместо include: { user: true } — только нужные поля
    select: {
      id: true,
      userId: true,
      name: true,
      slug: true,
      instagram: true,
      description: true,
      avatarUrl: true,
      coverUrl: true,
      cities: true,
      isVerified: true,
      telegram: true,
      viber: true,
      phone: true,
      user: {
        select: {
          name: true,
          instagram: true,
          avatar: true,
        },
      },
    },
  });

  if (!store || isHiddenStore(store)) notFound();

  const cleanInstagram = store.instagram ? store.instagram.replace(/^@/, '') : store.user.instagram?.replace(/^@/, '');

  // 3. Загружаем первую порцию товаров (take: 12, skip: 0) и категории для всего магазина
  const productWhere = {
    deletedAt: null,
    userId: store.userId,
    status: "Активен" as const,
  };

  const storeMetadata = {
    storeUserId: store.userId,
    storeName: store.name,
    storeSlug: store.slug,
    storeInstagram: cleanInstagram,
    storeAvatarUrl: store.avatarUrl,
    storeCities: store.cities,
    storeTelegram: store.telegram,
    storeViber: store.viber,
    storePhone: store.phone,
    storeIsVerified: store.isVerified,
  };

  const [initialData, rawCategories] = await Promise.all([
    fetchShopProducts({
      ...storeMetadata,
      category: categoryFilter,
      sort: sortFilter as any,
      skip: 0,
      take: 12,
    }),
    prisma.product.findMany({
      where: productWhere,
      select: { category: true },
    }),
  ]);

  // Автоматический подсчет категорий и количества товаров в каждой
  const categoryCounts: Record<string, number> = {};
  for (const item of rawCategories) {
    if (item.category) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    }
  }
  const availableCategories = Object.keys(categoryCounts).sort();

  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.name,
    description: store.description || `Витрина магазина ${store.name} на E-Vitrina PMR`,
    url: `${baseUrl}/shop/${encodeURIComponent(cleanInstagram || store.slug || store.id)}`,
    image: store.avatarUrl || store.coverUrl || undefined,
    telephone: store.phone || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: store.cities?.[0] || "Тирасполь",
      addressCountry: "MD",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Приднестровье",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd).replace(/</g, "\\u003c") }}
      />
      <Header />
      <main className="pb-12 bg-gray-50/50 min-h-screen">
        {/* Шапка профиля и информация о магазине */}
        <StoreHeaderHero
          name={store.name}
          avatarUrl={store.avatarUrl}
          coverUrl={store.coverUrl}
          isVerified={store.isVerified}
          cleanInstagram={cleanInstagram}
          cities={store.cities}
          telegram={store.telegram}
          viber={store.viber}
          phone={store.phone}
          description={store.description}
        />

        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          <ShopCatalog
            initialProducts={initialData.products}
            initialTotalCount={initialData.totalCount}
            initialHasMore={initialData.hasMore}
            categories={availableCategories}
            categoryCounts={categoryCounts}
            initialCategory={categoryFilter}
            initialSort={sortFilter}
            storeMetadata={storeMetadata}
          />
        </div>
      </main>
    </>
  );
}
