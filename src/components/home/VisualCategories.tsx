"use client";

import { useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { VISUAL_CATEGORIES } from "@/lib/constants/categories";
import { useCatalogFilterStore } from "@/store/useCatalogFilterStore";

export function VisualCategories() {
  const searchParams = useSearchParams();
  const { selectedCategory, setCategory, initFromUrl, isInitialized } =
    useCatalogFilterStore();

  // Инициализация при первой загрузке из URL (если пользователь пришел по прямой ссылке)
  useEffect(() => {
    if (!isInitialized) {
      initFromUrl(searchParams);
    }
  }, [searchParams, initFromUrl, isInitialized]);

  // Слушаем кнопки Назад/Вперед в браузере (0 мс)
  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      initFromUrl(url.searchParams);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [initFromUrl]);

  const handleSelect = useCallback((catName: string) => {
    if (selectedCategory === catName) {
      setCategory(null);
    } else {
      setCategory(catName);
    }
  }, [selectedCategory, setCategory]);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
      {/* Лента категорий — перенос вместо прокрутки */}
      <div className="flex flex-wrap items-start justify-center gap-2 sm:gap-3 py-2">
        {VISUAL_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.name;

          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => handleSelect(cat.name)}
              className="group flex flex-col items-center gap-2 p-1 w-[70px] sm:w-[76px] transition-all duration-150 select-none cursor-pointer"
            >
              <div
                className={`flex h-13 w-13 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-150 ${
                  isActive
                    ? "bg-rose-600 text-white shadow-md shadow-rose-200 ring-2 ring-rose-500 ring-offset-2 border border-rose-600 scale-105"
                    : "bg-white text-gray-700 border border-gray-200/90 shadow-2xs group-hover:border-rose-300 group-hover:bg-rose-50/50 group-hover:text-rose-600 group-hover:shadow-xs group-hover:scale-105 group-active:scale-95"
                }`}
              >
                <cat.icon
                  className={`h-6 w-6 transition-transform duration-150 ${
                    isActive ? "scale-105 text-white" : "text-gray-700 group-hover:text-rose-600"
                  }`}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
              </div>
              <span
                className={`text-center text-[11px] font-medium leading-tight sm:text-xs max-w-[80px] line-clamp-2 transition-colors ${
                  isActive
                    ? "font-bold text-rose-700"
                    : "text-gray-700 group-hover:text-gray-900"
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
