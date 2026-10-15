"use client";

import { ChevronLeft, Share2, Heart, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { ReportProductModal } from "@/components/product/ReportProductModal";

interface ProductPageHeaderProps {
  title?: string;
  price?: number;
  productId?: string;
}

export function ProductPageHeader({ title = "Товар", price, productId }: ProductPageHeaderProps) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const formattedPrice = price ? ` (${formatPrice(price)})` : "";
    const shareText = `Товар «${title}»${formattedPrice} на E-Vitrina PMR`;

    if (navigator.share && typeof navigator.canShare === "function") {
      const shareData = {
        title: `${title} — E-Vitrina PMR`,
        text: shareText,
        url,
      };

      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err: any) {
          if (err.name === "AbortError") return; // пользователь закрыл диалог
        }
      }
    }

    // Резервный вариант: копирование ссылки в буфер обмена
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      toast.success("Ссылка скопирована! Отправьте её друзьям");
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error("Не удалось скопировать ссылку");
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-white/95 px-4 backdrop-blur-md pt-safe md:hidden border-b border-gray-100/80">
      <button
        type="button"
        onClick={() => router.back()}
        className="rounded-full p-2 text-text-main transition-colors hover:bg-surface active:scale-95"
        aria-label="Назад"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <div className="flex items-center gap-1">
        {productId && (
          <ReportProductModal
            productId={productId}
            productTitle={title}
            variant="icon"
          />
        )}
        <button
          type="button"
          onClick={handleShare}
          className="rounded-full p-2 text-text-main transition-colors hover:bg-surface active:scale-95"
          aria-label="Поделиться"
          title="Поделиться товаром"
        >
          {isCopied ? (
            <Check className="h-5 w-5 text-emerald-600 animate-in zoom-in" />
          ) : (
            <Share2 className="h-5 w-5 text-gray-700" />
          )}
        </button>
        <Link
          href="/favorites"
          className="rounded-full p-2 text-text-main transition-colors hover:bg-surface active:scale-95"
          aria-label="Избранное"
          title="В избранное"
        >
          <Heart className="h-5 w-5 text-gray-700" />
        </Link>
      </div>
    </header>
  );
}

export function ProductPageHeaderDesktop({
  title = "Товар",
  price,
  productId,
}: {
  title?: string;
  price?: number;
  productId?: string;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const formattedPrice = price ? ` (${formatPrice(price)})` : "";
    const shareText = `Товар «${title}»${formattedPrice} на E-Vitrina PMR`;

    if (navigator.share && typeof navigator.canShare === "function") {
      const shareData = {
        title: `${title} — E-Vitrina PMR`,
        text: shareText,
        url,
      };

      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err: any) {
          if (err.name === "AbortError") return;
        }
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      toast.success("Ссылка на товар скопирована!");
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error("Не удалось скопировать ссылку");
    }
  };

  return (
    <header className="sticky top-0 z-50 hidden border-b border-border/60 bg-white/95 backdrop-blur-md pt-safe md:block">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm font-medium text-text-muted transition-colors hover:text-text-main shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
            Назад
          </Link>
          <span className="truncate text-sm font-medium text-text-main">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 ml-4">
          {productId && (
            <ReportProductModal
              productId={productId}
              productTitle={title}
              variant="header"
            />
          )}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-2xs active:scale-95"
            title="Поделиться товаром"
          >
            {isCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Скопировано!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-gray-500" />
                <span>Поделиться</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
