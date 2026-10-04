"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics";

const SUBCATEGORIES_MAP: Record<string, string[]> = {
  "Одежда": ["Для женщин", "Для мужчин", "Для детей"],
  "Обувь": ["Для женщин", "Для мужчин", "Для детей"],
  "Спорт и отдых": ["Для женщин", "Для мужчин", "Для детей"],
  "Косметика": ["Для женщин", "Для мужчин", "Унисекс"],
  "Парфюмерия": ["Для женщин", "Для мужчин", "Унисекс"],
};

const SORT_OPTIONS = [
  { value: "newest",     label: "Новые",   Icon: ArrowUpDown },
  { value: "price_asc",  label: "Дешевле", Icon: ArrowUp },
  { value: "price_desc", label: "Дороже",  Icon: ArrowDown },
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

  const [searchQuery, setSearchQuery] = useState(currentQuery);

  const updateParams = useCallback(
    (updates: { category?: string; q?: string; sub?: string | null; sort?: string }) => {
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

      params.delete("page");
      startTransition(() => {
        router.push(`/?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      trackEvent("search", { query: searchQuery.trim() });
    }
    updateParams({ q: searchQuery });
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
    <div className="w-full space-y-4">

      {/* 1. Поисковая строка */}
      <form onSubmit={handleSearch} className="relative mx-auto max-w-2xl px-4 sm:px-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск товаров, брендов или магазинов..."
          className="w-full rounded-full border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        />
        {isPending ? (
          <Loader2 className="absolute left-8 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-rose-500 sm:left-4" />
        ) : (
          <Search className="absolute left-8 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 sm:left-4" />
        )}
        <button type="submit" className="hidden" aria-label="Искать" />
      </form>

      {/* 2. Сортировка по цене */}
      <div className="flex justify-center gap-2 px-4">
        {SORT_OPTIONS.map(({ value, label, Icon }) => {
          const isActive = currentSort === value;
          return (
            <button
              key={value}
              onClick={() => updateParams({ sort: value })}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors sm:text-sm sm:px-5 sm:py-2 ${
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

      {/* 3. Подкатегории */}
      <div className="mx-auto max-w-4xl h-[40px] flex items-center justify-center">
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