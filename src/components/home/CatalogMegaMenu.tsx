"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, ChevronDown, Sparkles, Store } from "lucide-react";
import { VISUAL_CATEGORIES, SUBCATEGORIES_MAP } from "@/lib/constants/categories";
import { useCatalogFilterStore } from "@/store/useCatalogFilterStore";

interface CatalogMegaMenuProps {
  className?: string;
}

export function CatalogMegaMenu({ className = "" }: CatalogMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("Одежда");
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Закрытие при клике снаружи
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Закрытие по клавише Escape
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

  // Разбиваем подкатегории на 3 колонки для красивой сетки как в макете
  const columnCount = 3;
  const columns: string[][] = [[], [], []];
  subcategories.forEach((sub, idx) => {
    columns[idx % columnCount].push(sub);
  });

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Главная кнопка "Каталог товаров" */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all shadow-sm active:scale-95 ${
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
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Выпадающее Mega-Menu окно */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Затемнение фона для концентрации */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] md:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-3 z-50 w-[95vw] sm:w-[92vw] max-w-6xl rounded-3xl bg-white p-3 md:p-5 shadow-2xl border border-gray-100 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-4 lg:gap-6 min-h-[420px] max-h-[80vh] md:max-h-[620px]">
                
                {/* 1. Левая колонка: Категории с иконками */}
                <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 pr-0 md:pr-3 overflow-y-auto max-h-56 md:max-h-full scrollbar-thin">
                  <div className="flex items-center justify-between mb-2 px-3 pt-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Все категории
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        resetFilters();
                        setIsOpen(false);
                      }}
                      className="text-[11px] font-medium text-rose-600 hover:text-rose-700"
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
                            // На мобилках клик может сразу переходить или раскрывать
                            if (window.innerWidth < 768) {
                              handleSelectCategory(cat.name);
                            }
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                            isActive
                              ? "bg-rose-700 text-white font-semibold shadow-sm"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon
                              className={`h-4 w-4 shrink-0 ${
                                isActive ? "text-white" : "text-gray-500"
                              }`}
                            />
                            <span className="truncate">{cat.name}</span>
                          </div>
                          <ChevronRight
                            className={`h-4 w-4 shrink-0 transition-transform ${
                              isActive ? "text-white opacity-100 translate-x-0.5" : "text-gray-300 opacity-0 md:opacity-50"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Центральная область: Подкатегории выбранной категории */}
                <div className="flex-1 overflow-y-auto px-1 md:px-3">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
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
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline shrink-0"
                    >
                      Смотреть всё в «{activeCategory}» →
                    </button>
                  </div>

                  {/* 3 колонки подкатегорий */}
                  {subcategories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                      {subcategories.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => handleSelectSubCategory(activeCategory, sub)}
                          className="text-left text-sm text-gray-600 hover:text-rose-600 hover:bg-rose-50/60 rounded-lg px-2.5 py-1.5 transition-colors font-medium group flex items-center justify-between"
                        >
                          <span className="group-hover:translate-x-0.5 transition-transform">
                            {sub}
                          </span>
                          <span className="text-[10px] text-gray-300 group-hover:text-rose-400">
                            →
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

                {/* 3. Правая колонка: Промо-карточка Шоурумов и локальных мастеров */}
                <div className="hidden lg:flex w-72 shrink-0 flex-col justify-between rounded-2xl bg-gradient-to-br from-rose-50 via-white to-gray-50 p-4 border border-rose-100/80 shadow-xs">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/80 px-2.5 py-1 text-[11px] font-bold text-rose-700 mb-3">
                      <Sparkles className="h-3 w-3" />
                      <span>Шоурумы ПМР</span>
                    </div>

                    <h4 className="text-base font-bold text-gray-900 leading-snug">
                      Новинки от местных шоурумов с примеркой
                    </h4>

                    <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                      Одежда, обувь и авторские подарки из бутиков Тирасполя, Бендер и Рыбницы. Быстрая доставка по всему Приднестровью.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-rose-100/60 mt-4">
                    <Link
                      href="/shops"
                      onClick={() => setIsOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-800 transition-colors"
                    >
                      <Store className="h-3.5 w-3.5" />
                      <span>Все магазины витрины</span>
                    </Link>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
