import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Store as StoreIcon, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Магазины и бренды",
  description: "Каталог всех локальных магазинов, брендов и продавцов Приднестровья (ПМР).",
};

export const revalidate = 60; // Обновляем кэш раз в 60 секунд

export default async function ShopsPage() {
  // Получаем магазины, сортируем по дате создания, чтобы новые были сверху
  // Можно также добавить условие, чтобы показывать только магазины, у которых есть товары: 
  // where: { products: { some: { deletedAt: null } } }
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: "desc" },
    take: 50, // Ограничиваем количество магазинов для производительности
    select: {
      id: true,
      name: true,
      slug: true,
      instagram: true,
      cities: true,
      coverUrl: true,
      avatarUrl: true,
      _count: {
        select: {
          products: {
            where: { deletedAt: null, status: "Активен" }
          }
        }
      }
    }
  });

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Шапка */}
      <section className="bg-white px-4 py-12 shadow-sm sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Магазины и бренды
          </h1>
          <p className="mt-4 text-base text-gray-500">
            Список всех продавцов на нашей платформе. Поддержите локальный бизнес Приднестровья!
          </p>
        </div>
      </section>

      {/* Список магазинов */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
            <StoreIcon className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Пока нет зарегистрированных магазинов</h3>
            <p className="mt-2 text-sm text-gray-500">
              Станьте первым, кто разместит свои товары!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => {
              const cleanInstagram = store.instagram ? store.instagram.trim().replace(/^@/, "") : "";
              const shopHref = cleanInstagram ? `/shop/${cleanInstagram}` : `/shop/${store.slug}`;
              const cityLabel = store.cities && store.cities.length > 0 ? store.cities.join(", ") : "ПМР";

              return (
                <Link 
                  key={store.id} 
                  href={shopHref}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 transition-all duration-200 hover:shadow-lg hover:border-gray-200"
                >
                  {/* Обложка */}
                  <div className="h-24 w-full bg-gradient-to-r from-rose-100 to-teal-100 relative">
                    {store.coverUrl && (
                      <Image 
                        src={store.coverUrl} 
                        alt={`Обложка ${store.name}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="relative px-5 pb-5">
                    {/* Аватарка (сдвинута вверх на границу обложки) */}
                    <div className="relative -mt-10 mb-3 h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-sm shrink-0">
                      {store.avatarUrl ? (
                        <Image 
                          src={store.avatarUrl} 
                          alt={store.name} 
                          fill 
                          sizes="80px"
                          className="object-cover" 
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 text-2xl font-bold text-gray-400">
                          {store.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-rose-700 transition-colors">
                      {store.name}
                    </h3>
                    
                    {cleanInstagram && (
                      <p className="text-sm font-medium text-rose-600 mt-1">
                        @{cleanInstagram}
                      </p>
                    )}
                    
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[120px]">{cityLabel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                        <span>Товаров: {store._count.products}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
