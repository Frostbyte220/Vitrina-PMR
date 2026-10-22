import { notFound } from "next/navigation";
import type { Metadata } from "next"; 
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types";
import { Send, MessageCircle, Phone } from "lucide-react";
import { isHiddenStore } from "@/lib/storeFilter";
import { ShareButton } from "@/components/ui/ShareButton";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

export const revalidate = 60;

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

  const baseUrl = "https://vitrina-pmr.vercel.app";
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
  const currentPage = Number(typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : "1") || 1;

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

  // 3. Загружаем ВСЕ активные товары магазина одним быстрым запросом.
  // Это обеспечивает мгновенную фильтрацию и сортировку на клиенте (0ms задержки).
  const rawProducts = await prisma.product.findMany({
    where: {
      deletedAt: null,
      userId: store.userId,
      status: "Активен",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      oldPrice: true,
      category: true,
      subCategory: true,
      sizes: true,
      availability: true,
      images: true,
      description: true,
      status: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Автоматический подсчет категорий и количества товаров в каждой
  const categoryCounts: Record<string, number> = {};
  for (const item of rawProducts) {
    if (item.category) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    }
  }
  const availableCategories = Object.keys(categoryCounts).sort();

  const cleanInstagram = store.instagram ? store.instagram.replace(/^@/, '') : store.user.instagram?.replace(/^@/, '');

  const products: Product[] = rawProducts.map((item: any) => ({
    id: item.id,
    title: item.title,
    price: item.price,
    oldPrice: item.oldPrice,
    category: item.category,
    subCategory: item.subCategory,
    sizes: item.sizes || [],
    images: item.images && item.images.length > 0 ? item.images : ["https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80"],
    shopName: store.name,
    shopUsername: cleanInstagram, 
    description: item.description,
    status: item.status,
    availability: item.availability || "В наличии",
    userId: item.userId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    store: {
      name: store.name,
      slug: store.slug,
      instagram: store.instagram,
      avatarUrl: store.avatarUrl,
      cities: store.cities,
      telegram: store.telegram,
      viber: store.viber,
      phone: store.phone,
    },
  }));

  const storeInitial = store.name.charAt(0).toUpperCase();

  return (
    <>
      <Header />
      <main className="pb-12 bg-gray-50/50 min-h-screen">
        {/* Шапка профиля (Обложка на всю ширину) */}
        <div className="mx-auto max-w-7xl px-0 sm:px-4 lg:px-8 pt-4">
          <div className="relative h-48 w-full overflow-hidden sm:h-72 sm:rounded-[2.5rem] bg-gradient-to-r from-gray-100 to-gray-200 shadow-sm">
            {store.coverUrl && (
              <Image 
                src={store.coverUrl} 
                alt={`Обложка ${store.name}`}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
              />
            )}
            {/* Едва заметное затемнение для премиальности */}
            <div className="absolute inset-0 bg-black/5" />
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Центральный блок информации о магазине */}
          <div className="relative flex flex-col items-center mb-10 text-center">
            
            {/* Аватарка */}
            <div className="relative -mt-16 sm:-mt-20 mb-5 h-32 w-32 sm:h-40 sm:w-40 overflow-hidden rounded-full border-4 sm:border-8 border-gray-50 bg-white shadow-xl shrink-0 z-10 transition-transform duration-300 hover:scale-105">
              {store.avatarUrl ? (
                <Image
                  fill
                  sizes="(max-width: 768px) 128px, 160px"
                  src={store.avatarUrl}
                  alt={`Логотип ${store.name}`}
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-5xl font-bold text-gray-300">
                  {storeInitial}
                </div>
              )}
            </div>

            {/* Имя */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{store.name}</h1>
              {store.isVerified && <VerifiedBadge size="lg" showText />}
            </div>
            
            {/* Контакты / Теги */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm font-medium">
              {cleanInstagram && (
                <a 
                  href={`https://instagram.com/${cleanInstagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                  @{cleanInstagram}
                </a>
              )}
              
              {store.cities && store.cities.length > 0 && (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-gray-700 shadow-sm border border-gray-100">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>{store.cities.join(', ')}</span>
                </div>
              )}

              {store.telegram && (
                <a 
                  href={`https://t.me/${store.telegram.replace(/^@/, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-50 text-sky-600 transition-colors hover:bg-sky-100 hover:text-sky-700 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram</span>
                </a>
              )}

              {store.viber && (
                <a 
                  href={`viber://chat?number=%2B${store.viber.replace(/[^\d]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-50 text-purple-600 transition-colors hover:bg-purple-100 hover:text-purple-700 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Viber</span>
                </a>
              )}

              {store.phone && (
                <a 
                  href={`tel:${store.phone.replace(/[^\d+]/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100 transition-colors hover:bg-emerald-100 hover:text-emerald-800"
                >
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <span>{store.phone}</span>
                </a>
              )}

              <ShareButton
                title={store.name}
                text={`Магазин «${store.name}» на E-Vitrina PMR — каталог товаров локального бренда`}
                subtitle={store.cities && store.cities.length > 0 ? store.cities.join(", ") : "Магазин в ПМР"}
                imageUrl={store.avatarUrl || store.coverUrl}
                variant="pill"
                label="Поделиться"
                modalTitle="Поделиться магазином"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 shadow-sm"
              />
            </div>

            {/* Описание */}
            {store.description && (
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-600 bg-white/50 px-6 py-4 rounded-2xl border border-gray-100">
                {store.description}
              </p>
            )}
          </div>

          <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          <ShopCatalog
            products={products}
            categories={availableCategories}
            categoryCounts={categoryCounts}
            initialCategory={categoryFilter}
            initialSort={sortFilter}
            initialPage={currentPage}
          />
        </div>
      </main>
    </>
  );
}