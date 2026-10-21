"use client";

import { useEffect, useState } from "react";
import { Store, Sparkles } from "lucide-react";

export function HomePreloader() {
  const [progress, setProgress] = useState(10);
  const [fading, setFading] = useState(false);
  const [destroyed, setDestroyed] = useState(false);

  useEffect(() => {

    // Плавная динамическая анимация заполнения полосы загрузки
    const p1 = setTimeout(() => setProgress(45), 200);
    const p2 = setTimeout(() => setProgress(80), 550);
    const p3 = setTimeout(() => setProgress(100), 900);

    // Начало плавного затухания прелоадера
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1150);

    // Полное удаление компонента из DOM (освобождение памяти)
    const destroyTimer = setTimeout(() => {
      setDestroyed(true);
    }, 1650);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      clearTimeout(fadeTimer);
      clearTimeout(destroyTimer);
    };
  }, []);

  // На сервере прелоадер сразу готов к показу без мигания
  if (destroyed) return null;

  return (
    <div
      aria-label="Загрузка E-Vitrina PMR"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-all duration-500 ease-out ${
        fading
          ? "opacity-0 pointer-events-none scale-[1.02]"
          : "opacity-100 pointer-events-auto scale-100"
      }`}
    >
      {/* Мягкое фоновое сияние фирменного цвета */}
      <div className="absolute h-72 w-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        {/* Фирменный логотип с мягким свечением */}
        <div className="relative mb-6">
          {/* Пульсирующее внешнее кольцо */}
          <div className="absolute -inset-2 rounded-3xl bg-rose-500/20 blur-sm animate-ping opacity-60" />

          {/* Центральный градиентный бейдж в фирменных бордово-розовых тонах */}
          <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#800020] via-rose-700 to-rose-600 text-white shadow-xl shadow-rose-900/25">
            <Store className="h-10 w-10 sm:h-12 sm:w-12 transition-transform duration-700 hover:scale-110" />
            <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-md">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Название бренда */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#800020]">
          E-Vitrina PMR
        </h1>

        {/* Подпись */}
        <p className="mt-1.5 text-xs sm:text-sm font-medium tracking-wide text-gray-500">
          Локальные магазины Приднестровья
        </p>

        {/* Фирменный прогресс-бар */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="h-1.5 w-48 sm:w-56 overflow-hidden rounded-full bg-rose-100 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#800020] via-rose-600 to-rose-500 shadow-sm transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="text-[11px] font-semibold text-rose-700/80 tracking-wider">
            {progress < 100 ? "Загрузка каталога..." : "Готово!"}
          </span>
        </div>
      </div>
    </div>
  );
}
