import React from "react";
import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  /** Размер иконки: sm (14px), md (16px), lg (20px) */
  size?: "sm" | "md" | "lg";
  /** Показывать ли текстовую подпись «Проверен» */
  showText?: boolean;
  /** Дополнительные CSS классы */
  className?: string;
  /** Текст всплывающей подсказки (по умолчанию «Проверенный магазин») */
  title?: string;
}

export function VerifiedBadge({
  size = "sm",
  showText = false,
  className = "",
  title = "Проверенный магазин (физический магазин или проверенный продавец)",
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 select-none shrink-0 ${className}`}
      title={title}
    >
      <BadgeCheck
        className={`${sizeClasses[size]} fill-sky-500 text-white shrink-0 drop-shadow-xs transition-transform hover:scale-110`}
        aria-label={title}
      />
      {showText && (
        <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200/70 rounded-full px-2 py-0.5 leading-none">
          Проверен
        </span>
      )}
    </span>
  );
}
