import Link from "next/link";
import Image from "next/image";
import { Store, MapPin, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { HIDDEN_STORE_PRISMA_NOT, isHiddenStore } from "@/lib/storeFilter";

interface MatchingStoresProps {
  cities?: string;
}

export async function MatchingStores({ cities }: MatchingStoresProps) {
  const selectedCities = cities ? cities.split(",").filter(Boolean) : [];

  const whereClause =
    selectedCities.length > 0
      ? {
          cities: { hasSome: selectedCities },
          NOT: HIDDEN_STORE_PRISMA_NOT,
        }
      : { NOT: HIDDEN_STORE_PRISMA_NOT };

  const rawStores = await prisma.store.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      name: true,
      slug: true,
      instagram: true,
      avatarUrl: true,
      cities: true,
      _count: {
        select: {
          products: {
            where: { deletedAt: null, status: "Активен" },
          },
        },
      },
    },
  });

  const stores = rawStores.filter((s) => !isHiddenStore(s));

  if (stores.length === 0 && selectedCities.length === 0) {
    return null;
  }

  const shopsHref = selectedCities.length > 0
    ? `/shops?cities=${encodeURIComponent(selectedCities.join(","))}`
    : "/shops";

  return (
    <div className="mb-6 rounded-3xl bg-white p-4 shadow-sm border border-gray-100 sm:p-5">
      {/* Заголовок секции магазинов */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Store className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-900">
              {selectedCities.length > 0
                ? `Магазины: ${selectedCities.join(", ")}`
                : "Магазины Приднестровья"}
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500">
              {stores.length === 0
                ? "В выбранных городах нет магазинов"
                : `${stores.length} ${stores.length === 1 ? "магазин" : stores.length < 5 ? "магазина" : "магазинов"} с доставкой`}
            </p>
          </div>
        </div>

        <Link
          href={shopsHref}
          className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
        >
          <span>Все магазины</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {stores.length === 0 ? (
        <div className="py-6 text-center text-xs text-gray-400">
          Попробуйте выбрать другой город, чтобы найти локальные магазины.
        </div>
      ) : (
        /* Горизонтальный скролл магазинов */
        <div className="flex gap-3 overflow-x-auto pb-1 pt-2 scrollbar-hide snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {stores.map((store) => {
            const cleanInstagram = store.instagram
              ? store.instagram.trim().replace(/^@/, "")
              : "";
            const shopHref = cleanInstagram
              ? `/shop/${cleanInstagram}`
              : `/shop/${store.slug}`;
            const cityLabel =
              store.cities && store.cities.length > 0
                ? store.cities.slice(0, 2).join(", ")
                : "ПМР";

            return (
              <Link
                key={store.id}
                href={shopHref}
                className="group flex min-w-[170px] sm:min-w-[200px] items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-2.5 transition-all hover:bg-white hover:shadow-md hover:border-rose-100 snap-start"
              >
                {/* Аватарка */}
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                  {store.avatarUrl ? (
                    <Image
                      src={store.avatarUrl}
                      alt={store.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-100 to-orange-100 text-sm font-bold text-rose-800">
                      {store.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Инфо о магазине */}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                    {store.name}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500">
                    <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
                    <span className="truncate">{cityLabel}</span>
                  </div>
                  <span className="mt-0.5 inline-block text-[10px] font-medium text-rose-600">
                    {store._count.products} товаров
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
