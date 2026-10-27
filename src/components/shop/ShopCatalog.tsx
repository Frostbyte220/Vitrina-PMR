"use client";

import { useState, useMemo, useCallback, useEffect, useRef, useTransition } from "react";
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
  RotateCcw,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product } from "@/types";
import { fetchShopProducts, type FetchShopProductsParams } from "@/actions/shopProducts";

/** Метаданные магазина, передаваемые с сервера — нужны для повторных запросов при фильтрации */
type StoreMetadata = Omit<FetchShopProductsParams, "category" | "subCategory" | "sort" | "searchQuery" | "skip" | "take">;

interface ShopCatalogProps {
  /** Первая порция товаров, загруженная на сервере */
  initialProducts: Product[];
  /** Общее количество товаров, соответствующих начальным фильтрам */
  initialTotalCount: number;
  /** Есть ли ещё товары после первой порции */
  initialHasMore: boolean;
  /** Категории магазина (все, без фильтра) */
  categories: string[];
  /** Количество товаров по категориям (весь магазин) */
  categoryCounts: Record<string, number>;
  initialCategory?: string;
  initialSort?: string;
  /** Метаданные магазина для повторных запросов */
  storeMetadata: StoreMetadata;
}

const TAKE = 12;

const SORT_OPTIONS = [
  { value: "newest", label: "Сначала новые" },
  { value: "price_asc", label: "Сначала дешевые" },
  { value: "price_desc", label: "Сначала дорогие" },
  { value: "title_asc", label: "По названию" },
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
  initialProducts,
  initialTotalCount,
  initialHasMore,
  categories,
  categoryCounts,
  initialCategory = "all",
  initialSort = "newest",
  storeMetadata,
}: ShopCatalogProps) {
  // ── Состояние товаров ──────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [hasMore, setHasMore] = useState(initialHasMore);

  // ── Состояние фильтров ─────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<SortValue>(
    (SORT_OPTIONS.some((o) => o.value === initialSort) ? initialSort : "newest") as SortValue
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ── UI-состояние ───────────────────────────────────────────────────────────
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isLoadingMore, startLoadingMore] = useTransition();
  const [isFiltering, startFiltering] = useTransition();

  const sortRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Подкатегории вычисляем из уже загруженных товаров — они всегда есть
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

  // Закрытие сортировки кликом вне
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Синхронизация URL без перезагрузки страницы
  const syncUrl = useCallback((cat: string, sub: string, sort: string) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (cat && cat !== "all") params.set("category", cat);
    if (sub && sub !== "all") params.set("sub", sub);
    if (sort && sort !== "newest") params.set("sort", sort);
    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, []);

  // Базовая функция загрузки с нуля (смена фильтров)
  const loadFiltered = useCallback(
    (cat: string, sub: string, sort: SortValue, query: string) => {
      startFiltering(async () => {
        const result = await fetchShopProducts({
          ...storeMetadata,
          category: cat,
          subCategory: sub,
          sort,
          searchQuery: query,
          skip: 0,
          take: TAKE,
        });
        setProducts(result.products);
        setTotalCount(result.totalCount);
        setHasMore(result.hasMore);
      });
    },
    [storeMetadata]
  );

  // ── Обработчики смены фильтров ─────────────────────────────────────────────
  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      setSelectedSubCategory("all");
      syncUrl(category, "all", selectedSort);
      loadFiltered(category, "all", selectedSort, searchQuery);
    },
    [selectedSort, searchQuery, syncUrl, loadFiltered]
  );

  const handleSubCategoryChange = useCallback(
    (sub: string) => {
      setSelectedSubCategory(sub);
      syncUrl(selectedCategory, sub, selectedSort);
      loadFiltered(selectedCategory, sub, selectedSort, searchQuery);
    },
    [selectedCategory, selectedSort, searchQuery, syncUrl, loadFiltered]
  );

  const handleSortChange = useCallback(
    (sort: SortValue) => {
      setSelectedSort(sort);
      setIsSortOpen(false);
      syncUrl(selectedCategory, selectedSubCategory, sort);
      loadFiltered(selectedCategory, selectedSubCategory, sort, searchQuery);
    },
    [selectedCategory, selectedSubCategory, searchQuery, syncUrl, loadFiltered]
  );

  // Поиск с debounce
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        loadFiltered(selectedCategory, selectedSubCategory, selectedSort, value);
      }, 350);
    },
    [selectedCategory, selectedSubCategory, selectedSort, loadFiltered]
  );

  const handleResetFilters = useCallback(() => {
    setSelectedCategory("all");
    setSelectedSubCategory("all");
    setSearchQuery("");
    setSelectedSort("newest");
    syncUrl("all", "all", "newest");
    loadFiltered("all", "all", "newest", "");
  }, [syncUrl, loadFiltered]);

  // ── «Показать ещё» ─────────────────────────────────────────────────────────
  const handleLoadMore = useCallback(() => {
    startLoadingMore(async () => {
      const result = await fetchShopProducts({
        ...storeMetadata,
        category: selectedCategory,
        subCategory: selectedSubCategory,
        sort: selectedSort,
        searchQuery,
        skip: products.length,
        take: TAKE,
      });
      setProducts((prev) => [...prev, ...result.products]);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
    });
  }, [storeMetadata, selectedCategory, selectedSubCategory, selectedSort, searchQuery, products.length]);

  // ── Вычисляемые ────────────────────────────────────────────────────────────
  const isFiltered =
    selectedCategory !== "all" ||
    selectedSubCategory !== "all" ||
    searchQuery.trim().length > 0 ||
    selectedSort !== "newest";

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.value === selectedSort)?.label || "Сначала новые";

  // ── Пустое состояние при отсутствии товаров в магазине вообще ─────────────
  if (initialProducts.length === 0 && initialTotalCount === 0 && !isFiltered) {
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
      {/* ── 1. Заголовок + Поиск ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
            Товары магазина
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {isFiltered ? (
              <span>
                Найдено{" "}
                <strong className="text-rose-600 font-semibold">{totalCount}</strong>{" "}
                {getProductWord(totalCount)}
              </span>
            ) : (
              <span>
                Всего{" "}
                <strong className="text-gray-900 font-semibold">{totalCount}</strong>{" "}
                {getProductWord(totalCount)}
              </span>
            )}
          </p>
        </div>

        {/* Быстрый поиск */}
        <div className="relative w-full sm:w-64 md:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Поиск в этом магазине..."
            className="w-full rounded-full border border-gray-200/90 bg-white py-2 pl-10 pr-9 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 shadow-xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="Очистить поиск"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Категории + Сортировка ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-y border-gray-100 py-3.5">
        {/* Pill-навигация категорий */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* Все товары */}
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
              {Object.values(categoryCounts).reduce((a, b) => a + b, 0)}
            </span>
          </button>

          {/* Категории */}
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
                <CatIcon className={`h-4 w-4 ${isSelected ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
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

        {/* Сортировка + Сброс */}
        <div className="flex items-center justify-start sm:justify-end gap-2 shrink-0">
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
              <span className="truncate max-w-[150px]">{currentSortLabel}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-50 w-52 rounded-2xl bg-white p-1.5 shadow-xl border border-gray-100"
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

          {/* Кнопка сброса (если применены фильтры) */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer sm:order-first"
              title="Сбросить все фильтры"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Сбросить</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 3. Подкатегории ── */}
      {availableSubCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
            Подкатегория:
          </span>
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
      {isFiltering ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      ) : products.length > 0 ? (
        <>
          <ProductGrid products={products} />

          {/* Счётчик + кнопка «Показать ещё» */}
          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-sm text-gray-500">
                Показано{" "}
                <strong className="text-gray-900">{products.length}</strong> из{" "}
                <strong className="text-gray-900">{totalCount}</strong>{" "}
                {getProductWord(totalCount)}
              </p>
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Показать ещё
                  </>
                )}
              </button>
            </div>
          )}

          {/* Сообщение «показаны все товары» */}
          {!hasMore && totalCount > TAKE && (
            <p className="mt-6 text-center text-xs text-gray-400">
              Показаны все {totalCount} {getProductWord(totalCount)}
            </p>
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
