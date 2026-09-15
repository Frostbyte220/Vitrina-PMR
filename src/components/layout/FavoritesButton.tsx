"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFavoritesStore } from "@/store/useFavoritesStore";

export function FavoritesButton() {
  const [mounted, setMounted] = useState(false);
  const { favorites } = useFavoritesStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href="/favorites"
      className="group relative flex items-center justify-center rounded-full bg-white p-2.5 text-gray-700 shadow-sm outline outline-1 outline-gray-200 transition-all hover:bg-rose-50 hover:text-rose-600 hover:shadow-md hover:outline-rose-200"
      aria-label="Перейти в избранное"
    >
      <Heart className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
      
      {mounted && favorites.length > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
          {favorites.length > 99 ? "99+" : favorites.length}
        </span>
      )}
    </Link>
  );
}