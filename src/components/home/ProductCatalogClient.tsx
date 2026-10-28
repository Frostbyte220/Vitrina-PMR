"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { Pagination } from "@/components/Pagination";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface ProductCatalogClientProps {
  initialProducts: any[];
  initialTotalCount: number;
  initialTotalPages: number;
  initialPage: number;
}

export function ProductCatalogClient({
  initialProducts,
  initialTotalCount,
  initialTotalPages,
  initialPage,
}: ProductCatalogClientProps) {
  const searchParams = useSearchParams();
  const [products, setProducts]     = useState<any[]>(initialProducts);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isFetching, setIsFetching] = useState(false);
  const isFirstRender = useRef(true);
  const abortRef      = useRef<AbortController | null>(null);
  const paramsStr     = searchParams.toString();

  const category       = searchParams.get("category") ?? undefined;
  const q              = searchParams.get("q") ?? undefined;
  const page           = Number(searchParams.get("page")) || initialPage;
  const minPrice       = searchParams.get("minPrice") ?? undefined;
  const maxPrice       = searchParams.get("maxPrice") ?? undefined;
  const discount       = searchParams.get("discount") ?? undefined;
  const selectedCities = (searchParams.get("cities") ?? "").split(",").filter(Boolean);
  const selectedSizes  = (searchParams.get("sizes") ?? "").split(",").filter(Boolean);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsFetching(true);

    fetch(`/api/products?${paramsStr}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setTotalCount(data.totalCount ?? 0);
        setTotalPages(data.totalPages ?? 0);
        setIsFetching(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setIsFetching(false);
      });

    return () => controller.abort();
  }, [paramsStr]);

  const priceLabel = minPrice && maxPrice
    ? `${minPrice}–${maxPrice} Руб`
    : minPrice
    ? `от ${minPrice} Руб`
    : maxPrice
    ? `до ${maxPrice} Руб`
    : null;

  function HeadingText() {
    if (discount === "true") {
      return (
        <>
          Товары со скидкой{" "}
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
          Товары: <span className="text-rose-600 font-semibold">{selectedCities.join(", ")}</span>
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
          Товары <span className="text-rose-600 font-semibold">(размер: {selectedSizes.join(", ")})</span>
          {priceLabel && <span className="text-gray-500 font-normal text-sm ml-2">({priceLabel})</span>}
        </>
      );
    }
    if (priceLabel) {
      return <>Товары <span className="text-rose-600 font-semibold">({priceLabel})</span></>;
    }
    return <>Каталог товаров</>;
  }

  function emptyText() {
    if (discount === "true") return "Пока нет товаров со скидкой по вашим фильтрам";
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
    <div className="relative">
      {/* Плавающий спиннер — не заменяет контент, а висит поверх */}
      {isFetching && (
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-6 pointer-events-none">
          <div className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-lg border border-gray-100 backdrop-blur-sm">
            <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
            <span className="text-sm font-medium text-gray-600">Обновление...</span>
          </div>
        </div>
      )}

      <div
        style={{ transition: "opacity 150ms ease" }}
        className={isFetching ? "opacity-40 pointer-events-none" : "opacity-100"}
      >
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

        {products.length === 0 && !isFetching ? (
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
            <Pagination totalPages={totalPages} currentPage={page} />
          </>
        )}
      </div>
    </div>
  );
}
