"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, Sparkles, Store } from "lucide-react";
import { VISUAL_CATEGORIES, SUBCATEGORIES_MAP } from "@/lib/constants/categories";
import { useCatalogFilterStore } from "@/store/useCatalogFilterStore";

interface CatalogMegaMenuProps {
  className?: string;
}

export function CatalogMegaMenu({ className = "" }: CatalogMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("Одежда");
  const categoriesListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    selectedCategory,
    setCategory,
    setSubCategory,
    resetFilters,
  } = useCatalogFilterStore();

  // Синхронизируем активную вкладку меню с выбранной категорией на сайте
  useEffect(() => {
    if (selectedCategory && selectedCategory !== "Все") {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  // Сброс прокрутки списка категорий наверх при открытии
  useEffect(() => {
    if (isOpen && categoriesListRef.current) {
      categoriesListRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  // Блокировка скролла страницы при открытом каталоге
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Закрытие по Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const scrollToProducts = () => {
    setTimeout(() => {
      const el = document.getElementById("catalog-products");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  const handleSelectCategory = (catName: string) => {
    setCategory(catName);
    setSubCategory(null);
    setIsOpen(false);
    scrollToProducts();
  };

  const handleSelectSubCategory = (catName: string, subName: string) => {
    setCategory(catName);
    setSubCategory(subName);
    setIsOpen(false);
    scrollToProducts();
  };

  const subcategories = SUBCATEGORIES_MAP[activeCategory] || [];

  return (
    <div className={className}>
      {/* Главная кнопка "Каталог товаров" */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 ${
          isOpen
            ? "bg-rose-800 text-white shadow-rose-200 ring-2 ring-rose-400"
            : "bg-rose-700 hover:bg-rose-800 text-white shadow-md hover:shadow-lg"
        }`}
        aria-expanded={isOpen}
        aria-label="Каталог товаров"
      >
        {isOpen ? (
          <X className="h-4 w-4 shrink-0 transition-transform" />
        ) : (
          <Menu className="h-4 w-4 shrink-0 transition-transform" />
        )}
        <span className="tracking-wide">Каталог товаров</span>
      </button>

      {/* Портал: рендерится напрямую в document.body — 100% поверх всех элементов и ровно по центру */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div
                className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-20 md:pt-24 p-3 sm:p-4 md:p-6 bg-black/50 backdrop-blur-[2px] overflow-y-auto"
                onClick={() => setIsOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-5xl rounded-3xl bg-white p-4 md:p-6 shadow-2xl border border-gray-100 max-h-[82vh] flex flex-col overflow-hidden"
                >
                  {/* Кнопка закрытия в правом верхнем углу */}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="absolute right-4 top-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-20 cursor-pointer"
                    title="Закрыть каталог"
                    aria-label="Закрыть"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="flex flex-col md:flex-row gap-4 lg:gap-6 flex-1 min-h-0 overflow-hidden">
                    {/* 1. Левая колонка: Категории */}
                    <div
                      ref={categoriesListRef}
                      className="w-full md:w-60 lg:w-64 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 pr-0 md:pr-3 overflow-y-auto max-h-48 md:max-h-full scrollbar-thin"
                    >
                      <div className="flex items-center justify-between mb-2 px-2 pt-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Все категории
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            resetFilters();
                            setIsOpen(false);
                          }}
                          className="text-[11px] font-medium text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          Сброс
                        </button>
                      </div>

                      <div className="space-y-1">
                        {VISUAL_CATEGORIES.map((cat) => {
                          const isActive = activeCategory === cat.name;
                          const Icon = cat.icon;

                          return (
                            <button
                              key={cat.name}
                              type="button"
                              onMouseEnter={() => setActiveCategory(cat.name)}
                              onClick={() => {
                                setActiveCategory(cat.name);
                                if (window.innerWidth < 768) {
                                  handleSelectCategory(cat.name);
                                }
                              }}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all text-left cursor-pointer ${
                                isActive
                                  ? "bg-rose-700 text-white font-semibold shadow-sm"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Icon
                                  className={`h-4 w-4 shrink-0 ${
                                    isActive ? "text-white" : "text-gray-500"
                                  }`}
                                />
                                <span className="truncate text-xs sm:text-sm">{cat.name}</span>
                              </div>
                              <ChevronRight
                                className={`h-4 w-4 shrink-0 transition-transform ${
                                  isActive
                                    ? "text-white opacity-100 translate-x-0.5"
                                    : "text-gray-300 opacity-40"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Центральная область: Подкатегории */}
                    <div className="flex-1 overflow-y-auto px-1 md:px-3 flex flex-col min-h-0">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 shrink-0 pr-8">
                        <div>
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                            {activeCategory}
                            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              {subcategories.length} разделов
                            </span>
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Товары и предложения локальных продавцов ПМР
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectCategory(activeCategory)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline shrink-0 cursor-pointer"
                        >
                          Смотреть всё в «{activeCategory}» →
                        </button>
                      </div>

                      {/* Сетка подкатегорий — просторные колонки с полным отображением названий */}
                      {subcategories.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 overflow-y-auto pr-1">
                          {subcategories.map((sub) => (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => handleSelectSubCategory(activeCategory, sub)}
                              className="text-left text-xs sm:text-sm text-gray-700 hover:text-rose-700 hover:bg-rose-50/80 rounded-xl px-3 py-2 transition-colors font-medium group flex items-center gap-2.5 cursor-pointer"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-300 group-hover:bg-rose-500 transition-colors shrink-0" />
                              <span className="leading-snug">
                                {sub}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-sm text-gray-400">
                          Для данной категории выводятся все доступные товары
                        </div>
                      )}
                    </div>

                    {/* 3. Правая колонка: Промо-карточка */}
                    <div className="hidden lg:flex w-64 shrink-0 flex-col justify-between rounded-2xl bg-gradient-to-br from-rose-50 via-white to-gray-50 p-4 border border-rose-100 shadow-xs">
                      <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 mb-2.5">
                          <Sparkles className="h-3 w-3" />
                          <span>Шоурумы ПМР</span>
                        </div>

                        <h4 className="text-sm font-bold text-gray-900 leading-snug">
                          Новинки от местных шоурумов с примеркой
                        </h4>

                        <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                          Одежда, обувь и авторские подарки из бутиков Тирасполя, Бендер и Рыбницы с доставкой по всему Приднестровью.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-rose-100/60 mt-3">
                        <Link
                          href="/shops"
                          onClick={() => setIsOpen(false)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-800 transition-colors"
                        >
                          <Store className="h-3.5 w-3.5" />
                          <span>Все магазины витрины</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
