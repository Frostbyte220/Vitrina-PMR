"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

// Вы можете изменить эти категории под ваш ассортимент
const CATEGORIES = ["Все", "Одежда", "Обувь", "Аксессуары"];

export function StoreFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Берем текущие значения из URL (если пользователь обновил страницу)
  const currentSearch = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "Все";

  const [searchValue, setSearchValue] = useState(currentSearch);

  // Смена категории
  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "Все") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    // Обновляем URL без перезагрузки страницы
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Поиск (с задержкой, чтобы не отправлять запросы при каждой букве)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue.trim()) {
        params.set("q", searchValue.trim());
      } else {
        params.delete("q");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300); // Задержка 300мс

    return () => clearTimeout(timeoutId);
  }, [searchValue, searchParams, pathname, router]);

  return (
    <div className="mb-8 flex flex-col gap-4">
      {/* Строка поиска */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-text-muted" aria-hidden="true" />
        </div>
        <input
          type="text"
          placeholder="Найти товар на Vitrina PMR..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full rounded-2xl border-0 bg-surface py-3.5 pl-11 pr-4 text-sm text-text-main ring-1 ring-inset ring-gray-200 transition-all placeholder:text-text-muted focus:bg-white focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      {/* Кнопки категорий */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`whitespace-nowrap rounded-xl px-5 py-2 text-sm font-medium transition-colors ${
              currentCategory === cat || (!searchParams.get("category") && cat === "Все")
                ? "bg-primary text-white shadow-sm hover:opacity-90"
                : "bg-surface text-text-main ring-1 ring-inset ring-gray-200 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}