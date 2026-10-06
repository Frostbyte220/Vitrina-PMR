"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ────────────────────────────────────────────────────────────
// Здесь задаёшь реальные слайды. Каждый слайд — один рекламодатель.
// bg     — цвет фона (Tailwind-класс)
// label  — маленькая плашка вверху (необязательно)
// title  — крупный заголовок
// sub    — подзаголовок
// cta    — текст кнопки
// href   — куда ведёт кнопка
// emoji  — декоративный символ справа (можно заменить <Image>)
// ────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 1,
    bg: "from-rose-600 to-rose-800",
    label: "Реклама",
    title: "Разместите магазин бесплатно",
    sub: "Тысячи покупателей ПМР увидят ваши товары уже сегодня",
    cta: "Зарегистрироваться",
    href: "/login",
    emoji: "🏪",
  },
  {
    id: 2,
    bg: "from-violet-600 to-violet-800",
    label: "Партнёр",
    title: "SneakerHub PMR",
    sub: "Новая коллекция кроссовок — Nike, Adidas, New Balance",
    cta: "Смотреть товары",
    href: "/shop/sneakershub",
    emoji: "👟",
  },
  {
    id: 3,
    bg: "from-emerald-600 to-emerald-800",
    label: "Акция",
    title: "BeautiBox — косметика ПМР",
    sub: "Уходовая косметика с доставкой по всему Приднестровью",
    cta: "Перейти в магазин",
    href: "/shop/beautibox",
    emoji: "💄",
  },
  {
    id: 4,
    bg: "from-amber-500 to-orange-600",
    label: "Новинка",
    title: "Modny Shkaf — одежда",
    sub: "Стильная одежда для всей семьи — доставка по ПМР",
    cta: "Открыть каталог",
    href: "/shop/modny_shkaf",
    emoji: "👗",
  },
];

const INTERVAL_MS = 4500;

export function AdBannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Автопрокрутка
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = SLIDES[current];

  return (
    <div
      className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Слайд ── */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${slide.bg} transition-all duration-500`}
      >
        <div className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          {/* Левая часть: текст */}
          <div className="flex-1 min-w-0 pr-4">
            {slide.label && (
              <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white mb-2">
                {slide.label}
              </span>
            )}
            <h3 className="text-base font-extrabold text-white leading-tight sm:text-lg line-clamp-1">
              {slide.title}
            </h3>
            <p className="mt-0.5 text-xs text-white/80 line-clamp-2 sm:text-sm">
              {slide.sub}
            </p>
            <Link
              href={slide.href}
              className="mt-3 inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-gray-900 shadow transition-opacity hover:opacity-90"
            >
              {slide.cta} →
            </Link>
          </div>

          {/* Правая часть: эмодзи / изображение */}
          <div className="flex-shrink-0 text-5xl sm:text-6xl select-none opacity-90">
            {slide.emoji}
          </div>
        </div>

        {/* Прогресс-бар снизу */}
        {!paused && (
          <div
            key={`${current}-bar`}
            className="absolute bottom-0 left-0 h-[3px] bg-white/40 rounded-full"
            style={{
              animation: `grow ${INTERVAL_MS}ms linear forwards`,
            }}
          />
        )}
      </div>

      {/* ── Стрелки ── */}
      <button
        onClick={prev}
        className="absolute left-5 sm:left-8 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/40"
        aria-label="Предыдущий слайд"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/40"
        aria-label="Следующий слайд"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* ── Точки-индикаторы ── */}
      <div className="mt-2.5 flex justify-center gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? "w-5 bg-rose-500" : "w-1.5 bg-gray-300"
            }`}
            aria-label={`Слайд ${i + 1}`}
          />
        ))}
      </div>

      {/* Keyframe для прогресс-бара */}
      <style>{`
        @keyframes grow {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
}
