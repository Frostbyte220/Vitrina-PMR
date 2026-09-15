import { Store } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ProductPageHeader,
  ProductPageHeaderDesktop,
} from "@/components/layout/ProductPageHeader";
import { ContactSellerButton } from "@/components/product/ContactSellerButton";
import { ProductGallery } from "@/components/product/ProductGallery";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

// Включаем ISR (кэширование). Страница будет обновляться раз в час (3600 сек),
// что идеально для маркетплейса: сервер не перегружается, а данные свежие.
export const revalidate = 3600;

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Вспомогательная функция для получения базового URL проекта
async function getAppUrl() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!product) {
    return { title: "Товар не найден | Vitrina PMR" };
  }

  const appUrl = await getAppUrl();
  const productUrl = `${appUrl}/product/${id}`;
  const images = product.images?.length > 0 ? product.images : ["https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80"];
  const shopName = product.user?.name || "Vitrina PMR";
  
  // Обрезаем описание для мета-тегов до 160 символов (стандарт поисковиков)
  const cleanDescription = product.description?.substring(0, 160) || `Купить ${product.title} в ПМР.`;

  return {
    title: `${product.title} | ${shopName}`,
    description: cleanDescription,
    alternates: {
      canonical: productUrl, // Защита от дублей страниц в SEO
    },
    openGraph: {
      title: product.title,
      description: cleanDescription,
      url: productUrl,
      siteName: "Vitrina PMR",
      images: [
        {
          url: images[0],
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      locale: "ru_RU",
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          store: true
        }
      },
    },
  });

  if (!product) {
    notFound();
  }
  const images = product.images?.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80"];
    
  const shopName = (product.user as any)?.store?.name || product.user?.name || "Магазин";
  const rawInstagram = (product.user as any)?.store?.instagram || product.user?.instagram || "";
  
  // Очищаем от '@' для правильной ссылки внутри приложения
  const cleanUsername = rawInstagram.replace(/^@/, '') || "instagram";

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

  return (
    <>
      {/* Внедряем микроразметку для поисковиков в <head> (Next.js поймет это расположение) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductPageHeader />
      <ProductPageHeaderDesktop title={product.title} />

      <main className="mx-auto max-w-3xl px-4 pb-32 pt-4 md:px-6 md:pb-12">
        <ProductGallery images={images} title={product.title} />

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-text-main md:text-3xl">
              {product.title}
            </h1>
            <p className="mt-2 text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>
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
              <p className="truncate font-semibold text-text-main group-hover:text-primary transition-colors">
                {shopName}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-primary transition-opacity group-hover:opacity-80">
              В магазин →
            </span>
          </Link>

          {/* Десктопная версия кнопки связи */}
          <div className="hidden md:block mt-4">
            <ContactSellerButton
              productName={product.title}
              productPrice={product.price}
              shopUsername={cleanUsername}
            />
          </div>
        </div>
      </main>

      {/* Мобильная версия кнопки связи */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 md:hidden pb-safe">
        <ContactSellerButton
          productName={product.title}
          productPrice={product.price}
          shopUsername={cleanUsername}
        />
      </div>
    </>
  );
}