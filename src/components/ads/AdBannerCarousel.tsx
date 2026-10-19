"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BannerItem, FALLBACK_BANNERS } from "@/lib/banners";

const INTERVAL_MS = 4500;

interface AdBannerCarouselProps {
  banners?: BannerItem[];
}

export function AdBannerCarousel({ banners }: AdBannerCarouselProps) {
  const slides = banners && banners.length > 0 ? banners : FALLBACK_BANNERS;

  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Сбрасываем текущий слайд, если кол-во слайдов изменилось
  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [slides.length, current]);

  const goTo = useCallback((index: number, dir: "left" | "right" = "right") => {
    setDirection(dir);
    setCurrent(index);
    setAnimKey((k) => k + 1);
  }, []);

  const next = useCallback(() => {
    if (slides.length <= 1) return;
    goTo((current + 1) % slides.length, "right");
  }, [current, goTo, slides.length]);

  const prev = useCallback(() => {
    if (slides.length <= 1) return;
    goTo((current - 1 + slides.length) % slides.length, "left");
  }, [current, goTo, slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = setInterval(next, INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, next, slides.length]);

  if (!slides || slides.length === 0) return null;

  const slide = slides[current] || slides[0];

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
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${slide.bg || "from-rose-600 to-rose-800"} shadow-md`}
        >
          {/* Фоновое изображение, если задано */}
          {slide.imageUrl && (
            <div className="absolute inset-0 opacity-20 mix-blend-overlay">
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Анимированный контент */}
          <div
            key={animKey}
            className={direction === "right" ? "slide-in-right" : "slide-in-left"}
          >
            <div className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
              {/* Левая часть: текст */}
              <div className="flex-1 min-w-0 pr-4">
                {slide.label && (
                  <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white mb-2 backdrop-blur-xs">
                    {slide.label}
                  </span>
                )}
                <h3 className="text-base font-extrabold text-white leading-tight sm:text-lg line-clamp-1">
                  {slide.title}
                </h3>
                {slide.sub && (
                  <p className="mt-0.5 text-xs text-white/85 line-clamp-2 sm:text-sm">
                    {slide.sub}
                  </p>
                )}
                <Link
                  href={slide.href || "/"}
                  className="mt-3 inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-gray-900 shadow transition-all hover:bg-gray-100 hover:shadow-md"
                >
                  {slide.cta || "Подробнее"} →
                </Link>
              </div>

              {/* Правая часть: эмодзи или мини-изображение */}
              {slide.emoji && (
                <div className="flex-shrink-0 text-5xl sm:text-6xl select-none">
                  {slide.emoji}
                </div>
              )}
            </div>
          </div>

          {/* Прогресс-бар */}
          {!paused && slides.length > 1 && (
            <div
              key={`bar-${animKey}`}
              className="absolute bottom-0 left-0 h-[3px] rounded-full bg-white/40"
              style={{ animation: `barGrow ${INTERVAL_MS}ms linear forwards` }}
            />
          )}
        </div>

        {/* ── Стрелки (только если > 1 слайда) ── */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-5 sm:left-8 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45"
              aria-label="Предыдущий слайд"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45"
              aria-label="Следующий слайд"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* ── Точки-индикаторы ── */}
            <div className="mt-2.5 flex justify-center gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id || i}
                  onClick={() => goTo(i, i > current ? "right" : "left")}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? "w-5 bg-rose-500" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Слайд ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
