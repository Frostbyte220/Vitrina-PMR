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
  Sparkles,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import {
  useCartStore,
  StoreCartGroup,
} from "@/store/useCartStore";
import { StoreCheckoutModal } from "@/components/cart/StoreCheckoutModal";
import toast from "react-hot-toast";

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
      <div className="container mx-auto px-4 py-16 max-w-5xl flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
      </div>
    );
  }

  const storeGroups = getStoreGroups();
  const totalCount = getTotalCount();
  const totalPrice = getTotalPrice();

  const handleClearAll = () => {
    if (window.confirm("Вы уверены, что хотите полностью очистить корзину?")) {
      clearCart();
      toast.success("Корзина очищена");
    }
  };

  const handleClearStore = (group: StoreCartGroup) => {
    if (
      window.confirm(
        `Удалить все товары магазина «${group.storeName}» из корзины?`
      )
    ) {
      clearStore(group.storeKey);
      toast.success(`Товары магазина «${group.storeName}» удалены`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 pb-24 pt-6 sm:pt-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Верхняя навигация */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Вернуться в каталог</span>
          </Link>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Очистить всё</span>
            </button>
          )}
        </div>

        {/* Заголовок страницы */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-xs">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Корзина покупок
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {totalCount > 0 ? (
                <>
                  В вашей корзине {totalCount}{" "}
                  {totalCount === 1
                    ? "товар"
                    : totalCount > 1 && totalCount < 5
                    ? "товара"
                    : "товаров"}
                  {storeGroups.length > 1
                    ? ` из ${storeGroups.length} магазинов`
                    : ""}
                </>
              ) : (
                "Ваша корзина пуста"
              )}
            </p>
          </div>
        </div>

        {/* Пустая корзина */}
        {items.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 sm:p-12 text-center shadow-xs max-w-md mx-auto my-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-400 mb-5">
              <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              В корзине пока ничего нет
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Выбирайте понравившиеся товары в каталоге и добавляйте их в
              корзину для быстрого заказа в мессенджерах продавцов.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition-all active:scale-95"
              >
                <span>Перейти к покупкам</span>
              </Link>
              <Link
                href="/favorites"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Избранное</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Информационная подсказка о мульти-заказе */}
            <div className="rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50/60 to-orange-50/40 p-4 sm:p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-gray-700 space-y-1">
                  <p className="font-semibold text-gray-900">
                    Как устроен заказ на Витрине ПМР:
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Каждый магазин работает независимо. Ваши товары
                    сгруппированы по продавцам — нажмите кнопку «Оформить заказ в
                    магазине», чтобы отправить продавцу готовый список с размерами
                    и ссылками в Telegram или Viber.
                  </p>
                </div>
              </div>
            </div>

            {/* Группы товаров по магазинам */}
            <div className="space-y-6">
              {storeGroups.map((group) => {
                const shopHref = group.storeSlug
                  ? `/shop/${group.storeSlug}`
                  : null;

                return (
                  <div
                    key={group.storeKey}
                    className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xs transition-shadow hover:shadow-md"
                  >
                    {/* Шапка магазина */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {group.storeAvatar ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-gray-200 shrink-0 bg-white">
                            <Image
                              src={group.storeAvatar}
                              alt={group.storeName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shrink-0">
                            <StoreIcon className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {shopHref ? (
                              <Link
                                href={shopHref}
                                className="font-bold text-gray-900 hover:text-rose-600 transition-colors truncate text-base"
                              >
                                {group.storeName}
                              </Link>
                            ) : (
                              <span className="font-bold text-gray-900 truncate text-base">
                                {group.storeName}
                              </span>
                            )}
                            {group.isVerified && <VerifiedBadge size="sm" />}
                          </div>
                          {shopHref && (
                            <Link
                              href={shopHref}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-gray-600"
                            >
                              <span>Перейти на витрину продавца</span>
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto">
                        <span className="text-xs text-gray-500 font-medium">
                          {group.totalQuantity}{" "}
                          {group.totalQuantity === 1
                            ? "товар"
                            : group.totalQuantity < 5
                            ? "товара"
                            : "товаров"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleClearStore(group)}
                          title="Удалить товары этого магазина"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Список товаров в магазине */}
                    <div className="divide-y divide-gray-100 px-5">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4"
                        >
                          {/* Картинка + Название + Размер */}
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <Link
                              href={`/product/${item.productId}`}
                              className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-2xl border border-gray-100 shrink-0 bg-gray-50"
                            >
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  className="object-cover transition-transform duration-300 hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                  <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
                                </div>
                              )}
                            </Link>

                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/product/${item.productId}`}
                                className="font-semibold text-sm sm:text-base text-gray-900 hover:text-rose-600 transition-colors line-clamp-2 leading-snug"
                              >
                                {item.title}
                              </Link>

                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                {item.selectedSize && (
                                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                                    Размер: {item.selectedSize}
                                  </span>
                                )}
                                <span className="text-xs text-gray-400">
                                  {formatPrice(item.price)} / шт.
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Количество + Итого по позиции + Удаление */}
                          <div className="flex items-center justify-between sm:justify-end gap-5 pl-20 sm:pl-0">
                            {/* Степпер количества */}
                            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50/50 p-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-xs transition-all active:scale-90"
                                aria-label="Уменьшить количество"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-xs transition-all active:scale-90"
                                aria-label="Увеличить количество"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Итого по товару */}
                            <div className="text-right min-w-[90px]">
                              <p className="text-sm sm:text-base font-extrabold text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-[10px] text-gray-400">
                                  {item.quantity} × {formatPrice(item.price)}
                                </p>
                              )}
                            </div>

                            {/* Кнопка удалить */}
                            <button
                              type="button"
                              onClick={() => {
                                removeItem(item.id);
                                toast.success("Товар удален из корзины");
                              }}
                              className="rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Удалить из корзины"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Подвал карточки магазина с кнопкой оформления */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 p-5">
                      <div>
                        <span className="text-xs text-gray-500 font-medium">
                          Сумма заказа в этом магазине:
                        </span>
                        <div className="text-xl sm:text-2xl font-extrabold text-rose-600">
                          {formatPrice(group.totalPrice)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCheckoutGroup(group)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-rose-700 transition-all active:scale-[0.98]"
                      >
                        <Send className="h-4 w-4" />
                        <span>
                          Оформить заказ ({group.totalQuantity}{" "}
                          {group.totalQuantity === 1 ? "товар" : "товара"})
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Итоговая сводка по всей корзине */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Общий итог по корзине
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">
                    {formatPrice(totalPrice)}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    ({totalCount}{" "}
                    {totalCount === 1
                      ? "товар"
                      : totalCount < 5
                      ? "товара"
                      : "товаров"}{" "}
                    в {storeGroups.length}{" "}
                    {storeGroups.length === 1 ? "магазине" : "магазинах"})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>Продолжить покупки</span>
                </Link>
              </div>
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
