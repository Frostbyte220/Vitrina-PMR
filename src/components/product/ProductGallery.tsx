"use client";

import Image from "next/image";
import { useState } from "react";
import { ShoppingBag, Maximize2, X } from "lucide-react";
import { cn, cloudinaryLoader, BLUR_DATA_URL } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const currentImage = images[activeIndex];
  const isCurrentFailed = !currentImage || failedImages[activeIndex];

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Главный блок фото: пропорция 4/5 (вертикальный портрет) + object-contain для 100% сохранения всех деталей */}
        <div
          onClick={() => !isCurrentFailed && setIsZoomOpen(true)}
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
                  setIsZoomOpen(true);
                }}
                className="absolute right-3 bottom-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110 active:scale-95"
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
                    "relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all bg-gray-50",
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

      {/* Lightbox / Полноэкранный просмотр без ограничений по размеру */}
      {isZoomOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Закрыть"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative h-full max-h-[90vh] w-full max-w-4xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage}
              alt={title}
              fill
              loader={cloudinaryLoader}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
