// C:\Dima\Vitrina PMR\src\components\shop\ShopFilters.tsx

"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface ShopFiltersProps {
  categories: string[];
}

export function ShopFilters({ categories }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Функция для безопасного обновления параметров URL
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || !value) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  const currentCategory = searchParams.get("category") || "all";
  const currentSort = searchParams.get("sort") || "newest";

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-gray-50/80 p-4 sm:flex-row sm:items-center sm:justify-between border border-gray-100">
      
      {/* Фильтр по категориям */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Категория:</span>
        <select
          value={currentCategory}
          onChange={(e) => {
            router.push(`${pathname}?${createQueryString("category", e.target.value)}`, { scroll: false });
          }}
          className="ml-2 block w-full sm:w-auto rounded-lg border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
        >
          <option value="all">Все товары</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Сортировка */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Сортировка:</span>
        <select
          value={currentSort}
          onChange={(e) => {
            router.push(`${pathname}?${createQueryString("sort", e.target.value)}`, { scroll: false });
          }}
          className="ml-2 block w-full sm:w-auto rounded-lg border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
        >
          <option value="newest">Сначала новые</option>
          <option value="price_asc">Сначала дешевые</option>
          <option value="price_desc">Сначала дорогие</option>
        </select>
      </div>

    </div>
  );
}