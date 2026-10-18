"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  LayoutGrid,
  Shirt,
  Footprints,
  Sparkles,
  Flame,
  Dumbbell,
  Smartphone,
  Tag,
  ArrowUpDown,
  Check,
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const SORT_OPTIONS = [
  { value: "newest", label: "Сначала новые" },
  { value: "price_asc", label: "Сначала дешевые" },
  { value: "price_desc", label: "Сначала дорогие" },
  { value: "title_asc", label: "По названию (А–Я)" },
] as const;

type SortValue = typeof SORT_OPTIONS[number]["value"];

function getCategoryIcon(cat: string) {
  switch (cat.toLowerCase().trim()) {
    case "all":
    case "все товары":
    case "все":
      return LayoutGrid;
    case "одежда":
      return Shirt;
    case "обувь":
      return Footprints;
    case "косметика":
      return Sparkles;
    case "парфюмерия":
      return Flame;
    case "спорт и отдых":
    case "спорт":
      return Dumbbell;
    case "электроника":
      return Smartphone;
    default:
      return Tag;
  }
}

function getProductWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return "товаров";
  if (mod10 === 1) return "товар";
  if (mod10 >= 2 && mod10 <= 4) return "товара";
  return "товаров";
}

export function ShopCatalog({
  products,
  categories,
  categoryCounts,
  initialCategory = "all",
  initialSort = "newest",
  initialPage = 1,
}: ShopCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<SortValue>(
    (SORT_OPTIONS.some((o) => o.value === initialSort) ? initialSort : "newest") as SortValue
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  // Состояние открытого выпадающего меню сортировки
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Закрытие выпадающего меню при клике вне
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Синхронизация URL в браузере без задержек и без серверного перерендера (0ms latency)
  const syncUrl = useCallback(
    (cat: string, sub: string, sort: string, page: number) => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams();
      if (cat && cat !== "all") params.set("category", cat);
      if (sub && sub !== "all") params.set("sub", sub);
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
      setSelectedSubCategory(params.get("sub") || "all");
      const s = params.get("sort");
      setSelectedSort((SORT_OPTIONS.some((o) => o.value === s) ? s : "newest") as SortValue);
      setCurrentPage(Number(params.get("page")) || 1);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Мгновенная смена категории (0 миллисекунд)
  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      setSelectedSubCategory("all"); // Сбрасываем подкатегорию при смене главной
      setCurrentPage(1);
      syncUrl(category, "all", selectedSort, 1);
    },
    [selectedSort, syncUrl]
  );

  // Мгновенная смена подкатегории
  const handleSubCategoryChange = useCallback(
    (sub: string) => {
      setSelectedSubCategory(sub);
      setCurrentPage(1);
      syncUrl(selectedCategory, sub, selectedSort, 1);
    },
    [selectedCategory, selectedSort, syncUrl]
  );

  // Мгновенная смена сортировки
  const handleSortChange = useCallback(
    (sort: SortValue) => {
      setSelectedSort(sort);
      setIsSortOpen(false);
      setCurrentPage(1);
      syncUrl(selectedCategory, selectedSubCategory, sort, 1);
    },
    [selectedCategory, selectedSubCategory, syncUrl]
  );

  // Сброс всех фильтров
  const handleResetFilters = useCallback(() => {
    setSelectedCategory("all");
    setSelectedSubCategory("all");
    setSearchQuery("");
    setSelectedSort("newest");
    setCurrentPage(1);
    syncUrl("all", "all", "newest", 1);
  }, [syncUrl]);

  // Мгновенная смена страницы с мягкой прокруткой
  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      syncUrl(selectedCategory, selectedSubCategory, selectedSort, newPage);

      if (containerRef.current) {
        const top = containerRef.current.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    },
    [selectedCategory, selectedSubCategory, selectedSort, syncUrl]
  );

  // Получаем список подкатегорий для выбранной категории (если они есть)
  const availableSubCategories = useMemo(() => {
    if (selectedCategory === "all") return [];
    const counts: Record<string, number> = {};
    for (const p of products) {
      if (p.category === selectedCategory && p.subCategory) {
        counts[p.subCategory] = (counts[p.subCategory] || 0) + 1;
      }
    }
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [products, selectedCategory]);

  // Мгновенная фильтрация и сортировка товаров в памяти (0мс)
  const filteredAndSortedProducts = useMemo(() => {
    let result = products;

    // 1. Фильтр по категории
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 2. Фильтр по подкатегории
    if (selectedSubCategory && selectedSubCategory !== "all") {
      result = result.filter((p) => p.subCategory === selectedSubCategory);
    }

    // 3. Поиск по названию товара внутри магазина
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // 4. Сортировка
    if (selectedSort === "price_asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price_desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (selectedSort === "title_asc") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title, "ru"));
    } else {
      // "newest" — по дате создания
      result = [...result].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return result;
  }, [products, selectedCategory, selectedSubCategory, searchQuery, selectedSort]);

  // Пагинация
  const totalCount = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedProducts, currentPage]);

  const isFiltered =
    selectedCategory !== "all" ||
    selectedSubCategory !== "all" ||
    searchQuery.trim().length > 0 ||
    selectedSort !== "newest";

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.value === selectedSort)?.label || "Сначала новые";

  if (products.length === 0) {
    return (
      <div className="rounded-3xl bg-gray-50/80 p-12 text-center border border-gray-100">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 mb-3">
          <Tag className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900">В магазине пока нет товаров</h3>
        <p className="mt-1 text-sm text-gray-500">Продавец ещё не опубликовал товары.</p>
      </div>
    );
  }

  const AllIcon = getCategoryIcon("all");

  return (
    <div ref={containerRef} className="space-y-5">
      {/* ── 1. Верхний уровень: Заголовок с количеством + Живой поиск ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
            Товары магазина
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {totalCount === products.length ? (
              <span>
                Всего <strong className="text-gray-900 font-semibold">{products.length}</strong>{" "}
                {getProductWord(products.length)}
              </span>
            ) : (
              <span>
                Найдено <strong className="text-rose-600 font-semibold">{totalCount}</strong> из{" "}
                {products.length} {getProductWord(products.length)}
              </span>
            )}
          </p>
        </div>

        {/* Быстрый поиск внутри магазина */}
        <div className="relative w-full sm:w-64 md:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Поиск в этом магазине..."
            className="w-full rounded-full border border-gray-200/90 bg-white py-2 pl-10 pr-9 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 shadow-xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="Очистить поиск"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Панель фильтров: Стильные Категории + Сортировка ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-y border-gray-100 py-3.5">
        {/* Горизонтальные плашки категорий (Pill Navigation) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* Кнопка "Все товары" */}
          <button
            type="button"
            onClick={() => handleCategoryChange("all")}
            className={`group relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
              selectedCategory === "all"
                ? "bg-rose-600 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-600/20"
                : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 shadow-xs"
            }`}
          >
            <AllIcon className={`h-4 w-4 ${selectedCategory === "all" ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
            <span>Все товары</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold tracking-tight transition-colors ${
                selectedCategory === "all"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600 group-hover:bg-gray-200/80"
              }`}
            >
              {products.length}
            </span>
          </button>

          {/* Плашки отдельных категорий */}
          {categories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isSelected = selectedCategory === cat;
            const CatIcon = getCategoryIcon(cat);

            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`group relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
                  isSelected
                    ? "bg-rose-600 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-600/20"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 shadow-xs"
                }`}
              >
                <CatIcon
                  className={`h-4 w-4 ${isSelected ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}
                />
                <span>{cat}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold tracking-tight transition-colors ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-gray-200/80"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Правый блок: Сортировка (стильный выпадающий список) + Кнопка сброса */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {/* Кнопка сброса (если применены фильтры) */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
              title="Сбросить все фильтры"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Сбросить</span>
            </button>
          )}

          {/* Выпадающее меню сортировки */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
              <span className="truncate max-w-[150px]">{currentSortLabel}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
                  isSortOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl bg-white p-1.5 shadow-xl border border-gray-100"
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Сортировка
                  </div>
                  <div className="space-y-0.5">
                    {SORT_OPTIONS.map((option) => {
                      const isActive = selectedSort === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSortChange(option.value)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                            isActive
                              ? "bg-rose-50 text-rose-700 font-semibold"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <span>{option.label}</span>
                          {isActive && <Check className="h-4 w-4 text-rose-600" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── 3. Подкатегории (если есть у выбранной категории) ── */}
      {availableSubCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
            Подкатегория:
          </span>

          {/* Все подкатегории */}
          <button
            type="button"
            onClick={() => handleSubCategoryChange("all")}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
              selectedSubCategory === "all"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Все ({categoryCounts[selectedCategory] || 0})
          </button>

          {/* Отдельные подкатегории */}
          {availableSubCategories.map((sub) => {
            const isSubSelected = selectedSubCategory === sub.name;
            return (
              <button
                key={sub.name}
                type="button"
                onClick={() => handleSubCategoryChange(sub.name)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                  isSubSelected
                    ? "bg-gray-900 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {sub.name} ({sub.count})
              </button>
            );
          })}
        </div>
      )}

      {/* ── 4. Сетка товаров ── */}
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
        <div className="rounded-3xl bg-gray-50/70 py-16 px-6 text-center border-2 border-dashed border-gray-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs text-gray-400 mb-3">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            {searchQuery
              ? `Ничего не найдено по запросу «${searchQuery}»`
              : selectedCategory !== "all"
              ? `В категории «${selectedCategory}» пока нет товаров`
              : "Товары не найдены"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? "Попробуйте изменить формулировку поиска или сбросить фильтры."
              : "Попробуйте выбрать другую категорию или посмотреть все товары."}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Показать все товары</span>
          </button>
        </div>
      )}
    </div>
  );
}
