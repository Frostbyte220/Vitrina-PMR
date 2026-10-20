"use client";

import Image from "next/image";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { cn, cloudinaryLoader, BLUR_DATA_URL } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const currentImage = images[activeIndex];
  const isCurrentFailed = !currentImage || failedImages[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface md:aspect-[4/3]">
        {!isCurrentFailed ? (
          <Image
            src={currentImage}
            alt={title}
            fill
            priority
            loader={cloudinaryLoader}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            onError={() => setFailedImages((prev) => ({ ...prev, [activeIndex]: true }))}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 text-gray-400 gap-3">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
              <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
            </div>
            <span className="text-sm font-medium">{title}</span>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const isThumbFailed = failedImages[index];
            return (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors bg-gray-50",
                  activeIndex === index
                    ? "border-primary"
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
  );
}
