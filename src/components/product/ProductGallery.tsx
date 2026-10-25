"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ShoppingBag,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn, cloudinaryLoader, BLUR_DATA_URL } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const currentImage = images[activeIndex];
  const isCurrentFailed = !currentImage || failedImages[activeIndex];

  const zoomImage = images[zoomIndex];

  const openZoom = (index?: number) => {
    const idx = typeof index === "number" ? index : activeIndex;
    setZoomIndex(idx);
    setIsZoomOpen(true);
  };

  const closeZoom = useCallback(() => {
    setIsZoomOpen(false);
  }, []);

  const handlePrev = useCallback(() => {
    setZoomIndex((prev) => {
      const next = prev > 0 ? prev - 1 : images.length - 1;
      setActiveIndex(next);
      return next;
    });
  }, [images.length]);

  const handleNext = useCallback(() => {
    setZoomIndex((prev) => {
      const next = prev < images.length - 1 ? prev + 1 : 0;
      setActiveIndex(next);
      return next;
    });
  }, [images.length]);

  // Управление с клавиатуры (Escape, ArrowLeft, ArrowRight) и блокировка скролла
  useEffect(() => {
    if (!isZoomOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeZoom();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomOpen, closeZoom, handlePrev, handleNext]);

  // Поддержка свайпов на смартфонах
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45) {
      handleNext();
    } else if (distance < -45) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Главный блок фото: пропорция 4/5 (вертикальный портрет) + object-contain для 100% сохранения всех деталей */}
        <div
          onClick={() => !isCurrentFailed && openZoom(activeIndex)}
          className="group relative aspect-[4/5] max-h-[640px] w-full overflow-hidden rounded-2xl bg-surface border border-gray-100/80 flex items-center justify-center cursor-zoom-in"
        >
          {/* Мягкий рассеянный фоновый слой под цвет фото, чтобы при любом соотношении сторон не было пустых полос */}
          {!isCurrentFailed && currentImage && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
              <Image
                src={currentImage}
                alt=""
                fill
                loader={cloudinaryLoader}
                className="object-cover blur-2xl scale-125 opacity-25"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Основное фото: object-contain предотвращает обрезку голов, обуви, краев одежды */}
          {!isCurrentFailed ? (
            <>
              <Image
                src={currentImage}
                alt={title}
                fill
                priority
                loader={cloudinaryLoader}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                sizes="(max-width: 768px) 100vw, 768px"
                className="relative z-10 object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-[1.02]"
                onError={() => setFailedImages((prev) => ({ ...prev, [activeIndex]: true }))}
              />

              {/* Кнопка открытия на весь экран */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openZoom(activeIndex);
                }}
                className="absolute right-3 bottom-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110 active:scale-95 cursor-pointer"
                aria-label="Увеличить фото"
                title="Открыть во весь экран"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 text-gray-400 gap-3">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
              </div>
              <span className="text-sm font-medium">{title}</span>
            </div>
          )}
        </div>

        {/* Миниатюры */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {images.map((image, index) => {
              const isThumbFailed = failedImages[index];
              return (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all bg-gray-50 cursor-pointer",
                    activeIndex === index
                      ? "border-rose-700 ring-2 ring-rose-700/20 shadow-xs"
                      : "border-transparent opacity-70 hover:opacity-100"
                  )}
                  aria-label={`Фото ${index + 1}`}
                >
                  {!isThumbFailed ? (
                    <Image
                      src={image}
                      alt=""
                      fill
                      loader={cloudinaryLoader}
                      sizes="64px"
                      className="object-cover"
                      onError={() => setFailedImages((prev) => ({ ...prev, [index]: true }))}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Улучшенный Lightbox / Полноэкранный просмотр с галереей, стрелками и свайпом */}
      {isZoomOpen && zoomImage && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 p-4 backdrop-blur-md select-none"
          onClick={closeZoom}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Верхняя панель: счётчик фото и кнопка закрытия */}
          <div
            className="flex w-full max-w-5xl items-center justify-between pt-2 px-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white/90">
                {zoomIndex + 1} / {images.length}
              </span>
              <span className="hidden sm:inline-block max-w-xs md:max-w-md truncate text-xs text-white/70">
                {title}
              </span>
            </div>

            <button
              type="button"
              onClick={closeZoom}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
              aria-label="Закрыть (Esc)"
              title="Закрыть (Esc)"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Центральная зона с фото и навигационными стрелками */}
          <div
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Стрелка влево */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-md hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
                aria-label="Предыдущее фото (←)"
                title="Предыдущее (←)"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Картинка во весь экран */}
            <div className="relative h-full w-full max-h-[82vh] flex items-center justify-center">
              <Image
                key={zoomImage}
                src={zoomImage}
                alt={title}
                fill
                loader={cloudinaryLoader}
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-contain"
                priority
              />
            </div>

            {/* Стрелка вправо */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 sm:right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-md hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
                aria-label="Следующее фото (→)"
                title="Следующее (→)"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Нижняя панель: миниатюры для быстрого переключения в зуме */}
          {images.length > 1 && (
            <div
              className="flex items-center gap-2 overflow-x-auto max-w-md pb-2 px-2 z-10 scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <button
                  key={`zoom-thumb-${img}`}
                  type="button"
                  onClick={() => {
                    setZoomIndex(idx);
                    setActiveIndex(idx);
                  }}
                  className={cn(
                    "relative h-12 w-10 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer",
                    zoomIndex === idx
                      ? "border-rose-500 scale-105 shadow-md"
                      : "border-transparent opacity-50 hover:opacity-80"
                  )}
                  aria-label={`Перейти к фото ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    loader={cloudinaryLoader}
                    sizes="40px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
