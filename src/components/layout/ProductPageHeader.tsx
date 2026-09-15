"use client";

import { ChevronLeft, Share2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ProductPageHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-white/95 px-4 backdrop-blur-md md:hidden">
      <button
        type="button"
        onClick={() => router.back()}
        className="rounded-full p-2 text-text-main transition-colors hover:bg-surface"
        aria-label="Назад"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="rounded-full p-2 text-text-main transition-colors hover:bg-surface"
          aria-label="Поделиться"
        >
          <Share2 className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-text-main transition-colors hover:bg-surface"
          aria-label="Корзина"
        >
          <ShoppingBag className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

export function ProductPageHeaderDesktop({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-50 hidden border-b border-border/60 bg-white/95 backdrop-blur-md md:block">
      <div className="mx-auto flex h-16 max-w-3xl items-center gap-4 px-6">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm font-medium text-text-muted transition-colors hover:text-text-main"
        >
          <ChevronLeft className="h-5 w-5" />
          Назад
        </Link>
        <span className="truncate text-sm font-medium text-text-main">
          {title}
        </span>
      </div>
    </header>
  );
}
