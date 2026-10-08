"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition, useEffect, useRef } from "react";
import { Search, Loader2, ArrowUpDown, ArrowUp, ArrowDown, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";
import Image from "next/image";

const SUBCATEGORIES_MAP: Record<string, string[]> = {
  "Одежда": ["Для женщин", "Для мужчин", "Для детей"],
  "Обувь": ["Для женщин", "Для мужчин", "Для детей"],
  "Спорт и отдых": ["Для женщин", "Для мужчин", "Для детей"],
  "Косметика": ["Для женщин", "Для мужчин", "Унисекс"],
  "Парфюмерия": ["Для женщин", "Для мужчин", "Унисекс"],
};

const SORT_OPTIONS = [
  { value: "newest",     label: "Новые",               Icon: ArrowUpDown },
  { value: "price_asc",  label: "Сначала дешевые",     Icon: ArrowUp },
  { value: "price_desc", label: "Сначала дорогие",     Icon: ArrowDown },
] as const;

type SortValue = typeof SORT_OPTIONS[number]["value"];

export function SearchAndFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory    = searchParams.get("category") || "Все";
  const currentSubCategory = searchParams.get("sub") || "";
  const currentQuery       = searchParams.get("q") || "";
  const currentSort        = (searchParams.get("sort") || "newest") as SortValue;
  
  const currentMinPrice    = searchParams.get("minPrice") || "";
  const currentMaxPrice    = searchParams.get("maxPrice") || "";

  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  
  // Автокомплит (Live Search)
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);

  // Закрытие подсказок при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    
    setIsDebouncing(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsDebouncing(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const updateParams = useCallback(
    (updates: { category?: string; q?: string; sub?: string | null; sort?: string; minPrice?: string; maxPrice?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.category !== undefined) {
        if (updates.category === "Все") {
          params.delete("category");
        } else {
          params.set("category", updates.category);
        }
        params.delete("sub");
      }

      if (updates.q !== undefined) {
        if (updates.q.trim() === "") {
          params.delete("q");
        } else {
          params.set("q", updates.q.trim());
        }
      }

      if (updates.sub !== undefined) {
        if (updates.sub === null) {
          params.delete("sub");
        } else {
          params.set("sub", updates.sub);
        }
      }

      if (updates.sort !== undefined) {
        if (updates.sort === "newest") {
          params.delete("sort");
        } else {
          params.set("sort", updates.sort);
        }
      }
      
      if (updates.minPrice !== undefined) {
        if (!updates.minPrice) params.delete("minPrice");
        else params.set("minPrice", updates.minPrice);
      }
      
      if (updates.maxPrice !== undefined) {
        if (!updates.maxPrice) params.delete("maxPrice");
        else params.set("maxPrice", updates.maxPrice);
      }

      params.delete("page");
      startTransition(() => {
        router.push(`/?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      trackEvent("search", { query: searchQuery.trim() });
    }
    updateParams({ q: searchQuery, minPrice, maxPrice });
  };
  
  const applyPriceFilter = () => {
    updateParams({ minPrice, maxPrice });
  };

  const toggleSubCategory = (sub: string) => {
    if (currentSubCategory === sub) {
      updateParams({ sub: null });
    } else {
      updateParams({ sub });
    }
  };

  const activeSubCategories = SUBCATEGORIES_MAP[currentCategory] || null;

  return (
    <div className="w-full space-y-4 relative">

      {/* 1. Поисковая строка с автокомплитом */}
      <form ref={searchRef} onSubmit={handleSearch} className="relative mx-auto max-w-2xl px-4 sm:px-0 z-40">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Поиск товаров, брендов или магазинов..."
          className="w-full rounded-full border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        />
        {isPending || isDebouncing ? (
          <Loader2 className="absolute left-8 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-rose-500 sm:left-4" />
        ) : (
          <Search className="absolute left-8 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 sm:left-4" />
        )}
        <button type="submit" className="hidden" aria-label="Искать" />
        
        {/* Выпадающий список подсказок */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-4 right-4 sm:left-0 sm:right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <ul className="py-2">
                {suggestions.map((product) => (
                  <li key={product.id}>
                    <Link 
                      href={`/product/${product.id}`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <Image 
                          src={product.images[0]} 
                          alt={product.title} 
                          width={40} 
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 truncate">
                        <p className="truncate text-sm font-medium text-gray-900">{product.title}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                      <span className="font-semibold text-rose-600 shrink-0">{product.price} ₽</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 p-2 bg-gray-50 text-center">
                <button 
                  onClick={handleSearch}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700"
                >
                  Смотреть все результаты
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* 2. Фильтры и сортировка (Mobile scrollable, Desktop flex) */}
      <div className="mx-auto max-w-4xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-30">
        
        {/* Фильтр по цене */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
          <DollarSign className="h-4 w-4 text-gray-400 shrink-0" />
          <input 
            type="number" 
            placeholder="От"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-16 text-sm bg-transparent outline-none focus:text-rose-600 placeholder:text-gray-400"
          />
          <span className="text-gray-300">-</span>
          <input 
            type="number" 
            placeholder="До"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-16 text-sm bg-transparent outline-none focus:text-rose-600 placeholder:text-gray-400"
          />
          <button 
            onClick={applyPriceFilter}
            className="ml-1 text-xs font-medium text-white bg-gray-900 rounded-full px-3 py-1 hover:bg-rose-600 transition-colors shrink-0"
          >
            ОК
          </button>
        </div>

        {/* Сортировка */}
        <div className="flex justify-center sm:justify-end gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {SORT_OPTIONS.map(({ value, label, Icon }) => {
            const isActive = currentSort === value;
            return (
              <button
                key={value}
                onClick={() => updateParams({ sort: value })}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${
                  isActive
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Подкатегории */}
      <div className="mx-auto max-w-4xl h-[40px] flex items-center justify-center relative z-20">
        <AnimatePresence mode="popLayout">
          {activeSubCategories && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap justify-center gap-2 px-4"
            >
              {activeSubCategories.map((sub) => {
                const isActive = currentSubCategory === sub;
                return (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={sub}
                    onClick={() => toggleSubCategory(sub)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors sm:text-sm sm:px-5 sm:py-2 ${
                      isActive
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {sub}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
