import { ChevronLeft, Share2, Heart, ShoppingBag } from "lucide-react";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* 1. Мобильная шапка (sticky top-0) */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-white/95 px-4 backdrop-blur-md pt-safe md:hidden border-b border-gray-100/80">
        <div className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400">
          <ChevronLeft className="h-6 w-6" />
        </div>
        <div className="flex items-center gap-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300">
            <Share2 className="h-5 w-5" />
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300">
            <Heart className="h-5 w-5" />
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
      </header>

      {/* 2. Десктопная шапка (sticky top-0) */}
      <header className="sticky top-0 z-50 hidden border-b border-border/60 bg-white/95 backdrop-blur-md pt-safe md:block">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm font-medium text-text-muted">
              <ChevronLeft className="h-5 w-5" />
              <span>Назад</span>
            </div>
            <div className="h-5 w-48 rounded-md bg-gray-200 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-gray-100 animate-pulse" />
            <div className="h-9 w-9 rounded-full bg-gray-100 animate-pulse" />
            <div className="h-9 w-9 rounded-full bg-gray-100 animate-pulse" />
          </div>
        </div>
      </header>

      {/* 3. Основной контент страницы товара */}
      <main className="mx-auto max-w-5xl px-4 pb-32 pt-4 md:px-6 md:pb-16">
        <div className="mx-auto max-w-3xl">
          {/* Хлебные крошки */}
          <div className="mb-4 flex items-center gap-2">
            <div className="h-3.5 w-16 rounded bg-gray-200 animate-pulse" />
            <span className="text-gray-300 text-xs">/</span>
            <div className="h-3.5 w-24 rounded bg-gray-200 animate-pulse" />
            <span className="text-gray-300 text-xs">/</span>
            <div className="h-3.5 w-32 rounded bg-gray-200 animate-pulse" />
          </div>

          {/* Галерея: вертикальный портрет 4/5 */}
          <div className="relative aspect-[4/5] max-h-[640px] w-full overflow-hidden rounded-2xl bg-gray-200/80 border border-gray-100 animate-pulse flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-gray-300/60 flex items-center justify-center text-gray-400">
              <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
            </div>
          </div>

          {/* Информация о товаре */}
          <div className="mt-6 flex flex-col gap-4">
            <div>
              {/* Заголовок товара */}
              <div className="h-8 w-4/5 rounded-xl bg-gray-200 animate-pulse" />
              <div className="mt-2 h-8 w-1/2 rounded-xl bg-gray-200 animate-pulse md:hidden" />

              {/* Цена и статус */}
              <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-baseline gap-3">
                  <div className="h-9 w-32 rounded-xl bg-gray-200 animate-pulse" />
                  <div className="h-5 w-20 rounded-md bg-gray-100 animate-pulse" />
                </div>
                <div className="h-7 w-28 rounded-full bg-gray-100 animate-pulse" />
              </div>
            </div>

            {/* Категории и теги */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <div className="h-6 w-24 rounded-lg bg-gray-100 animate-pulse" />
              <div className="h-6 w-20 rounded-lg bg-gray-100 animate-pulse" />
              <div className="h-6 w-28 rounded-lg bg-gray-100 animate-pulse" />
            </div>

            {/* Текст описания */}
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
              <div className="h-4 w-11/12 rounded bg-gray-100 animate-pulse" />
              <div className="h-4 w-4/5 rounded bg-gray-100 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
            </div>

            {/* Карточка магазина/продавца */}
            <div className="mt-2 flex items-center gap-4 rounded-2xl bg-surface p-4 border border-gray-100 shadow-xs">
              <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-16 rounded bg-gray-100 animate-pulse" />
                <div className="h-4.5 w-36 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="h-4 w-20 rounded bg-gray-100 animate-pulse shrink-0" />
            </div>

            {/* Кнопка покупки на десктопе */}
            <div className="hidden md:block mt-2">
              <div className="h-14 w-full rounded-2xl bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Скелетон карусели связанных товаров */}
        <div className="mt-12 sm:mt-16 space-y-6">
          <div className="h-6 w-48 rounded-lg bg-gray-200 animate-pulse" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-[210px] min-w-[210px] sm:w-[250px] sm:min-w-[250px] h-72 rounded-2xl bg-white border border-gray-100 p-3 flex flex-col gap-3 shrink-0"
              >
                <div className="aspect-[4/5] w-full rounded-xl bg-gray-100 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 4. Мобильная плавающая нижняя панель покупки */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 pb-safe flex items-center gap-3">
        <div className="h-12 flex-1 rounded-xl bg-gray-200 animate-pulse" />
        <div className="h-12 w-12 rounded-xl bg-gray-100 animate-pulse shrink-0" />
      </div>
    </div>
  );
}
