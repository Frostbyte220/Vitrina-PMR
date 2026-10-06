"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number, dir: "left" | "right" = "right") => {
    setDirection(dir);
    setCurrent(index);
    setAnimKey((k) => k + 1);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, "right");
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, "left");
  }, [current, goTo]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next]);

  const slide = SLIDES[current];

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px) scale(0.98); }
          to   { opacity: 1; transform: translateX(0)   scale(1);    }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px) scale(0.98); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes barGrow {
          from { width: 0% }
          to   { width: 100% }
        }
        .slide-in-right { animation: slideInRight 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .slide-in-left  { animation: slideInLeft  0.45s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div
        className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-3"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* ── Слайд ── */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${slide.bg} shadow-md`}>

          {/* Анимированный контент */}
          <div
            key={animKey}
            className={direction === "right" ? "slide-in-right" : "slide-in-left"}
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

              {/* Правая часть: эмодзи */}
              <div className="flex-shrink-0 text-5xl sm:text-6xl select-none">
                {slide.emoji}
              </div>
            </div>
          </div>

          {/* Прогресс-бар */}
          {!paused && (
            <div
              key={`bar-${animKey}`}
              className="absolute bottom-0 left-0 h-[3px] rounded-full bg-white/40"
              style={{ animation: `barGrow ${INTERVAL_MS}ms linear forwards` }}
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
              onClick={() => goTo(i, i > current ? "right" : "left")}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-5 bg-rose-500" : "w-1.5 bg-gray-300"
              }`}
              aria-label={`Слайд ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
