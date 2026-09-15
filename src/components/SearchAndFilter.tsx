"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import {
  Search,
  LayoutGrid,
  Shirt,
  Footprints,
  Sparkles,
  Droplet,
  Baby,
  Palette,
  Smartphone,
  Home,
  Gift,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Dumbbell
} from "lucide-react";

const CATEGORIES = [
  { name: "Все", icon: LayoutGrid },
  { name: "Одежда", icon: Shirt },
  { name: "Обувь", icon: Footprints },
  { name: "Косметика", icon: Sparkles },
  { name: "Парфюмерия", icon: Droplet },
  { name: "Детские товары", icon: Baby },
  { name: "Handmade", icon: Palette },
  { name: "Электроника", icon: Smartphone },
  { name: "Дом и декор", icon: Home },
  { name: "Подарки", icon: Gift },
  { name: "Еда и десерты", icon: Utensils },
  { name: "Спорт и отдых", icon: Dumbbell },
];

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

  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    
    setShowLeftArrow(scrollLeft > 2);
    setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 350;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
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

      {/* 2. Блок с категориями и подкатегориями */}
      <div className="mx-auto max-w-4xl space-y-4">
        
        {/* Главный слайдер категорий */}
        <div className="relative group">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 sm:-left-4 top-[44px] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-500 shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all hover:text-rose-600 hover:shadow-[0_4px_15px_rgba(0,0,0,0.15)] focus:outline-none xl:-left-8"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div 
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory overflow-x-auto pb-4 pt-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex gap-4 px-4 sm:gap-6 sm:px-8">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = currentCategory === cat.name;

                return (
                  <button
                    key={cat.name}
                    onClick={() => updateParams({ category: cat.name })}
                    className="group flex min-w-[76px] snap-start flex-col items-center gap-3 outline-none"
                  >
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-300 group-hover:scale-105 sm:h-18 sm:w-18 ${
                        isActive
                          ? "border-rose-600 bg-rose-50 text-rose-700 shadow-md"
                          : "border-gray-100 bg-white text-gray-400 shadow-sm group-hover:border-rose-200 group-hover:bg-rose-50/50 group-hover:text-rose-500"
                      }`}
                    >
                      <Icon
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        strokeWidth={isActive ? 2 : 1.5}
                      />
                    </div>
                    
                    <span
                      className={`text-[11px] font-semibold tracking-wide sm:text-xs transition-colors whitespace-nowrap ${
                        isActive
                          ? "text-gray-900"
                          : "text-gray-500 group-hover:text-gray-800"
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-2 sm:-right-4 top-[44px] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-500 shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all hover:text-rose-600 hover:shadow-[0_4px_15px_rgba(0,0,0,0.15)] focus:outline-none xl:-right-8"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 hidden w-16 bg-gradient-to-r from-white to-transparent sm:block"></div>
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 hidden w-16 bg-gradient-to-l from-white to-transparent sm:block"></div>
        </div>

        {/* 3. Подкатегории (Теги) - рендерятся динамически на основе словаря */}
        {activeSubCategories && (
          <div className="flex flex-wrap justify-center gap-2 px-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {activeSubCategories.map((sub) => {
              const isActive = currentSubCategory === sub;
              return (
                <button
                  key={sub}
                  onClick={() => toggleSubCategory(sub)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all sm:text-sm sm:px-5 sm:py-2 ${
                    isActive
                      ? "bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}