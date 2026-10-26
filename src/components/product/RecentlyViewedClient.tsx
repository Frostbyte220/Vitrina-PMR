"use client";

import { useEffect, useState, useRef } from "react";
import { History, Trash2 } from "lucide-react";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";
import { getRecentlyViewedProducts } from "@/actions/recentlyViewed";
import { ProductCarousel } from "./ProductCarousel";

interface RecentlyViewedClientProps {
  initialProducts?: any[];
  currentProductId?: string;
  title?: string;
  className?: string;
}

export function RecentlyViewedClient({
  initialProducts = [],
  currentProductId,
  title = "Вы недавно смотрели",
  className = "",
}: RecentlyViewedClientProps) {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const productsRef = useRef(products);
  productsRef.current = products;

  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewedStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const filteredIds = currentProductId
      ? recentlyViewed.filter((id) => id !== currentProductId)
      : recentlyViewed;

    if (filteredIds.length === 0) {
      if (productsRef.current.length > 0) setProducts([]);
      return;
    }

    // Проверяем: совпадают ли уже отображаемые товары с текущими ID в store
    const currentRenderedIds = productsRef.current.map((p) => p.id);
    const isSame =
      currentRenderedIds.length === filteredIds.length &&
      filteredIds.every((id, idx) => currentRenderedIds[idx] === id);

    if (isSame) return;

    let isCancelled = false;

    getRecentlyViewedProducts(filteredIds, currentProductId)
      .then((data) => {
        if (!isCancelled) {
          setProducts(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load recently viewed products:", err);
      });

    return () => {
      isCancelled = true;
    };
  }, [mounted, recentlyViewed, currentProductId]);

  // Во время SSR показываем товары из кук (для SEO и моментального рендера)
  // После маунта на клиенте показываем актуальное состояние из Zustand/кук
  const displayProducts = mounted ? products : initialProducts;

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <ProductCarousel
        title={title}
        icon={<History className="h-5 w-5" />}
        products={displayProducts}
        extraAction={
          <button
            type="button"
            onClick={clearRecentlyViewed}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mr-2 cursor-pointer"
            title="Очистить историю просмотров"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Очистить</span>
          </button>
        }
      />
    </div>
  );
}
