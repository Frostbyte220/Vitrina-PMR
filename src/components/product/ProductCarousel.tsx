"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface ProductCarouselProps {
  title: string;
  icon?: ReactNode;
  viewAllHref?: string;
  viewAllText?: string;
  products: any[];
}

export function ProductCarousel({
  title,
  icon,
  viewAllHref,
  viewAllText = "Смотреть все",
  products,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 sm:mt-16">
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
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 hover:underline transition-colors mr-1 sm:mr-2"
            >
              {viewAllText} →
            </Link>
          )}

          {/* Стрелки прокрутки для десктопа */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Назад"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Вперед"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Карусель карточек */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
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
    </section>
  );
}
