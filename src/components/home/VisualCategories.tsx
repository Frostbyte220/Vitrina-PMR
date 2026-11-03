"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VISUAL_CATEGORIES } from "@/lib/constants/categories";
import { useCatalogFilterStore } from "@/store/useCatalogFilterStore";

export function VisualCategories() {
  const searchParams = useSearchParams();
  const { selectedCategory, setCategory, initFromUrl, isInitialized } =
    useCatalogFilterStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Проверка возможности горизонтального скролла для отображения стрелок на десктопе
  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [updateScrollButtons]);

  // Плавная прокрутка стрелками
  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -320 : 320;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

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

  const handleSelect = (catName: string) => {
    if (selectedCategory === catName) {
      setCategory(null);
    } else {
      setCategory(catName);
    }
  };

  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
      {/* Стрелка прокрутки влево (десктоп) */}
      {canScrollLeft && (
        <div className="absolute left-2 sm:left-4 top-[38px] -translate-y-1/2 z-20 hidden md:flex items-center">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Прокрутить назад"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-md border border-gray-200/90 backdrop-blur-xs transition-all hover:bg-white hover:text-rose-600 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Горизонтальная лента категорий в едином стиле */}
      <div
        ref={scrollRef}
        className="flex items-start gap-2.5 sm:gap-3.5 overflow-x-auto py-2.5 px-1 scrollbar-hide snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {VISUAL_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.name;

          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => handleSelect(cat.name)}
              className="group flex min-w-[70px] sm:min-w-[76px] flex-col items-center gap-2 p-1 transition-all duration-150 snap-start select-none cursor-pointer"
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

      {/* Стрелка прокрутки вправо (десктоп) */}
      {canScrollRight && (
        <div className="absolute right-2 sm:right-4 top-[38px] -translate-y-1/2 z-20 hidden md:flex items-center">
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Прокрутить вперед"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-md border border-gray-200/90 backdrop-blur-xs transition-all hover:bg-white hover:text-rose-600 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
}
