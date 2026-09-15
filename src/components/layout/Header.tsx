"use client";

import { Search, Heart } from "lucide-react"; // 🔥 Добавили Heart
import Link from "next/link";
import { SellerAuthButton } from "@/components/layout/SellerAuthButton";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { useFavoritesStore } from "@/store/useFavoritesStore"; // 🔥 Импортируем наш стор

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Инициализируем стейт из URL
  const [query, setQuery] = useState("");
  
  // 🔥 Стейт для безопасного рендера данных из localStorage (защита от гидратации)
  const [mounted, setMounted] = useState(false);
  const { favorites } = useFavoritesStore();

  // Синхронизируем локальный ввод с URL
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Говорим реакту, что клиент загрузился и можно безопасно показывать счетчик
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (query.trim()) {
      current.set("q", query.trim());
      current.delete("page"); // Сбрасываем пагинацию
    } else {
      current.delete("q");
    }
    
    // Перекидываем на главную с параметрами поиска
    router.push(`/?${current.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:h-16 md:px-6">
        {/* 1. Логотип */}
        <Link
          href="/"
          className="shrink-0 text-base font-bold uppercase tracking-tight text-primary md:text-lg"
        >
          Vitrina PMR
        </Link>

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
        <div className="flex items-center gap-2 md:gap-4">
          {/* Иконка поиска (только для мобилок) */}
          <button
            type="button"
            onClick={() => router.push('/?q=' + query)} // На мобилке кидаем на главную к результатам
            className="group block rounded-full p-2 text-text-main transition-all hover:bg-surface hover:text-primary md:hidden"
            aria-label="Поиск"
          >
            <Search className="h-5 w-5 transition-transform group-hover:scale-110" />
          </button>

          {/* 🔥 Кнопка Избранного со счетчиком */}
          <Link 
            href="/favorites" 
            className="relative group flex items-center justify-center rounded-full p-2 text-gray-500 transition-all hover:bg-rose-50 hover:text-rose-600"
            aria-label="Перейти в избранное"
          >
            <Heart className="h-[22px] w-[22px] transition-transform group-hover:scale-110" />
            
            {/* Рендерим бейдж только если мы на клиенте и есть лайкнутые товары */}
            {mounted && favorites.length > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {favorites.length > 99 ? '99+' : favorites.length}
              </span>
            )}
          </Link>

          {/* Разделитель на десктопе */}
          <div className="hidden h-6 w-px bg-gray-200 md:block"></div>

          {/* Кнопка авторизации */}
          <SellerAuthButton />
        </div>
      </div>
    </header>
  );
}