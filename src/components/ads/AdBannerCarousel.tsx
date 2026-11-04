"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ExternalLink, Store, Megaphone } from "lucide-react";
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
          from { opacity: 0; transform: translateX(50px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0)   scale(1);    }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes barGrow {
          from { width: 0% }
          to   { width: 100% }
        }
        @keyframes adShimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes floatEmoji {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-6px) rotate(2deg); }
        }
        .slide-in-right { animation: slideInRight 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .slide-in-left  { animation: slideInLeft  0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .ad-banner-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%);
          animation: adShimmer 4s ease-in-out infinite;
        }
        .ad-emoji-float {
          animation: floatEmoji 3s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>

      <div
        className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-3"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* ── Слайд ── */}
        <div
          className={`ad-banner-shimmer relative overflow-hidden rounded-2xl bg-gradient-to-br ${slide.bg || "from-rose-600 to-rose-800"} shadow-lg ring-1 ring-black/5`}
        >
          {/* Декоративные фоновые круги */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
            <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-white/[0.06]" />
            <div className="absolute right-16 -bottom-16 w-48 h-48 rounded-full bg-white/[0.05]" />
            <div className="absolute left-[40%] -top-8 w-32 h-32 rounded-full bg-white/[0.04]" />
            <div className="absolute -left-6 top-0 w-24 h-24 rounded-full bg-black/[0.08]" />
          </div>

          {/* Фоновое изображение, если задано */}
          {slide.imageUrl && (
            <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
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
            <div className="relative z-10 flex items-center justify-between px-8 py-6 sm:px-12 sm:py-9 gap-6">

              {/* Левая часть: весь текст */}
              <div className="flex-1 min-w-0 flex flex-col gap-2">

                {/* Строка 1: только авто-метка «Реклама» слева; пользовательскую метку
                    показываем лишь если она не дублирует слово «Реклама» */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Постоянный авто-бейдж «Реклама» */}
                  <span className="inline-flex items-center gap-1 rounded-md bg-black/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/60 backdrop-blur-sm border border-white/10 select-none">
                    <Megaphone className="w-2.5 h-2.5 opacity-70" />
                    Реклама
                  </span>

                  {/* Метка слайда — только если отличается от «Реклама» */}
                  {slide.label && slide.label.toLowerCase() !== "реклама" && (
                    <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs border border-white/20 shadow-sm">
                      {slide.label}
                    </span>
                  )}
                </div>

                {/* Строка 2: заголовок — крупнее */}
                <h3 className="text-xl font-extrabold text-white leading-snug sm:text-3xl line-clamp-1 drop-shadow-sm tracking-tight">
                  {slide.title}
                </h3>

                {/* Строка 3: подзаголовок */}
                {slide.sub && (
                  <p className="text-sm text-white/85 line-clamp-2 sm:text-base max-w-lg leading-relaxed">
                    {slide.sub}
                  </p>
                )}

                {/* Строка 4: CTA + атрибуция */}
                <div className="flex items-center gap-3 flex-wrap mt-1">
                  <Link
                    href={slide.href || "/"}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg active:scale-95 select-none"
                  >
                    {slide.cta || "Подробнее"}
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                  </Link>

                  {/* Атрибуция «Магазин на E‑Vitrina» */}
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/50 font-semibold tracking-wide">
                    <Store className="w-3.5 h-3.5 opacity-60" />
                    Магазин на E‑Vitrina PMR
                  </span>
                </div>
              </div>

              {/* Правая часть: эмодзи — крупнее */}
              {slide.emoji && (
                <div className="flex-shrink-0 flex items-center justify-center select-none w-20 sm:w-28">
                  <span className="ad-emoji-float text-6xl sm:text-8xl drop-shadow-lg">
                    {slide.emoji}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Прогресс-бар */}
          {!paused && slides.length > 1 && (
            <div
              key={`bar-${animKey}`}
              className="absolute bottom-0 left-0 h-[3px] bg-white/35 rounded-full"
              style={{ animation: `barGrow ${INTERVAL_MS}ms linear forwards` }}
            />
          )}
        </div>

        {/* ── Стрелки (только если > 1 слайда) ── */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-5 sm:left-9 top-[42%] -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 shadow-md"
              aria-label="Предыдущий слайд"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-5 sm:right-9 top-[42%] -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 shadow-md"
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
