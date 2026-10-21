"use client";

import { useRef, useState, useEffect, ReactNode, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface ProductCarouselProps {
  title: string;
  icon?: ReactNode;
  viewAllHref?: string;
  viewAllText?: string;
  extraAction?: ReactNode;
  products: any[];
}

export function ProductCarousel({
  title,
  icon,
  viewAllHref,
  viewAllText = "Смотреть все",
  extraAction,
  products,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    // Проверяем возможность прокрутки сразу и с небольшой задержкой после отрисовки карточек
    checkScroll();
    const timer = setTimeout(checkScroll, 150);

    const el = scrollRef.current;
    if (!el) return () => clearTimeout(timer);

    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products, checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    // Ширина карточки с отступом (на десктопе 250px + 16px gap, на мобильных 210px + 16px gap)
    const isMobile = window.innerWidth < 640;
    const cardWidthWithGap = isMobile ? 226 : 266;
    const visibleCards = Math.max(1, Math.floor(el.clientWidth / cardWidthWithGap));
    const scrollAmount = visibleCards * cardWidthWithGap;

    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 sm:mt-16 relative">
      {/* Шапка блока */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">
              {title}
            </h2>
            <p className="text-xs text-gray-500">
              {products.length} {products.length === 1 ? "товар" : products.length < 5 ? "товара" : "товаров"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {extraAction}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 hover:underline transition-colors mr-1 sm:mr-2"
            >
              {viewAllText} →
            </Link>
          )}
        </div>
      </div>

      {/* Обертка карусели с кнопками по бокам */}
      <div className="relative group">
        {/* Аккуратная кнопка «Назад» слева */}
        <button
          type="button"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          aria-label="Листать назад"
          title="Предыдущие товары"
          className={`absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/95 text-gray-700 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-200 transition-all duration-200 hover:bg-white hover:text-rose-600 hover:border-rose-200 hover:scale-110 active:scale-95 ${
            canScrollLeft
              ? "opacity-100 cursor-pointer pointer-events-auto"
              : "opacity-0 cursor-default pointer-events-none"
          }`}
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" />
        </button>

        {/* Аккуратная кнопка «Вперед» справа */}
        <button
          type="button"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          aria-label="Листать вперед"
          title="Следующие товары"
          className={`absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/95 text-gray-700 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-200 transition-all duration-200 hover:bg-white hover:text-rose-600 hover:border-rose-200 hover:scale-110 active:scale-95 ${
            canScrollRight
              ? "opacity-100 cursor-pointer pointer-events-auto"
              : "opacity-0 cursor-default pointer-events-none"
          }`}
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" />
        </button>

        {/* Мягкие градиентные края-подсказки */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-gray-50/80 to-transparent z-10 transition-opacity duration-300" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-gray-50/80 to-transparent z-10 transition-opacity duration-300" />
        )}

        {/* Лента карточек товаров (скроллбар полностью скрыт) */}
        <div
          ref={scrollRef}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          className="flex gap-4 overflow-x-auto pb-4 pt-1.5 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((item) => (
            <div
              key={item.id}
              className="w-[210px] min-w-[210px] sm:w-[250px] sm:min-w-[250px] shrink-0 snap-start"
            >
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
