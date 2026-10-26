"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ShoppingBag,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
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

  // Состояние масштабирования и панорамирования в Lightbox
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const initialPinchDist = useRef<number | null>(null);
  const initialScaleOnPinch = useRef(1);
  const lastTapTime = useRef<number>(0);

  const currentImage = images[activeIndex];
  const isCurrentFailed = !currentImage || failedImages[activeIndex];
  const zoomImage = images[zoomIndex];

  // Сброс масштаба к 100%
  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const openZoom = (index?: number) => {
    const idx = typeof index === "number" ? index : activeIndex;
    setZoomIndex(idx);
    resetZoom();
    setIsZoomOpen(true);
  };

  const closeZoom = useCallback(() => {
    setIsZoomOpen(false);
    resetZoom();
  }, [resetZoom]);

  const handlePrev = useCallback(() => {
    resetZoom();
    setZoomIndex((prev) => {
      const next = prev > 0 ? prev - 1 : images.length - 1;
      setActiveIndex(next);
      return next;
    });
  }, [images.length, resetZoom]);

  const handleNext = useCallback(() => {
    resetZoom();
    setZoomIndex((prev) => {
      const next = prev < images.length - 1 ? prev + 1 : 0;
      setActiveIndex(next);
      return next;
    });
  }, [images.length, resetZoom]);

  // Увеличение / уменьшение кнопками
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const zoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Управление с клавиатуры (Escape, стрелки, зум +, -, 0) и блокировка скролла
  useEffect(() => {
    if (!isZoomOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeZoom();
      } else if (e.key === "ArrowLeft") {
        if (scale === 1) handlePrev();
      } else if (e.key === "ArrowRight") {
        if (scale === 1) handleNext();
      } else if (e.key === "+" || e.key === "=") {
        zoomIn();
      } else if (e.key === "-") {
        zoomOut();
      } else if (e.key === "0") {
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomOpen, closeZoom, handlePrev, handleNext, scale, resetZoom]);

  // Обработка жестов на тач-экранах (Pinch-to-zoom двумя пальцами + свайп/перемещение)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Пинч-зум двумя пальцами
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDist.current = dist;
      initialScaleOnPinch.current = scale;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      // Двойной тап (Double Tap) для мгновенного зума 2.5x / сброса
      if (now - lastTapTime.current < 300) {
        if (scale > 1) {
          resetZoom();
        } else {
          setScale(2.5);
          setPosition({ x: 0, y: 0 });
        }
        lastTapTime.current = 0;
        return;
      }
      lastTapTime.current = now;

      if (scale > 1) {
        setIsDragging(true);
        dragStart.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        };
      } else {
        touchStartX.current = e.touches[0].clientX;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDist.current !== null) {
      // Плавный pinch-zoom
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / initialPinchDist.current;
      const newScale = Math.min(Math.max(1, initialScaleOnPinch.current * factor), 4);
      setScale(newScale);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1) {
      if (scale > 1 && isDragging) {
        // Перемещение увеличенного фото (панорамирование пальцем)
        const maxOffset = (scale - 1) * 220;
        const newX = e.touches[0].clientX - dragStart.current.x;
        const newY = e.touches[0].clientY - dragStart.current.y;
        setPosition({
          x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
          y: Math.max(-maxOffset, Math.min(maxOffset, newY)),
        });
      } else if (scale === 1) {
        touchEndX.current = e.touches[0].clientX;
      }
    }
  };

  const handleTouchEnd = () => {
    initialPinchDist.current = null;
    setIsDragging(false);

    // Свайп между фото только если фото не увеличено (scale === 1)
    if (scale === 1 && touchStartX.current !== null && touchEndX.current !== null) {
      const distance = touchStartX.current - touchEndX.current;
      if (distance > 45) {
        handleNext();
      } else if (distance < -45) {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Колесико мыши для плавного зума на ПК
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.3 : -0.3;
    setScale((prev) => {
      const next = Math.min(Math.max(1, prev + delta), 4);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Перетаскивание мышью на ПК при зуме
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1 && e.button === 0) {
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (scale > 1 && isDragging) {
      const maxOffset = (scale - 1) * 300;
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      setPosition({
        x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
        y: Math.max(-maxOffset, Math.min(maxOffset, newY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Главный блок фото: пропорция 4/5 (вертикальный портрет) + object-contain для 100% деталей */}
        <div
          onClick={() => !isCurrentFailed && openZoom(activeIndex)}
          className="group relative aspect-[4/5] max-h-[640px] w-full overflow-hidden rounded-2xl bg-surface border border-gray-100/80 flex items-center justify-center cursor-zoom-in"
        >
          {/* Мягкий рассеянный фоновый слой под цвет фото */}
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

          {/* Основное фото: object-contain предотвращает обрезку краев */}
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

      {/* Полноэкранный Lightbox с Pinch-to-Zoom, панорамированием и навигацией */}
      {isZoomOpen && zoomImage && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 p-3 sm:p-4 backdrop-blur-md select-none touch-none"
          onClick={closeZoom}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Верхняя панель: счётчик фото, панель инструментов масштаба и кнопка закрытия */}
          <div
            className="flex w-full max-w-5xl items-center justify-between pt-2 px-2 z-30"
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

            {/* Панель управления зумом */}
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-full px-2 py-1">
              <button
                type="button"
                onClick={zoomOut}
                disabled={scale <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                aria-label="Уменьшить (-)"
                title="Уменьшить (-)"
              >
                <ZoomOut className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={resetZoom}
                className="px-2 py-0.5 text-[11px] font-bold text-white/90 hover:text-white rounded-md transition-colors"
                title="Сбросить масштаб (0)"
              >
                {Math.round(scale * 100)}%
              </button>

              <button
                type="button"
                onClick={zoomIn}
                disabled={scale >= 4}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                aria-label="Увеличить (+)"
                title="Увеличить (+)"
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              {scale > 1 && (
                <button
                  type="button"
                  onClick={resetZoom}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  aria-label="Сброс"
                  title="Сбросить масштаб"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Закрыть Lightbox */}
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

          {/* Центральная зона с фото, зумом, панорамированием и навигацией */}
          <div
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-2 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Стрелка влево (показывается только при масштабе 1x) */}
            {images.length > 1 && scale === 1 && (
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

            {/* Картинка во весь экран с зумом и перемещением */}
            <div
              className={cn(
                "relative h-full w-full max-h-[82vh] flex items-center justify-center overflow-hidden",
                scale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
              )}
              onDoubleClick={() => {
                if (scale > 1) {
                  resetZoom();
                } else {
                  setScale(2.5);
                  setPosition({ x: 0, y: 0 });
                }
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                style={{
                  transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                  transition: isDragging ? "none" : "transform 0.15s cubic-bezier(0.2, 0.9, 0.4, 1)",
                }}
                className="relative h-full w-full flex items-center justify-center will-change-transform"
              >
                <Image
                  key={zoomImage}
                  src={zoomImage}
                  alt={title}
                  fill
                  loader={cloudinaryLoader}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-contain pointer-events-none select-none"
                  priority
                />
              </div>
            </div>

            {/* Стрелка вправо (показывается только при масштабе 1x) */}
            {images.length > 1 && scale === 1 && (
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
              className="flex items-center gap-2 overflow-x-auto max-w-md pb-2 px-2 z-20 scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <button
                  key={`zoom-thumb-${img}`}
                  type="button"
                  onClick={() => {
                    resetZoom();
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
