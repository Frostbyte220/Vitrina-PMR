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
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => {
              const cleanInstagram = store.instagram ? store.instagram.trim().replace(/^@/, "") : "";
              const shopHref = cleanInstagram ? `/shop/${cleanInstagram}` : `/shop/${store.slug}`;
              const cityLabel = store.cities && store.cities.length > 0 ? store.cities.join(", ") : "ПМР";

              return (
                <Link 
                  key={store.id} 
                  href={shopHref}
                  className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:border-gray-200"
                >
                  {/* Обложка */}
                  <div className="h-32 w-full bg-gradient-to-r from-gray-100 to-gray-200 relative overflow-hidden">
                    {store.coverUrl ? (
                      <Image 
                        src={store.coverUrl} 
                        alt={`Обложка ${store.name}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-teal-50 opacity-80" />
                    )}
                    {/* Затемнение обложки сверху-вниз для читаемости (если нужно) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  
                  <div className="relative flex flex-col items-center px-6 pb-8 text-center">
                    {/* Аватарка (по центру, выходит за края) */}
                    <div className="relative -mt-12 mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-md shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:border-rose-50">
                      {store.avatarUrl ? (
                        <Image 
                          src={store.avatarUrl} 
                          alt={store.name} 
                          fill 
                          sizes="96px"
                          className="object-cover" 
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 text-3xl font-bold text-gray-400">
                          {store.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                      {store.name}
                    </h3>
                    
                    {cleanInstagram && (
                      <p className="mt-1 text-sm font-medium text-rose-500/80">
                        @{cleanInstagram}
                      </p>
                    )}
                    
                    <div className="mt-5 flex w-full items-center justify-center gap-6 text-sm text-gray-500 border-t border-gray-50 pt-5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="truncate max-w-[100px]">{cityLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StoreIcon className="h-4 w-4 text-gray-400" />
                        <span>{store._count.products} товаров</span>
                      </div>
                    </div>

                    {/* Декоративная "кнопка" перехода, появляется при наведении */}
                    <div className="absolute bottom-0 left-0 w-full translate-y-full bg-rose-600 py-3 text-center text-sm font-semibold text-white transition-transform duration-300 group-hover:translate-y-0">
                      Перейти в магазин
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
