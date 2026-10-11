"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { MapPin, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export function ShopCityFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const raw = searchParams.get("cities") || "";
  const selectedCities = useMemo(() => (raw ? raw.split(",") : []), [raw]);

  // Закрывать при клике вне
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggle = useCallback(
    (city: string) => {
      const next = selectedCities.includes(city)
        ? selectedCities.filter((c) => c !== city)
        : [...selectedCities, city];
      const params = new URLSearchParams(searchParams.toString());
      if (next.length === 0) params.delete("cities");
      else params.set("cities", next.join(","));
      router.push(`/shops?${params.toString()}`, { scroll: false });
    },
    [selectedCities, searchParams, router]
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("cities");
    router.push(`/shops?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const label =
    selectedCities.length === 0
      ? "Все города"
      : selectedCities.length === 1
      ? selectedCities[0]
      : `${selectedCities.length} города`;

  const isActive = selectedCities.length > 0;

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all shadow-sm ${
          isActive
            ? "bg-rose-50 text-rose-700 border border-rose-300 ring-2 ring-rose-100"
            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
        }`}
      >
        <MapPin className={`h-4 w-4 shrink-0 ${isActive ? "text-rose-500" : "text-gray-400"}`} />
        <span>{label}</span>
        {isActive ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); clearAll(); }}
            className="ml-0.5 rounded-full p-0.5 text-rose-400 hover:bg-rose-200 hover:text-rose-700 transition-colors"
            title="Сбросить"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        ) : (
          <ChevronDown
            className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 z-50 w-56 rounded-2xl bg-white py-2 shadow-xl border border-gray-100"
          >
            <div className="flex items-center justify-between px-3 pb-1.5 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Город
              </span>
              {isActive && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[11px] font-medium text-rose-500 hover:text-rose-700 transition-colors"
                >
                  Сбросить
                </button>
              )}
            </div>
            {CITIES.map((city) => {
              const checked = selectedCities.includes(city);
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => toggle(city)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                    checked ? "text-rose-700" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      checked ? "border-rose-500 bg-rose-500" : "border-gray-300 bg-white"
                    }`}
                  >
                    {checked && (
                      <svg viewBox="0 0 10 8" className="h-2.5 w-2.5">
                        <path
                          d="M1 4l3 3 5-6"
                          stroke="white"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <MapPin
                    className={`h-3.5 w-3.5 shrink-0 ${checked ? "text-rose-500" : "text-gray-400"}`}
                  />
                  {city}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
