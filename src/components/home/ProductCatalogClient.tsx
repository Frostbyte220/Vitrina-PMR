"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { Pagination } from "@/components/Pagination";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const ITEMS_PER_PAGE = 12;

interface ProductCatalogClientProps {
  initialProducts: any[];
  initialTotalCount: number;
  initialTotalPages: number;
  initialPage: number;
  catalogPool?: any[];
}

export function ProductCatalogClient({
  initialProducts,
  initialTotalCount,
  initialTotalPages: _initialTotalPages,
  initialPage,
  catalogPool,
}: ProductCatalogClientProps) {
  const searchParams = useSearchParams();
  const paramsStr = searchParams.toString();

  // Параметры фильтрации из URL
  const category       = searchParams.get("category") ?? undefined;
  const subCategory    = searchParams.get("sub") ?? undefined;
  const q              = (searchParams.get("q") ?? "").trim().toLowerCase();
  const page           = Number(searchParams.get("page")) || initialPage || 1;
  const sort           = searchParams.get("sort") || "newest";
  const minPrice       = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
  const maxPrice       = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
  const discount       = searchParams.get("discount") === "true";
  const availability   = searchParams.get("availability") ?? undefined;

  const selectedCities = useMemo(
    () => (searchParams.get("cities") ?? "").split(",").filter(Boolean),
    [searchParams]
  );

  const selectedSizes = useMemo(
    () => (searchParams.get("sizes") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    [searchParams]
  );

  // Полный пул каталога (загруженный на сервере)
  const pool = useMemo(() => {
    return catalogPool && catalogPool.length > 0 ? catalogPool : initialProducts;
  }, [catalogPool, initialProducts]);

  // Мгновенная in-memory фильтрация (< 1 мс, 60+ FPS)
  const inMemoryResult = useMemo(() => {
    const hasCategory = Boolean(category && category !== "Все");
    const hasCities = selectedCities.length > 0;
    const hasSizes = selectedSizes.length > 0;
    const hasMinPrice = minPrice !== null && !isNaN(minPrice);
    const hasMaxPrice = maxPrice !== null && !isNaN(maxPrice);

    // 1. Быстрая фильтрация O(N) в 1 проход
    const list = pool.filter((p: any) => {
      // Категория
      if (hasCategory && p.category !== category) return false;
      if (subCategory && p.subCategory !== subCategory) return false;

      // Скидка
      if (discount && (!p.oldPrice || p.oldPrice <= p.price)) return false;

      // Наличие
      if (availability) {
        const pAvail = p.availability || "В наличии";
        if (pAvail !== availability) return false;
      }

      // Диапазон цен
      if (hasMinPrice && p.price < minPrice!) return false;
      if (hasMaxPrice && p.price > maxPrice!) return false;

      // Размеры
      if (hasSizes) {
        const pSizes: string[] = Array.isArray(p.sizes) ? p.sizes : [];
        const matches = selectedSizes.some((s) => pSizes.includes(s));
        if (!matches) return false;
      }

      // Города доставки магазина
      if (hasCities) {
        const storeCities: string[] =
          p.store?.cities || p.user?.store?.cities || [];
        const matches = selectedCities.some((c) => storeCities.includes(c));
        if (!matches) return false;
      }

      // Поисковый запрос (по названию, описанию и имени магазина)
      if (q) {
        const titleMatch = (p.title || "").toLowerCase().includes(q);
        const descMatch = (p.description || "").toLowerCase().includes(q);
        const storeMatch = (p.store?.name || p.user?.store?.name || "").toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !storeMatch) return false;
      }

      return true;
    });

    // 2. Сортировка
    if (sort === "price_asc") {
      list.sort((a: any, b: any) => a.price - b.price);
    } else if (sort === "price_desc") {
      list.sort((a: any, b: any) => b.price - a.price);
    } else if (sort === "oldest") {
      list.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === "title_asc" || sort === "title") {
      list.sort((a: any, b: any) => (a.title || "").localeCompare(b.title || ""));
    } else {
      // newest
      list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const count = list.length;
    const pages = Math.ceil(count / ITEMS_PER_PAGE) || 1;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginated = list.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return {
      products: paginated,
      totalCount: count,
      totalPages: pages,
    };
  }, [
    pool,
    category,
    subCategory,
    discount,
    availability,
    minPrice,
    maxPrice,
    selectedSizes,
    selectedCities,
    q,
    sort,
    page,
  ]);

  // Серверный fallback для глубокого нечеткого поиска, если в памяти 0 совпадений по 'q'
  const [serverFallbackData, setServerFallbackData] = useState<{
    products: any[];
    totalCount: number;
    totalPages: number;
  } | null>(null);
  const [isFetchingFallback, setIsFetchingFallback] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Если текстовый поиск 'q' не нашел совпадений локально, делаем фоновый серверный fuzzy-поиск
    if (q && inMemoryResult.totalCount === 0) {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsFetchingFallback(true);
      fetch(`/api/products?${paramsStr}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => {
          if (data.products && data.products.length > 0) {
            setServerFallbackData({
              products: data.products,
              totalCount: data.totalCount ?? data.products.length,
              totalPages: data.totalPages ?? 1,
            });
          }
          setIsFetchingFallback(false);
        })
        .catch((e) => {
          if (e.name !== "AbortError") setIsFetchingFallback(false);
        });
    } else {
      setServerFallbackData(null);
    }
  }, [q, inMemoryResult.totalCount, paramsStr]);

  // Данные для отображения
  const activeData = (q && serverFallbackData) ? serverFallbackData : inMemoryResult;
  const products = activeData.products;
  const totalCount = activeData.totalCount;
  const totalPages = activeData.totalPages;

  const priceLabel = minPrice && maxPrice
    ? `${minPrice}–${maxPrice} Руб`
    : minPrice
    ? `от ${minPrice} Руб`
    : maxPrice
    ? `до ${maxPrice} Руб`
    : null;

  function HeadingText() {
    const isAvail = availability === "В наличии";
    const availPrefix = isAvail ? "В наличии: " : "";

    if (discount) {
      return (
        <>
          {isAvail ? "Товары в наличии со скидкой" : "Товары со скидкой"}{" "}
          {selectedCities.length > 0 && (
            <span className="text-rose-600 font-semibold">: {selectedCities.join(", ")}</span>
          )}
          {priceLabel && <span className="text-gray-500 font-normal text-sm ml-2">({priceLabel})</span>}
        </>
      );
    }
    if (selectedCities.length > 0) {
      return (
        <>
          {availPrefix}Товары: <span className="text-rose-600 font-semibold">{selectedCities.join(", ")}</span>
          {selectedSizes.length > 0 && (
            <span className="text-gray-500 font-normal text-sm ml-2">(размер: {selectedSizes.join(", ")})</span>
          )}
          {priceLabel && <span className="text-gray-500 font-normal text-sm ml-2">({priceLabel})</span>}
        </>
      );
    }
    if (selectedSizes.length > 0) {
      return (
        <>
          {availPrefix}Товары <span className="text-rose-600 font-semibold">(размер: {selectedSizes.join(", ")})</span>
          {priceLabel && <span className="text-gray-500 font-normal text-sm ml-2">({priceLabel})</span>}
        </>
      );
    }
    if (priceLabel) {
      return <>{availPrefix}Товары <span className="text-rose-600 font-semibold">({priceLabel})</span></>;
    }
    if (isAvail) {
      return <>Товары в наличии</>;
    }
    return <>Каталог товаров</>;
  }

  function emptyText() {
    if (discount && availability) return "Пока нет товаров в наличии со скидкой по вашим фильтрам";
    if (availability) return "Пока нет товаров в наличии по вашим фильтрам";
    if (discount) return "Пока нет товаров со скидкой по вашим фильтрам";
    if (minPrice || maxPrice) {
      const lbl = priceLabel ?? "";
      return `В диапазоне ${lbl} пока нет товаров`;
    }
    if (selectedCities.length > 0) return `В ${selectedCities.join(", ")} пока нет товаров по вашим фильтрам`;
    if (selectedSizes.length > 0)  return `В выбранных размерах (${selectedSizes.join(", ")}) пока нет товаров`;
    if (q) return `По запросу «${q}» ничего не найдено`;
    return "По вашим фильтрам ничего не найдено";
  }

  return (
    <div className="relative min-h-[500px]">
      {/* Фоновый индикатор только при глубоком серверном поиске */}
      {isFetchingFallback && (
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-6 pointer-events-none">
          <div className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-lg border border-gray-100 backdrop-blur-sm">
            <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
            <span className="text-sm font-medium text-gray-600">Глубокий поиск...</span>
          </div>
        </div>
      )}

      {/* Заголовок + счётчик */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">
          <HeadingText />
        </h2>
        <span className="text-xs sm:text-sm text-gray-500">
          {totalCount}{" "}
          {totalCount === 1 ? "товар" : totalCount < 5 ? "товара" : "товаров"}
        </span>
      </div>

      {products.length === 0 && !isFetchingFallback ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900">{emptyText()}</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
            Попробуйте изменить параметры или сбросить фильтры.
          </p>
          <Link
            href="/"
            className="mt-6 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Сбросить фильтры
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product as any}
                priority={i < 4}
                activeCities={selectedCities}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination totalPages={totalPages} currentPage={page} />
          )}
        </>
      )}
    </div>
  );
}
