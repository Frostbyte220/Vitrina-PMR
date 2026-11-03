"use client";

import { useEffect } from "react";
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
      const urlCat = searchParams.get("category");
      const urlSub = searchParams.get("sub");
      const urlPage = Number(searchParams.get("page")) || 1;
      initFromUrl(urlCat, urlSub, urlPage);
    }
  }, [searchParams, initFromUrl, isInitialized]);

  // Слушаем кнопки Назад/Вперед в браузере
  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      initFromUrl(
        url.searchParams.get("category"),
        url.searchParams.get("sub"),
        Number(url.searchParams.get("page")) || 1
      );
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [initFromUrl]);

  const handleSelect = (catName: string) => {
    if (selectedCategory === catName) {
      setCategory(null);
    } else {
      setCategory(catName);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <div className="flex space-x-3 sm:space-x-4 overflow-x-auto py-3 scrollbar-hide snap-x snap-mandatory md:flex-wrap md:justify-center md:gap-3.5 md:space-x-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {VISUAL_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.name;

          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => handleSelect(cat.name)}
              className={`flex min-w-[70px] sm:min-w-[76px] flex-col items-center gap-2 p-1 transition-all duration-100 hover:scale-105 active:scale-95 snap-start select-none cursor-pointer ${
                isActive ? "scale-105" : ""
              }`}
            >
              <div
                className={`flex h-13 w-13 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl ${cat.color} shadow-xs transition-all duration-100 ${
                  isActive ? "ring-2 ring-rose-500 shadow-md ring-offset-2 scale-105" : "hover:shadow-sm"
                }`}
              >
                <cat.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 1.75} />
              </div>
              <span
                className={`text-center text-[11px] font-medium leading-tight md:text-xs max-w-[80px] line-clamp-2 transition-colors ${
                  isActive ? "font-bold text-rose-700" : "text-gray-700"
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
