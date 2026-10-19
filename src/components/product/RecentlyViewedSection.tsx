"use client";

import { useEffect, useState } from "react";
import { History, Trash2 } from "lucide-react";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";
import { getRecentlyViewedProducts } from "@/actions/recentlyViewed";
import { ProductCarousel } from "./ProductCarousel";

interface RecentlyViewedSectionProps {
  currentProductId?: string;
  title?: string;
  className?: string;
}

export function RecentlyViewedSection({
  currentProductId,
  title = "Вы недавно смотрели",
  className = "",
}: RecentlyViewedSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

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
      setProducts([]);
      return;
    }

    let isCancelled = false;

    getRecentlyViewedProducts(recentlyViewed, currentProductId)
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

  if (!mounted || products.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <ProductCarousel
        title={title}
        icon={<History className="h-5 w-5" />}
        products={products}
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
