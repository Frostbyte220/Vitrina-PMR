import { cache, Suspense } from "react";
import { Store, ShoppingBag, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ProductPageHeader,
  ProductPageHeaderDesktop,
} from "@/components/layout/ProductPageHeader";
import { ProductPurchaseSection } from "@/components/product/ProductPurchaseSection";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { ReportProductModal } from "@/components/product/ReportProductModal";
import { RecentlyViewedTracker } from "@/components/product/RecentlyViewedTracker";
import { RecentlyViewedSection } from "@/components/product/RecentlyViewedSection";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

// Включаем ISR (кэширование). Страница будет обновляться раз в час (3600 сек),
// что идеально для маркетплейса: сервер не перегружается, а данные отдаются мгновенно.
export const revalidate = 3600;

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vitrina-pmr.vercel.app";

// React.cache дедуплицирует запрос: generateMetadata и ProductPage делают ровно 1 запрос к БД, а не 2!
const getProduct = cache(async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      oldPrice: true,
      images: true,
      status: true,
      category: true,
      subCategory: true,
      sizes: true,
      storeId: true,
      userId: true,
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          instagram: true,
          phone: true,
          telegram: true,
          viber: true,
          avatarUrl: true,
          cities: true,
          isVerified: true,
        },
      },
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
              phone: true,
              telegram: true,
              viber: true,
              avatarUrl: true,
              cities: true,
              isVerified: true,
            },
          },
        },
      },
    },
  });
});

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Товар не найден | E-Vitrina PMR" };
  }

  const productUrl = `${BASE_URL}/product/${id}`;
  const shopName = product.store?.name || product.user?.store?.name || product.user?.name || "E-Vitrina PMR";
  
  // Обрезаем описание для мета-тегов до 160 символов (стандарт поисковиков)
  const cleanDescription =
    product.description?.substring(0, 140) ||
    `Купить ${product.title} в ПМР — магазин ${shopName} на Витрине ПМР. Доставка по всему Приднестровью.`;

  const ogImageUrl = `${BASE_URL}/api/og/product?id=${id}`;

  return {
    title: `${product.title} — купить в ПМР | ${shopName}`,
    description: cleanDescription,
    keywords: [
      product.title,
      `купить ${product.title}`,
      `${product.title} ПМР`,
      shopName,
      "E-Vitrina PMR",
      "купить в Приднестровье",
    ],
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.title} — ${product.price.toLocaleString("ru-RU")} Руб | ${shopName}`,
      description: cleanDescription,
      url: productUrl,
      siteName: "E-Vitrina PMR",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${product.title} — ${shopName}`,
        },
      ],
      locale: "ru_RU",
      type: "website",
    },
    // Twitter/X card (также используется Telegram при недоступности og:image)
    twitter: {
      card: "summary_large_image",
      title: `${product.title} — ${product.price.toLocaleString("ru-RU")} Руб`,
      description: cleanDescription,
      images: [ogImageUrl],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }
  const images = product.images?.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80"];
    
  const shopName = product.store?.name || (product.user as any)?.store?.name || product.user?.name || "Магазин";
  const rawInstagram = product.store?.instagram || (product.user as any)?.store?.instagram || product.user?.instagram || "";
  const storeSlug = product.store?.slug || (product.user as any)?.store?.slug || "";
  
  const cleanUsername = rawInstagram.replace(/^@/, '') || storeSlug;

  const hasDiscount = Boolean(product.oldPrice && product.oldPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : null;

  const storeData = product.store || (product.user as any)?.store;
  const storeContacts = {
    instagram: storeData?.instagram || product.user?.instagram || "",
    telegram: storeData?.telegram || null,
    viber: storeData?.viber || null,
    phone: storeData?.phone || null,
  };

  // Структурированные данные JSON-LD для Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: images[0],
    description: product.description,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "RUB", 
      availability: product.status === "Активен" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: shopName,
      },
    },
  };

  const productUrl = `${BASE_URL}/product/${id}`;

  // Формируем цепочку хлебных крошек (Главная → Категория → Подкатегория → Товар)
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Главная", href: "/" },
  ];

  if (product.category) {
    breadcrumbs.push({
      label: product.category,
      href: `/?category=${encodeURIComponent(product.category)}`,
    });
  }

  if (product.subCategory) {
    breadcrumbs.push({
      label: product.subCategory,
      href: product.category
        ? `/?category=${encodeURIComponent(product.category)}&sub=${encodeURIComponent(product.subCategory)}`
        : `/?sub=${encodeURIComponent(product.subCategory)}`,
    });
  }

  breadcrumbs.push({
    label: product.title,
  });

  // Структурированные данные Schema.org BreadcrumbList JSON-LD для Google и Яндекса
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: crumb.label,
      item: crumb.href
        ? (crumb.href.startsWith("http") ? crumb.href : `${BASE_URL}${crumb.href}`)
        : productUrl,
    })),
  };

  return (
    <>
      {/* Внедряем микроразметку для поисковиков в <head> (Next.js поймет это расположение) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <RecentlyViewedTracker productId={product.id} />

      <ProductPageHeader
        title={product.title}
        price={product.price}
        productId={product.id}
        imageUrl={images[0]}
        shopName={shopName}
      />
      <ProductPageHeaderDesktop
        title={product.title}
        price={product.price}
        productId={product.id}
        imageUrl={images[0]}
        shopName={shopName}
      />

      <main className="mx-auto max-w-5xl px-4 pb-32 pt-4 md:px-6 md:pb-16">
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs items={breadcrumbs} currentUrl={productUrl} />

          <ProductGallery images={images} title={product.title} />

          <div className="mt-6 flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold leading-tight text-text-main md:text-3xl">
                {product.title}
              </h1>
              <div className="mt-2 flex items-baseline gap-3 flex-wrap">
                <span className={`text-2xl font-bold md:text-3xl ${hasDiscount ? "text-rose-600" : "text-primary"}`}>
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base font-medium text-gray-400 line-through md:text-lg">
                      {formatPrice(product.oldPrice!)}
                    </span>
                    <span className="inline-flex items-center rounded-lg bg-rose-600 px-2.5 py-0.5 text-xs sm:text-sm font-bold text-white shadow-sm">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Добавлен whitespace-pre-wrap для сохранения переносов строк в описании */}
            <p className="text-sm leading-relaxed text-text-muted md:text-base whitespace-pre-wrap">
              {product.description}
            </p>

            <Link
              href={`/shop/${cleanUsername}`}
              className="group mt-2 flex items-center gap-4 rounded-2xl bg-surface p-4 border border-gray-100 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Store className="h-6 w-6 text-primary" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-text-muted">Продавец</p>
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="truncate font-semibold text-text-main group-hover:text-primary transition-colors">
                    {shopName}
                  </p>
                  {(product.store?.isVerified || (product.user?.store as any)?.isVerified) && (
                    <VerifiedBadge size="sm" showText />
                  )}
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold text-primary transition-opacity group-hover:opacity-80">
                В магазин →
              </span>
            </Link>

            {/* Секция покупки: выбор размера, десктопная и мобильная кнопки связи, кнопка поделиться */}
            <ProductPurchaseSection
              productId={product.id}
              productName={product.title}
              productPrice={product.price}
              shopUsername={cleanUsername}
              contacts={storeContacts}
              sizes={product.sizes || []}
              category={product.category}
              imageUrl={images[0]}
              shopName={shopName}
              oldPrice={product.oldPrice}
              storeId={product.storeId || product.store?.id || (product.user?.store as any)?.id || null}
              storeAvatar={product.store?.avatarUrl || (product.user?.store as any)?.avatarUrl || (product.user as any)?.avatar || null}
              isVerified={Boolean(product.store?.isVerified || (product.user?.store as any)?.isVerified)}
            />

            {/* Кнопка «Пожаловаться на товар» */}
            <div className="mt-2 flex items-center justify-center pt-2">
              <ReportProductModal
                productId={product.id}
                productTitle={product.title}
              />
            </div>
          </div>
        </div>

        {/* Секция связанных товаров стримится через Suspense — не блокирует показ товара */}
        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProductsSection
            productId={product.id}
            category={product.category}
            storeId={product.storeId}
            userId={product.userId}
            shopName={shopName}
            cleanUsername={cleanUsername}
          />
        </Suspense>

        {/* Недавно просмотренные товары */}
        <RecentlyViewedSection currentProductId={product.id} />
      </main>
    </>
  );
}

