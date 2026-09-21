"use client";

import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useEffect, useState } from "react";

export function FavoriteButton({ productId }: { productId: string }) {
  const isFavorite = useFavoritesStore((state) => state.favorites.includes(productId));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const [mounted, setMounted] = useState(false);

  // Ждем загрузки на клиенте, чтобы серверный и клиентский HTML совпали
  useEffect(() => {
    setMounted(true);
  }, []);

  // Пока компонент не смонтирован, показываем серое пустое сердечко
  if (!mounted) {
    return (
      <button className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 text-gray-400 backdrop-blur-sm">
        <Heart className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // Останавливаем клик, чтобы нас не перекинуло на страницу товара
        toggleFavorite(productId);
      }}
      className={`absolute right-3 top-3 z-10 rounded-full p-2 backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${
        isFavorite
          ? "bg-rose-50 text-rose-600 shadow-sm"
          : "bg-white/80 text-gray-400 hover:bg-white hover:text-rose-500 shadow-sm"
      }`}
    >
      <Heart
        className={`h-5 w-5 transition-all ${isFavorite ? "fill-current" : ""}`}
      />
    </button>
  );
}