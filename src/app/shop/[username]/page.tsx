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

  // Ищем магазин по instagram из настроек магазина ИЛИ из базового профиля пользователя
  const store = await prisma.store.findFirst({
    where: {
      OR: [
        { instagram: username },
        { instagram: `@${username}` },
        { user: { instagram: username } },
        { user: { instagram: `@${username}` } }
      ]
    },
    include: { user: true }
  });

  if (!store) return { title: "Магазин не найден | Vitrina PMR" };



  return {
    title: `${store.name} | Vitrina PMR`,
    description: store.description || `Каталог товаров магазина ${store.name}. Покупайте у локальных брендов ПМР.`,
    openGraph: {
      title: `${store.name} на Vitrina PMR`,
      description: store.description || `Смотрите товары от ${store.name} в едином каталоге Приднестровья.`,
      images: store.avatarUrl ? [store.avatarUrl] : [],
      type: "website",
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

  // 2. Ищем магазин по instagram (проверяем и таблицу Store, и таблицу User)
  const store = await prisma.store.findFirst({
    where: {
      OR: [
        { instagram: username },
        { instagram: `@${username}` },
        { user: { instagram: username } },
        { user: { instagram: `@${username}` } }
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
      <main className="mx-auto max-w-7xl pb-12">
        {/* Шапка профиля (Обложка) */}
        <div 
          className="h-48 w-full bg-gradient-to-r from-rose-100 via-purple-100 to-teal-100 object-cover sm:h-64 sm:rounded-b-3xl"
          style={store.coverUrl ? { backgroundImage: `url(${store.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        />

        <div className="px-4 sm:px-6">
          {/* Информация о магазине */}
          <div className="relative -mt-16 mb-8 flex flex-col items-center sm:-mt-20 sm:flex-row sm:items-end sm:gap-6">
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md sm:h-40 sm:w-40">
              {store.avatarUrl ? (
                <Image
                  fill
                  sizes="(max-width: 768px) 128px, 160px"
                  src={store.avatarUrl}
                  alt={`Логотип ${store.name}`}
                  className="object-cover"
                />
              ) : (
                <span className="text-5xl font-bold text-gray-300">{storeInitial}</span>
              )}
            </div>

            <div className="mt-4 flex-1 text-center sm:mt-0 sm:pb-4 sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{store.name}</h1>
              
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm sm:justify-start">
                {cleanInstagram && (
                  <a href={`https://instagram.com/${cleanInstagram}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center font-medium text-rose-600 transition-colors hover:text-rose-700">
                    @{cleanInstagram}
                  </a>
                )}
                
                {store.phone && (
                  <span className="flex items-center text-gray-600">
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {store.phone}
                  </span>
                )}
              </div>

              {store.cities && store.cities.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-sm text-gray-600">{store.cities.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {store.description && (
            <div className="mb-8 max-w-3xl rounded-2xl bg-gray-50 p-6">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{store.description}</p>
            </div>
          )}

          <div className="mb-6 h-px w-full bg-gray-200"></div>

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