// Поля выбора для связанных товаров (включая магазины и города)
const productCardSelect = {
  id: true,
  title: true,
  price: true,
  oldPrice: true,
  images: true,
  category: true,
  subCategory: true,
  sizes: true,
  store: {
    select: {
      name: true,
      slug: true,
      instagram: true,
      avatarUrl: true,
      cities: true,
      phone: true,
      telegram: true,
      viber: true,
      isVerified: true,
    },
  },
  user: {
    select: {
      name: true,
      instagram: true,
      avatar: true,
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          instagram: true,
          avatarUrl: true,
          cities: true,
          phone: true,
          telegram: true,
          viber: true,
          isVerified: true,
        },
      },
    },
  },
};

// Скелетон каруселей для мгновенного ответа страницы
function RelatedProductsSkeleton() {
  return (
    <div className="mt-12 sm:mt-16 space-y-8 animate-pulse">
      <div>
        <div className="h-6 w-48 rounded-lg bg-gray-200 mb-2" />
        <div className="h-4 w-24 rounded bg-gray-100" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-[210px] min-w-[210px] sm:w-[250px] sm:min-w-[250px] h-72 rounded-2xl bg-gray-100 shrink-0"
          />
        ))}
      </div>
    </div>
  );
}

// Асинхронный компонент связанных товаров (загружается в фоновом стриме)
async function RelatedProductsSection({
  productId,
  category,
  storeId,
  userId,
  shopName,
  cleanUsername,
}: {
  productId: string;
  category: string;
  storeId: string | null;
  userId: string | null;
  shopName: string;
  cleanUsername: string;
}) {
  const sellerConditions: any[] = [];
  if (storeId) sellerConditions.push({ storeId });
  if (userId) sellerConditions.push({ userId });

  // Запрашиваем другие товары того же продавца и похожие товары в категории
  const [storeProducts, similarProducts] = await Promise.all([
    sellerConditions.length > 0
      ? prisma.product.findMany({
          where: {
            id: { not: productId },
            deletedAt: null,
            status: "Активен",
            OR: sellerConditions,
          },
          take: 8,
          orderBy: { createdAt: "desc" },
          select: productCardSelect,
        })
      : Promise.resolve([]),
    prisma.product.findMany({
      where: {
        id: { not: productId },
        deletedAt: null,
        status: "Активен",
        category,
        ...(sellerConditions.length > 0
          ? {
              NOT: {
                OR: sellerConditions,
              },
            }
          : {}),
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: productCardSelect,
    }),
  ]);

  // Если у других продавцов в категории нет товаров, показываем товары того же продавца в категории, не дублируя
  let categoryProducts = similarProducts;
  if (categoryProducts.length === 0) {
    const storeProductIds = new Set([productId, ...storeProducts.map((p) => p.id)]);
    categoryProducts = await prisma.product.findMany({
      where: {
        id: { notIn: Array.from(storeProductIds) },
        deletedAt: null,
        status: "Активен",
        category,
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: productCardSelect,
    });
  }

  return (
    <>
      {/* 1. Еще от этого продавца */}
      <ProductCarousel
        title={shopName ? `Еще от «${shopName}»` : "Еще от этого продавца"}
        icon={<ShoppingBag className="h-5 w-5" />}
        viewAllHref={cleanUsername ? `/shop/${cleanUsername}` : undefined}
        viewAllText="В магазин"
        products={storeProducts}
      />

      {/* 2. Похожие товары в категории */}
      <ProductCarousel
        title={`Похожие товары в категории «${category}»`}
        icon={<Sparkles className="h-5 w-5" />}
        viewAllHref={`/?category=${encodeURIComponent(category)}`}
        viewAllText="Вся категория"
        products={categoryProducts}
      />
    </>
  );
}