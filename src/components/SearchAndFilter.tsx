"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition, useEffect, useRef, useMemo } from "react";
import { Search, Loader2, ArrowUpDown, ArrowUp, ArrowDown, SlidersHorizontal, ChevronDown, X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";
import Image from "next/image";
import { CLOTHING_SIZES, SHOE_SIZES } from "@/lib/validations/product";

const SUBCATEGORIES_MAP: Record<string, string[]> = {
  "Одежда": ["Для женщин", "Для мужчин", "Для детей"],
  "Обувь": ["Для женщин", "Для мужчин", "Для детей"],
  "Спорт и отдых": ["Для женщин", "Для мужчин", "Для детей"],
  "Косметика": ["Для женщин", "Для мужчин", "Унисекс"],
  "Парфюмерия": ["Для женщин", "Для мужчин", "Унисекс"],
};

const SORT_OPTIONS = [
  { value: "newest",     label: "Сначала новые",       Icon: ArrowUpDown },
  { value: "oldest",     label: "Сначала старые",      Icon: ArrowUpDown },
  { value: "price_asc",  label: "Сначала дешевые",     Icon: ArrowUp },
  { value: "price_desc", label: "Сначала дорогие",     Icon: ArrowDown },
] as const;

type SortValue = typeof SORT_OPTIONS[number]["value"];

const CITIES = [
  "Тирасполь",
  "Бендеры",
  "Рыбница",
  "Дубоссары",
  "Григориополь",
  "Слободзея",
  "Каменка",
  "Днестровск",
];

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

  const currentCitiesRaw   = searchParams.get("cities") || "";
  const currentCities      = useMemo(
    () => (currentCitiesRaw ? currentCitiesRaw.split(",") : []),
    [currentCitiesRaw]
  );

  const currentSizesRaw    = searchParams.get("sizes") || "";
  const currentSizes       = useMemo(
    () => (currentSizesRaw ? currentSizesRaw.split(",") : []),
    [currentSizesRaw]
  );

  const isCategoryWithSize = currentCategory === "Одежда" || currentCategory === "Обувь";
  const categorySizes      = currentCategory === "Одежда" ? CLOTHING_SIZES : currentCategory === "Обувь" ? SHOE_SIZES : [];

  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  
  // Автокомплит (Live Search)
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);

  // Всплывающее меню диапазона цен
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const pricePopoverRef = useRef<HTMLDivElement>(null);

  // Выпадающее меню выбора города
  const [isCityOpen, setIsCityOpen] = useState(false);
  const cityPopoverRef = useRef<HTMLDivElement>(null);

  // Всплывающее меню выбора размера (для Одежда и Обувь)
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const sizePopoverRef = useRef<HTMLDivElement>(null);

  // Закрытие подсказок и меню цены при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (pricePopoverRef.current && !pricePopoverRef.current.contains(event.target as Node)) {
        setIsPriceOpen(false);
      }
      if (cityPopoverRef.current && !cityPopoverRef.current.contains(event.target as Node)) {
        setIsCityOpen(false);
      }
      if (sizePopoverRef.current && !sizePopoverRef.current.contains(event.target as Node)) {
        setIsSizeOpen(false);
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
    (updates: {
      category?: string;
      q?: string;
      sub?: string | null;
      sort?: string;
      minPrice?: string;
      maxPrice?: string;
      cities?: string[] | null;
      sizes?: string[] | null;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.category !== undefined) {
        if (updates.category === "Все") {
          params.delete("category");
        } else {
          params.set("category", updates.category);
        }
        params.delete("sub");
        // Если переключились на категорию, где нет размеров — удаляем фильтр размеров
        if (updates.category !== "Одежда" && updates.category !== "Обувь") {
          params.delete("sizes");
        }
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

      if (updates.cities !== undefined) {
        if (!updates.cities || updates.cities.length === 0) params.delete("cities");
        else params.set("cities", updates.cities.join(","));
      }

      if (updates.sizes !== undefined) {
        if (!updates.sizes || updates.sizes.length === 0) params.delete("sizes");
        else params.set("sizes", updates.sizes.join(","));
      }

      params.delete("page");
      startTransition(() => {
        router.push(`/?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router]
  );

  // Переключает один город в/из набора выбранных
  const toggleCity = useCallback((city: string) => {
    const next = currentCities.includes(city)
      ? currentCities.filter((c) => c !== city)
      : [...currentCities, city];
    updateParams({ cities: next.length > 0 ? next : null });
  }, [currentCities, updateParams]);

  // Переключает один размер в/из набора выбранных
  const toggleSize = useCallback((size: string) => {
    const next = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];
    updateParams({ sizes: next.length > 0 ? next : null });
  }, [currentSizes, updateParams]);

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
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                        {product.images && product.images.length > 0 ? (
                          <Image 
                            src={product.images[0]} 
                            alt={product.title || "Товар"} 
                            width={40} 
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="truncate text-sm font-medium text-gray-900">{product.title}</p>
                        <p className="text-xs text-gray-500">{product.category || "Без категории"}</p>
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

      {/* 2. Фильтры и сортировка (Лаконичный объединенный ряд) */}
      <div className="mx-auto max-w-4xl px-4 flex flex-wrap items-center justify-center gap-2 relative z-30">
        
        {/* Кнопка фильтра по городу (выпадающий popover) */}
        <div className="relative" ref={cityPopoverRef}>
          <button
            type="button"
            onClick={() => { setIsCityOpen(!isCityOpen); setIsPriceOpen(false); setIsSizeOpen(false); }}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all sm:text-sm shadow-sm ${
              currentCities.length > 0
                ? "bg-rose-50 text-rose-700 border border-rose-300 ring-2 ring-rose-100"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <MapPin className={`h-3.5 w-3.5 shrink-0 ${currentCities.length > 0 ? "text-rose-600" : "text-gray-500"}`} />
            <span>
              {currentCities.length === 0
                ? "Город"
                : currentCities.length === 1
                ? currentCities[0]
                : `${currentCities.length} города`}
            </span>
            {currentCities.length > 0 ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  updateParams({ cities: null });
                  setIsCityOpen(false);
                }}
                className="ml-1 rounded-full p-0.5 text-rose-500 hover:bg-rose-200 hover:text-rose-800 transition-colors"
                title="Сбросить города"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            ) : (
              <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isCityOpen ? "rotate-180" : ""}`} />
            )}
          </button>

          <AnimatePresence>
            {isCityOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full mt-2 z-50 w-56 rounded-2xl bg-white py-2 shadow-xl border border-gray-100"
              >
                <div className="flex items-center justify-between px-3 pb-1.5 pt-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Город</span>
                  {currentCities.length > 0 && (
                    <button
                      type="button"
                      onClick={() => updateParams({ cities: null })}
                      className="text-[11px] font-medium text-rose-500 hover:text-rose-700 transition-colors"
                    >
                      Сбросить
                    </button>
                  )}
                </div>
                {CITIES.map((city) => {
                  const isChecked = currentCities.includes(city);
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => toggleCity(city)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                        isChecked ? "text-rose-700" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {/* Чекбокс */}
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        isChecked ? "border-rose-500 bg-rose-500" : "border-gray-300 bg-white"
                      }`}>
                        {isChecked && (
                          <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-white">
                            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      <MapPin className={`h-3.5 w-3.5 shrink-0 ${isChecked ? "text-rose-500" : "text-gray-400"}`} />
                      {city}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Кнопка фильтра по размеру (только для категорий Одежда и Обувь) */}
        {isCategoryWithSize && (
          <div className="relative" ref={sizePopoverRef}>
            <button
              type="button"
              onClick={() => {
                setIsSizeOpen(!isSizeOpen);
                setIsCityOpen(false);
                setIsPriceOpen(false);
              }}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all sm:text-sm shadow-sm ${
                currentSizes.length > 0
                  ? "bg-rose-50 text-rose-700 border border-rose-300 ring-2 ring-rose-100"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <span>
                {currentSizes.length === 0
                  ? "Размер"
                  : currentSizes.length === 1
                  ? `Размер: ${currentSizes[0]}`
                  : `Размеры (${currentSizes.length})`}
              </span>
              {currentSizes.length > 0 ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateParams({ sizes: null });
                    setIsSizeOpen(false);
                  }}
                  className="ml-1 rounded-full p-0.5 text-rose-500 hover:bg-rose-200 hover:text-rose-800 transition-colors"
                  title="Сбросить размеры"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              ) : (
                <ChevronDown
                  className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
                    isSizeOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            <AnimatePresence>
              {isSizeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full mt-2 z-50 w-64 max-w-[90vw] rounded-2xl bg-white p-3 shadow-xl border border-gray-100"
                >
                  <div className="flex items-center justify-between px-1 pb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      {currentCategory === "Обувь" ? "Размер обуви" : "Размер одежды"}
                    </span>
                    {currentSizes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => updateParams({ sizes: null })}
                        className="text-[11px] font-medium text-rose-500 hover:text-rose-700 transition-colors"
                      >
                        Сбросить
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-0.5">
                    {categorySizes.map((size) => {
                      const isChecked = currentSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                            isChecked
                              ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-200"
                              : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Кнопка фильтра по цене (выпадающий popover) */}
        <div className="relative" ref={pricePopoverRef}>
          <button
            type="button"
            onClick={() => { setIsPriceOpen(!isPriceOpen); setIsCityOpen(false); setIsSizeOpen(false); }}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all sm:text-sm shadow-sm ${
              minPrice || maxPrice
                ? "bg-rose-50 text-rose-700 border border-rose-300 ring-2 ring-rose-100"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <SlidersHorizontal className={`h-3.5 w-3.5 ${minPrice || maxPrice ? "text-rose-600" : "text-gray-500"}`} />
            <span>
              {minPrice && maxPrice
                ? `${minPrice} – ${maxPrice} Руб`
                : minPrice
                ? `От ${minPrice} Руб`
                : maxPrice
                ? `До ${maxPrice} Руб`
                : "Цена"}
            </span>

            {minPrice || maxPrice ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setMinPrice("");
                  setMaxPrice("");
                  updateParams({ minPrice: "", maxPrice: "" });
                }}
                className="ml-1 rounded-full p-0.5 text-rose-500 hover:bg-rose-200 hover:text-rose-800 transition-colors"
                title="Сбросить цену"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            ) : (
              <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isPriceOpen ? "rotate-180" : ""}`} />
            )}
          </button>

          {/* Всплывающее аккуратное меню цены */}
          <AnimatePresence>
            {isPriceOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full mt-2 z-50 w-72 rounded-2xl bg-white p-4 shadow-xl border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-800">Диапазон цены</span>
                  <span className="text-[11px] font-medium text-gray-400">в Рублях</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="От"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          applyPriceFilter();
                          setIsPriceOpen(false);
                        }
                      }}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <span className="text-gray-300 font-medium">—</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="До"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          applyPriceFilter();
                          setIsPriceOpen(false);
                        }
                      }}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("");
                      updateParams({ minPrice: "", maxPrice: "" });
                      setIsPriceOpen(false);
                    }}
                    className="flex-1 rounded-xl py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Сбросить
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      applyPriceFilter();
                      setIsPriceOpen(false);
                    }}
                    className="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
                  >
                    Применить
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Кнопки сортировки */}
        {SORT_OPTIONS.map(({ value, label, Icon }) => {
          const isActive = currentSort === value;
          return (
            <button
              key={value}
              onClick={() => updateParams({ sort: value })}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all sm:text-sm shrink-0 shadow-sm ${
                isActive
                  ? "bg-rose-600 text-white shadow-rose-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
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
