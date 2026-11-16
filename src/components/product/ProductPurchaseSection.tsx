"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ContactSellerButton, StoreContacts } from "./ContactSellerButton";
import { Check, ShoppingBag } from "lucide-react";
import { ShareButton } from "@/components/ui/ShareButton";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

interface ProductPurchaseSectionProps {
  productId: string;
  productName: string;
  productPrice: number;
  oldPrice?: number | null;
  shopUsername?: string | null;
  contacts?: StoreContacts | null;
  sizes?: string[];
  variants?: { name: string; price: number; oldPrice?: number | null }[] | null;
  category?: string;
  imageUrl?: string | null;
  shopName?: string | null;
  storeId?: string | null;
  storeAvatar?: string | null;
  isVerified?: boolean;
  availability?: string | null;
}

export function ProductPurchaseSection({
  productId,
  productName,
  productPrice,
  oldPrice,
  shopUsername,
  contacts,
  sizes = [],
  variants = [],
  category,
  imageUrl,
  shopName,
  storeId,
  storeAvatar,
  isVerified,
  availability,
}: ProductPurchaseSectionProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  const cartItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPerfume = category === "Парфюмерия";
  const hasVariants = Array.isArray(variants) && variants.length > 0;
  const hasSizes = (Array.isArray(sizes) && sizes.length > 0) || hasVariants;

  // Если выбран вариант с отдельной ценой (например, 10 мл)
  const activeVariant = hasVariants ? variants.find((v) => v.name === selectedSize) : null;
  const effectivePrice = activeVariant ? activeVariant.price : productPrice;
  const effectiveOldPrice = activeVariant ? (activeVariant.oldPrice ?? null) : oldPrice;

  // Проверяем, находится ли текущий вариант (или товар без размера) в корзине
  const isInCart = mounted && (
    hasSizes
      ? selectedSize !== null && cartItems.some((i) => i.productId === productId && i.selectedSize === selectedSize)
      : cartItems.some((i) => i.productId === productId)
  );

  const handleSelectSize = (size: string) => {
    setSizeError(false);
    setSelectedSize((prev) => (prev === size ? null : size));
  };

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      setSizeError(true);
      toast.error(isPerfume ? "Пожалуйста, выберите подходящий объем" : "Пожалуйста, выберите подходящий размер товара");
      return;
    }

    addItem({
      productId,
      title: productName,
      price: effectivePrice,
      oldPrice: effectiveOldPrice,
      image: imageUrl || "",
      selectedSize,
      storeId,
      storeName: shopName || "Магазин",
      storeSlug: shopUsername,
      storeAvatar,
      isVerified,
      contacts,
    });

    toast.success(
      (t) => (
        <div className="flex items-center justify-between gap-3 w-full">
          <span className="text-xs sm:text-sm font-medium">Товар добавлен в корзину</span>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id);
              router.push("/cart");
            }}
            className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-700 whitespace-nowrap active:scale-95 transition-all shadow-xs"
          >
            В корзину →
          </button>
        </div>
      ),
      { duration: 4000 }
    );
  };

  const handleCartButtonClick = () => {
    if (isInCart) {
      router.push("/cart");
      return;
    }
    handleAddToCart();
  };

  const formattedPrice = typeof productPrice === "number" ? formatPrice(productPrice) : "";
  const shareSubtitle = [shopName, formattedPrice].filter(Boolean).join(" · ");

  return (
    <>
      {/* 1. Блок выбора объема / размера на странице товара */}
      {hasSizes && (
        <div
          className={`mt-2 rounded-2xl border p-4 shadow-sm transition-all duration-200 ${
            sizeError
              ? "border-rose-400 bg-rose-50/40 ring-2 ring-rose-200"
              : "border-gray-100 bg-surface/50"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-text-main">
              {hasVariants ? (isPerfume ? "Объем:" : "Вариант / Объем:") : "Размер:"}{" "}
              {selectedSize ? (
                <>
                  <span className="font-bold text-rose-600">{selectedSize}</span>
                  {hasVariants && (
                    <span className="ml-1.5 text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                      {formatPrice(effectivePrice)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {hasVariants ? "Выберите объем" : "Выберите размер"}
                </span>
              )}
            </span>
            <span className="text-xs text-text-muted">
              {hasVariants
                ? (isPerfume ? "Распив / флакон" : "Варианты")
                : category === "Обувь"
                ? "Размер обуви"
                : "Размер одежды"}
            </span>
          </div>

          {/* Варианты с ценами (для парфюмерии/распива) */}
          {hasVariants ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {variants!.map((variant) => {
                const isSelected = selectedSize === variant.name;
                const hasVariantDiscount = Boolean(variant.oldPrice && variant.oldPrice > variant.price);
                return (
                  <button
                    key={variant.name}
                    type="button"
                    onClick={() => handleSelectSize(variant.name)}
                    className={`relative flex flex-col items-start justify-center rounded-xl p-2.5 text-left transition-all duration-200 select-none ${
                      isSelected
                        ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-200 border-rose-600 scale-[1.02]"
                        : "bg-white text-gray-800 border border-gray-200 hover:border-gray-400 hover:bg-gray-50 active:scale-95"
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm leading-tight">{variant.name}</span>
                      {isSelected && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-rose-600 shadow-sm">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-rose-600"}`}>
                        {formatPrice(variant.price)}
                      </span>
                      {hasVariantDiscount && (
                        <span className={`text-[10px] line-through ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                          {formatPrice(variant.oldPrice!)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Обычные размеры без цен (для одежды/обуви) */
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSelectSize(size)}
                    className={`relative flex min-w-[44px] items-center justify-center rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 select-none ${
                      isSelected
                        ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-200 border-rose-600 scale-105"
                        : "bg-white text-gray-800 border border-gray-200 hover:border-gray-400 hover:bg-gray-50 active:scale-95"
                    }`}
                    aria-pressed={isSelected}
                  >
                    <span>{size}</span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-rose-600 shadow-sm border border-rose-200">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <p className="mt-2.5 text-[11px] text-text-muted">
            {selectedSize ? (
              <span>
                💡 Выбран {hasVariants ? "объем" : "размер"} <b>{selectedSize}</b>
                {hasVariants && <> по цене <b>{formatPrice(effectivePrice)}</b></>}.
                Сохранится при добавлении в корзину или сообщении продавцу.
              </span>
            ) : (
              <span>
                💡 Нажмите на нужный {hasVariants ? "объем" : "размер"}, чтобы выбрать его перед покупкой или вопросом продавцу.
              </span>
            )}
          </p>
        </div>
      )}

      {/* 2. Десктопная секция покупки: «В корзину», «Написать продавцу», «Поделиться» */}
      <div className="hidden md:flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCartButtonClick}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 px-4 font-bold text-sm transition-all shadow-sm active:scale-[0.98] ${
              isInCart
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100/90 border border-rose-200"
            }`}
            title={isInCart ? "Перейти в корзину" : "Добавить в корзину"}
          >
            {isInCart ? (
              <>
                <Check className="h-4 w-4 stroke-[2.5]" />
                <span>В корзине — перейти →</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                <span>В корзину</span>
              </>
            )}
          </button>

          <div className="flex-1">
            <ContactSellerButton
              productId={productId}
              productName={productName}
              productPrice={effectivePrice}
              shopUsername={shopUsername}
              contacts={contacts}
              isCardView={true}
              selectedSize={selectedSize}
              availability={availability}
              storeId={storeId}
            />
          </div>

          <ShareButton
            title={productName}
            subtitle={shareSubtitle}
            imageUrl={imageUrl}
            variant="outline"
            size="md"
            label="Поделиться"
            modalTitle="Поделиться товаром"
            className="h-[46px] px-4 shrink-0 rounded-xl"
          />
        </div>

        <Link
          href="/cart"
          className="inline-flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-rose-600 transition-colors py-0.5"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Перейти в корзину для оформления мульти-заказа →</span>
        </Link>
      </div>

      {/* 3. Мобильная фиксированная панель: «В корзину», «Связаться», «Поделиться» */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md p-3.5 md:hidden pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {hasSizes && (
          <div className="mb-2 flex items-center justify-between text-xs px-1">
            {selectedSize ? (
              <>
                <span className="text-gray-600 truncate">
                  {hasVariants ? "Выбран объем:" : "Выбранный размер:"}{" "}
                  <strong className="text-rose-600 font-bold">{selectedSize}</strong>
                  {hasVariants && (
                    <span className="ml-1 text-gray-800 font-bold">({formatPrice(effectivePrice)})</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSize(null)}
                  className="text-[11px] font-medium text-gray-400 hover:text-gray-600 shrink-0 ml-2"
                >
                  Снять выбор
                </button>
              </>
            ) : (
              <span className="text-amber-700 font-medium text-[11px]">
                ⚠️ {hasVariants ? "Объем не выбран" : "Размер не выбран"}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCartButtonClick}
            className={`h-11 px-3.5 shrink-0 flex items-center justify-center gap-1.5 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95 ${
              isInCart
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
            }`}
            title={isInCart ? "Перейти в корзину" : "Добавить в корзину"}
          >
            {isInCart ? (
              <>
                <Check className="h-4 w-4 stroke-[2.5]" />
                <span>В корзине →</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                <span>В корзину</span>
              </>
            )}
          </button>

          <div className="flex-1">
            <ContactSellerButton
              productId={productId}
              productName={productName}
              productPrice={effectivePrice}
              shopUsername={shopUsername}
              contacts={contacts}
              isCardView={true}
              selectedSize={selectedSize}
              availability={availability}
              storeId={storeId}
            />
          </div>

          <ShareButton
            title={productName}
            subtitle={shareSubtitle}
            imageUrl={imageUrl}
            variant="icon"
            size="md"
            label="Поделиться"
            modalTitle="Поделиться товаром"
            className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 shadow-sm"
          />
        </div>
      </div>
    </>
  );
}
