import { notFound } from "next/navigation";
import type { Metadata } from "next"; 
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { Pagination } from "@/components/Pagination";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types";

export const revalidate = 60;
const ITEMS_PER_PAGE = 12;

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

  if (!store) return { title: "Магазин не найден | E-Vitrina PMR" };

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
      "витрина ПМР",
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

  // 1. Параметры фильтрации
  const categoryFilter = typeof resolvedSearchParams.category === "string" ? resolvedSearchParams.category : undefined;
  const sortFilter = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "newest";
  const currentPage = Number(typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : "1") || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  let orderBy: any = { createdAt: "desc" };
  if (sortFilter === "price_asc") orderBy = { price: "asc" };
  if (sortFilter === "price_desc") orderBy = { price: "desc" };

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
    include: { user: true }
  });

  if (!store) notFound();

  // 3. Товары привязаны к userId (владельцу магазина)
  const productWhere: any = { 
    deletedAt: null, 
    userId: store.userId, 
    status: "Активен" 
  };
  
  if (categoryFilter && categoryFilter !== "all") {
    productWhere.category = categoryFilter;
  }

  // 4. Запрос товаров
  const [rawProducts, totalCount, distinctCategories] = await Promise.all([
    prisma.product.findMany({
      where: productWhere,
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.product.count({ where: productWhere }),
    prisma.product.findMany({
      where: { deletedAt: null, userId: store.userId, status: "Активен" },
      select: { category: true },
      distinct: ["category"],
    })
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const availableCategories = distinctCategories.map((p) => p.category).filter(Boolean) as string[];

  const cleanInstagram = store.instagram ? store.instagram.replace(/^@/, '') : store.user.instagram?.replace(/^@/, '');

  const products: Product[] = rawProducts.map((item: any) => ({
    id: item.id,
    title: item.title,
    price: item.price,
    category: item.category,
    images: item.images && item.images.length > 0 ? item.images : ["https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80"],
    shopName: store.name,
    shopUsername: cleanInstagram, 
    description: item.description,
    status: item.status,
    userId: item.userId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
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
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{store.name}</h1>
            
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

              {store.phone && (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-gray-700 shadow-sm border border-gray-100">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span>{store.phone}</span>
                </div>
              )}
            </div>

            {/* Описание */}
            {store.description && (
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-600 bg-white/50 px-6 py-4 rounded-2xl border border-gray-100">
                {store.description}
              </p>
            )}
          </div>

          <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Товары продавца ({totalCount})</h2>
          </div>

          {availableCategories.length > 0 && <ShopFilters categories={availableCategories} />}

          {products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              <Pagination totalPages={totalPages} currentPage={currentPage} />
            </>
          ) : (
            <div className="rounded-2xl bg-gray-50 py-16 text-center">
              {categoryFilter ? (
                <div>
                  <p className="mb-2 font-medium text-gray-500">В этой категории пока нет товаров.</p>
                  <a href={`/shop/${username}`} className="text-sm font-medium text-rose-600 underline hover:text-rose-700">Сбросить фильтры</a>
                </div>
              ) : (
                <p className="text-gray-500">Этот магазин пока не добавил товары.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}