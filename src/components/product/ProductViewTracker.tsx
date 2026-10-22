"use client";

import { useEffect } from "react";

interface ProductViewTrackerProps {
  productId: string;
}

export function ProductViewTracker({ productId }: ProductViewTrackerProps) {
  useEffect(() => {
    if (!productId || typeof window === "undefined") return;

    try {
      const storageKey = `pmr_v_${productId}`;
      // Защита от накрутки: если в текущей вкладке/сессии уже открывали этот товар
      if (sessionStorage.getItem(storageKey)) {
        return;
      }
      sessionStorage.setItem(storageKey, "1");

      // Фоновый неблокирующий запрос на учет просмотра
      fetch(`/api/products/${productId}/view`, {
        method: "POST",
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Игнорируем ошибки при отключенном sessionStorage
    }
  }, [productId]);

  return null;
}
