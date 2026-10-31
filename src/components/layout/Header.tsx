"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { SellerAuthButton } from "@/components/layout/SellerAuthButton";
import { FavoritesButton } from "@/components/layout/FavoritesButton";
import { CartButton } from "@/components/layout/CartButton";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState("");

  // Синхронизируем локальный ввод с URL
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (query.trim()) {
      current.set("q", query.trim());
      current.delete("page"); // Сбрасываем пагинацию
    } else {
      current.delete("q");
    }
    
    router.push(`/?${current.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/95 backdrop-blur-md pt-safe">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:h-16 md:px-6">
        {/* 1. Логотип и навигация */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link
            href="/"
            className="shrink-0 text-base font-bold uppercase tracking-tight text-primary md:text-lg"
          >
            E-Vitrina PMR
          </Link>
          <Link
            href="/shops"
            className="hidden sm:inline-flex items-center text-sm font-medium text-text-muted hover:text-primary transition-colors"
          >
            Магазины
          </Link>
        </div>

        {/* 2. Строка поиска (только для десктопа) */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <form 
            onSubmit={handleSearch} 
            className="flex w-full max-w-xl items-center rounded-full border border-border bg-surface p-1 transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
          >
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти в Тирасполе..."
              className="w-full bg-transparent px-4 py-1.5 text-sm text-text-main outline-none placeholder:text-text-muted"
              aria-label="Поиск товаров"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-primary px-6 py-1.5 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              Найти
            </button>
          </form>
        </div>

        {/* 3. Правая панель */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Иконка поиска (только для мобилок) */}
          <button
            type="button"
            onClick={() => router.push("/?q=" + query)}
            className="group block rounded-full p-2 text-text-main transition-all hover:bg-surface hover:text-primary md:hidden"
            aria-label="Поиск"
          >
            <Search className="h-5 w-5 transition-transform group-hover:scale-110" />
          </button>

          {/* Кнопка Корзины */}
          <CartButton />

          {/* Кнопка Избранного */}
          <FavoritesButton />

          {/* Разделитель на десктопе */}
          <div className="hidden h-6 w-px bg-gray-200 md:block" />

          {/* Кнопка авторизации */}
          <SellerAuthButton />
        </div>
      </div>
    </header>
  );
}
