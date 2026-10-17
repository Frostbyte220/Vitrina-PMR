"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product } from "@/types";

interface ShopCatalogProps {
  products: Product[];
  categories: string[];
  categoryCounts: Record<string, number>;
  initialCategory?: string;
  initialSort?: string;
  initialPage?: number;
}

const ITEMS_PER_PAGE = 12;

export function ShopCatalog({
  products,
  categories,
  categoryCounts,
  initialCategory = "all",
  initialSort = "newest",
  initialPage = 1,
}: ShopCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSort, setSelectedSort] = useState<string>(initialSort);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const containerRef = useRef<HTMLDivElement>(null);

  // Синхронизация URL в браузере без задержек и без серверного перерендера (0ms latency)
  const syncUrl = useCallback(
    (cat: string, sort: string, page: number) => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams();
      if (cat && cat !== "all") params.set("category", cat);
      if (sort && sort !== "newest") params.set("sort", sort);
      if (page > 1) params.set("page", page.toString());

      const qs = params.toString();
      const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    },
    []
  );

  // Поддержка кнопок "Назад" и "Вперед" в браузере
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedCategory(params.get("category") || "all");
      setSelectedSort(params.get("sort") || "newest");
      setCurrentPage(Number(params.get("page")) || 1);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Мгновенная смена категории (0 миллисекунд)
  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      setCurrentPage(1);
      syncUrl(category, selectedSort, 1);
    },
    [selectedSort, syncUrl]
  );

  // Мгновенная смена сортировки
  const handleSortChange = useCallback(
    (sort: string) => {
      setSelectedSort(sort);
      setCurrentPage(1);
      syncUrl(selectedCategory, sort, 1);
    },
    [selectedCategory, syncUrl]
  );

  // Мгновенная смена страницы с мягкой прокруткой
  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      syncUrl(selectedCategory, selectedSort, newPage);

      if (containerRef.current) {
        const top = containerRef.current.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    },
    [selectedCategory, selectedSort, syncUrl]
  );

  // Мгновенная фильтрация и сортировка товаров в памяти
  const filteredAndSortedProducts = useMemo(() => {
    let result = products;

    // Фильтр по категории
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Сортировка
    if (selectedSort === "price_asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price_desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else {
      // "newest" — по дате создания
      result = [...result].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return result;
  }, [products, selectedCategory, selectedSort]);

  // Пагинация
  const totalCount = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedProducts, currentPage]);

  if (products.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-50 py-16 text-center">
        <p className="text-gray-500">Этот магазин пока не добавил товары.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* 1. Заголовок каталога и быстрый выбор категорий (чипсы/вкладки) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Товары продавца{" "}
            <span className="text-rose-600 font-semibold">({totalCount})</span>
          </h2>
        </div>

        {/* Быстрые плашки категорий (Chips) для моментального переключения в 1 клик */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* Кнопка "Все товары" */}
            <button
              type="button"
              onClick={() => handleCategoryChange("all")}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-rose-600 text-white shadow-sm shadow-rose-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Все товары</span>
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[11px] ${
                  selectedCategory === "all"
                    ? "bg-rose-700 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {products.length}
              </span>
            </button>

            {/* Отдельные категории магазина */}
            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-rose-600 text-white shadow-sm shadow-rose-200"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[11px] ${
                      isSelected
                        ? "bg-rose-700 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Панель фильтров и сортировки (с селектом как на скриншоте) */}
      <div className="flex flex-col gap-4 rounded-2xl bg-gray-50/80 p-4 sm:flex-row sm:items-center sm:justify-between border border-gray-100">
        {/* Фильтр по категориям (выпадающий список) */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-500 shrink-0" />
          <span className="text-sm font-medium text-gray-700 shrink-0">Категория:</span>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="ml-2 block w-full sm:w-auto rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-800 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer shadow-xs transition-colors"
          >
            <option value="all">Все товары ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({categoryCounts[cat] || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Сортировка */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-gray-500 shrink-0" />
          <span className="text-sm font-medium text-gray-700 shrink-0">Сортировка:</span>
          <select
            value={selectedSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="ml-2 block w-full sm:w-auto rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-800 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer shadow-xs transition-colors"
          >
            <option value="newest">Сначала новые</option>
            <option value="price_asc">Сначала дешевые</option>
            <option value="price_desc">Сначала дорогие</option>
          </select>
        </div>
      </div>

      {/* 3. Сетка товаров */}
      {paginatedProducts.length > 0 ? (
        <>
          <ProductGrid products={paginatedProducts} />

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-300 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                title="Предыдущая страница"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <span className="text-sm font-medium text-gray-700">
                Страница {currentPage} из {totalPages}
              </span>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-300 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                title="Следующая страница"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl bg-gray-50 py-16 text-center border border-dashed border-gray-200">
          <p className="mb-2 font-medium text-gray-600">
            В категории «{selectedCategory}» пока нет товаров.
          </p>
          <button
            type="button"
            onClick={() => handleCategoryChange("all")}
            className="text-sm font-semibold text-rose-600 underline hover:text-rose-700 cursor-pointer"
          >
            Показать все товары магазина
          </button>
        </div>
      )}
    </div>
  );
}
