"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Store as StoreIcon,
  ChevronRight,
  Send,
  Heart,
  Info,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import dynamic from "next/dynamic";
import {
  useCartStore,
  StoreCartGroup,
} from "@/store/useCartStore";
import toast from "react-hot-toast";

const StoreCheckoutModal = dynamic(
  () =>
    import("@/components/cart/StoreCheckoutModal").then(
      (m) => m.StoreCheckoutModal
    ),
  { ssr: false }
);

function pluralizeItems(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 14) return "товаров";
  if (mod10 === 1) return "товар";
  if (mod10 >= 2 && mod10 <= 4) return "товара";
  return "товаров";
}

function pluralizeStores(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 14) return "магазинах";
  if (mod10 === 1) return "магазине";
  return "магазинах";
}

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [checkoutGroup, setCheckoutGroup] = useState<StoreCartGroup | null>(null);

  const {
    items,
    getStoreGroups,
    getTotalCount,
    getTotalPrice,
    updateQuantity,
    removeItem,
    clearStore,
    clearCart,
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl flex items-center justify-center min-h-[50vh]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
      </div>
    );
  }

  const storeGroups = getStoreGroups();
  const totalCount = getTotalCount();
  const totalPrice = getTotalPrice();

  const handleClearAll = () => {
    if (window.confirm("Вы уверены, что хотите очистить корзину?")) {
      clearCart();
      toast.success("Корзина очищена");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/40 pb-20 pt-6 sm:pt-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Верхняя навигация */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Вернуться в каталог</span>
          </Link>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
            >
              Очистить всё
            </button>
          )}
        </div>

        {/* Заголовок страницы */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-gray-200/60 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Корзина
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {totalCount > 0 ? (
              <>
                {totalCount} {pluralizeItems(totalCount)} в {storeGroups.length}{" "}
                {pluralizeStores(storeGroups.length)}
              </>
            ) : (
              "Ваша корзина пуста"
            )}
          </p>
        </div>

        {/* Пустая корзина */}
        {items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200/70 bg-white p-8 sm:p-12 text-center max-w-md mx-auto my-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 mb-4">
              <ShoppingBag className="h-7 w-7 stroke-[1.5]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1.5">
              В корзине пока пусто
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
              Выбирайте понравившиеся товары в каталоге и добавляйте их для быстрого заказа напрямую у продавцов.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
              >
                Перейти к покупкам
              </Link>
              <Link
                href="/favorites"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Избранное</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Лаконичная подсказка */}
            <div className="flex items-center gap-2.5 rounded-xl border border-gray-200/60 bg-white px-4 py-3 text-xs text-gray-500">
              <Info className="h-4 w-4 text-gray-400 shrink-0" />
              <span>
                Каждый продавец работает независимо. Заказ оформляется отдельно по каждому магазину через мессенджер.
              </span>
            </div>

            {/* Группы товаров по магазинам */}
            <div className="space-y-5">
              {storeGroups.map((group) => {
                const shopHref = group.storeSlug
                  ? `/shop/${group.storeSlug}`
                  : null;

                return (
                  <div
                    key={group.storeKey}
                    className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white"
                  >
                    {/* Шапка магазина (без кнопки удалить) */}
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 sm:px-5 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {group.storeAvatar ? (
                          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-gray-200 shrink-0 bg-white">
                            <Image
                              src={group.storeAvatar}
                              alt={group.storeName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 shrink-0">
                            <StoreIcon className="h-4 w-4" />
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 min-w-0">
                          {shopHref ? (
                            <Link
                              href={shopHref}
                              className="font-semibold text-sm text-gray-900 hover:text-rose-600 transition-colors truncate"
                            >
                              {group.storeName}
                            </Link>
                          ) : (
                            <span className="font-semibold text-sm text-gray-900 truncate">
                              {group.storeName}
                            </span>
                          )}
                          {group.isVerified && <VerifiedBadge size="sm" />}
                          {shopHref && (
                            <Link
                              href={shopHref}
                              className="hidden sm:inline-flex items-center gap-0.5 text-[11px] text-gray-400 hover:text-gray-600 ml-1.5"
                            >
                              <span>Витрина</span>
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Счетчик товаров магазина (лаконичный текст без кнопки удаления) */}
                      <span className="text-xs text-gray-400 font-medium shrink-0">
                        {group.totalQuantity} {pluralizeItems(group.totalQuantity)}
                      </span>
                    </div>

                    {/* Список товаров магазина */}
                    <div className="divide-y divide-gray-100 px-4 sm:px-5">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 py-3.5"
                        >
                          {/* Фото + Название + Размер */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Link
                              href={`/product/${item.productId}`}
                              className="relative h-16 w-16 sm:h-18 sm:w-18 overflow-hidden rounded-xl border border-gray-100 shrink-0 bg-gray-50"
                            >
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  className="object-cover transition-transform duration-300 hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-300">
                                  <ShoppingBag className="h-5 w-5" />
                                </div>
                              )}
                            </Link>

                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/product/${item.productId}`}
                                className="font-medium text-sm text-gray-900 hover:text-rose-600 transition-colors line-clamp-1 sm:line-clamp-2"
                              >
                                {item.title}
                              </Link>

                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                {item.selectedSize && (
                                  <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600">
                                    Размер: {item.selectedSize}
                                  </span>
                                )}
                                <span className="text-xs text-gray-400">
                                  {formatPrice(item.price)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Степпер + Сумма + Удалить */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 pl-19 sm:pl-0">
                            {/* Минималистичный степпер */}
                            <div className="flex items-center rounded-lg border border-gray-200 bg-white">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="flex h-7 w-7 items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-l-lg transition-colors active:scale-95"
                                aria-label="Уменьшить"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-semibold text-gray-800 select-none">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="flex h-7 w-7 items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-r-lg transition-colors active:scale-95"
                                aria-label="Увеличить"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Стоимость */}
                            <div className="text-right min-w-[80px]">
                              <p className="text-sm sm:text-base font-semibold text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>

                            {/* Удаление конкретного товара */}
                            <button
                              type="button"
                              onClick={() => {
                                removeItem(item.id);
                                toast.success("Товар удален");
                              }}
                              className="rounded-lg p-1.5 text-gray-300 hover:bg-gray-100 hover:text-red-500 transition-colors"
                              title="Удалить из корзины"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Подвал магазина с итогом и кнопкой оформления */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/30 px-4 sm:px-5 py-3.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-gray-500">Итого в магазине:</span>
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                          {formatPrice(group.totalPrice)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCheckoutGroup(group)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all active:scale-[0.99]"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>
                          Оформить заказ ({group.totalQuantity})
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Итоговая сводка по всей корзине */}
            <div className="rounded-2xl border border-gray-200/70 bg-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto text-left">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                  Общий итог
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatPrice(totalPrice)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({totalCount} {pluralizeItems(totalCount)})
                  </span>
                </div>
              </div>

              <Link
                href="/"
                className="w-full sm:w-auto text-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Продолжить покупки
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно оформления заказа в конкретном магазине */}
      {checkoutGroup && (
        <StoreCheckoutModal
          isOpen={Boolean(checkoutGroup)}
          onClose={() => setCheckoutGroup(null)}
          group={checkoutGroup}
          onOrderCompleted={() => {
            clearStore(checkoutGroup.storeKey);
            setCheckoutGroup(null);
          }}
        />
      )}
    </div>
  );
}