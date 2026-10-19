"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";

export function RecentlyViewedTracker({ productId }: { productId: string }) {
  const addProduct = useRecentlyViewedStore((s) => s.addProduct);

  useEffect(() => {
    if (productId) {
      addProduct(productId);
    }
  }, [productId, addProduct]);

  return null;
}
