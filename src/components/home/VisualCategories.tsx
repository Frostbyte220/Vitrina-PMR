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
    <section className="mx-auto max-w-7xl px-4 pt-1 sm:px-6 lg:px-8">
      {/* Лента категорий — чистый горизонтальный скролл в 1 ряд с мягким затуханием по краям */}
      <div className="relative overflow-hidden py-1">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-50 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent z-10" />

        <div className="flex items-start justify-start lg:justify-center gap-2.5 sm:gap-3 py-1.5 overflow-x-auto scrollbar-hide px-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {VISUAL_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => handleSelect(cat.name)}
                className="group flex flex-col items-center gap-1.5 p-1 shrink-0 w-[68px] sm:w-[74px] transition-all duration-150 select-none cursor-pointer"
              >
                <div
                  className={`flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl transition-all duration-150 ${
                    isActive
                      ? "bg-rose-700 text-white shadow-md shadow-rose-200 ring-2 ring-rose-500 ring-offset-2 border border-rose-700 scale-105"
                      : "bg-white text-gray-700 border border-gray-200/90 shadow-2xs group-hover:border-rose-300 group-hover:bg-rose-50/50 group-hover:text-rose-700 group-hover:shadow-xs group-hover:scale-105 group-active:scale-95"
                  }`}
                >
                  <cat.icon
                    className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-150 ${
                      isActive ? "scale-105 text-white" : "text-gray-700 group-hover:text-rose-700"
                    }`}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                </div>
                <span
                  className={`text-center text-[10.5px] font-medium leading-tight sm:text-xs max-w-[76px] truncate transition-colors ${
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
      </div>
    </section>
  );
}
