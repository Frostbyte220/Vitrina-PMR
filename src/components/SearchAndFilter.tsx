"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Словарь подкатегорий: связываем название категории с массивом нужных тегов
const SUBCATEGORIES_MAP: Record<string, string[]> = {
  "Одежда": ["Для женщин", "Для мужчин", "Для детей"],
  "Обувь": ["Для женщин", "Для мужчин", "Для детей"],
  "Спорт и отдых": ["Для женщин", "Для мужчин", "Для детей"],
  "Косметика": ["Для женщин", "Для мужчин", "Унисекс"],
  "Парфюмерия": ["Для женщин", "Для мужчин", "Унисекс"],
};

export function SearchAndFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get("category") || "Все";
  const currentSubCategory = searchParams.get("sub") || "";
  const currentQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(currentQuery);

  const updateParams = useCallback(
    (updates: { category?: string; q?: string; sub?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.category !== undefined) {
        if (updates.category === "Все") {
          params.delete("category");
        } else {
          params.set("category", updates.category);
        }
        params.delete("sub"); // Сбрасываем подкатегорию при смене родительской
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

      params.delete("page"); 
      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchQuery });
  };

  const toggleSubCategory = (sub: string) => {
    if (currentSubCategory === sub) {
      updateParams({ sub: null });
    } else {
      updateParams({ sub });
    }
  };

  // Получаем нужные подкатегории для текущей выбранной категории (если они есть)
  const activeSubCategories = SUBCATEGORIES_MAP[currentCategory] || null;

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Поисковая строка */}
      <form onSubmit={handleSearch} className="relative mx-auto max-w-2xl px-4 sm:px-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск товаров, брендов или магазинов..."
          className="w-full rounded-full border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        />
        <Search className="absolute left-8 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 sm:left-4" />
        <button type="submit" className="hidden" aria-label="Искать"></button>
      </form>

      {/* 2. Подкатегории (Теги) - рендерятся динамически на основе словаря */}
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