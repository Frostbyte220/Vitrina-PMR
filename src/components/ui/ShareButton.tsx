"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { ShareModal, ShareData } from "./ShareModal";

export interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  imageUrl?: string | null;
  subtitle?: string | null;
  modalTitle?: string;
  variant?: "icon" | "pill" | "outline" | "solid";
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  iconOnlyOnMobile?: boolean;
}

export function ShareButton({
  title,
  text,
  url,
  imageUrl,
  subtitle,
  modalTitle,
  variant = "pill",
  size = "md",
  className = "",
  label = "Поделиться",
  iconOnlyOnMobile = false,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const shareData: ShareData = {
    title,
    text,
    url,
    imageUrl,
    subtitle,
  };

  // Размеры иконки
  const iconSizeClass =
    size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";

  // Стили для разных вариантов
  let variantClasses = "";
  if (variant === "icon") {
    const pad = size === "sm" ? "p-1.5" : size === "lg" ? "p-2.5" : "p-2";
    variantClasses = `rounded-full ${pad} transition-all duration-200 active:scale-95`;
  } else if (variant === "pill") {
    const pad =
      size === "sm"
        ? "px-3 py-1.5 text-xs"
        : size === "lg"
        ? "px-5 py-2.5 text-sm"
        : "px-4 py-2 text-xs sm:text-sm";
    variantClasses = `inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 shadow-sm active:scale-95 ${pad}`;
  } else if (variant === "outline") {
    const pad =
      size === "sm"
        ? "px-3 py-1.5 text-xs"
        : size === "lg"
        ? "px-5 py-2.5 text-sm"
        : "px-4 py-2 text-xs sm:text-sm";
    variantClasses = `inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm active:scale-95 ${pad}`;
  } else if (variant === "solid") {
    const pad =
      size === "sm"
        ? "px-3 py-1.5 text-xs"
        : size === "lg"
        ? "px-5 py-2.5 text-sm"
        : "px-4 py-2 text-xs sm:text-sm";
    variantClasses = `inline-flex items-center gap-1.5 rounded-xl bg-gray-900 font-medium text-white hover:bg-gray-800 transition-all duration-200 shadow-sm active:scale-95 ${pad}`;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`${variantClasses} ${className}`}
        aria-label={label}
        title={label}
      >
        <Share2 className={`${iconSizeClass} shrink-0`} />
        {variant !== "icon" && (
          <span className={iconOnlyOnMobile ? "hidden sm:inline" : ""}>
            {label}
          </span>
        )}
      </button>

      {isOpen && (
        <ShareModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          shareData={shareData}
          modalTitle={modalTitle}
        />
      )}
    </>
  );
}
