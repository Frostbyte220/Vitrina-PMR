"use client";

import { useState } from "react";
import { ContactSellerButton, StoreContacts } from "./ContactSellerButton";
import { Check } from "lucide-react";
import { ShareButton } from "@/components/ui/ShareButton";
import { formatPrice } from "@/lib/utils";

interface ProductPurchaseSectionProps {
  productId: string;
  productName: string;
  productPrice: number;
  shopUsername?: string | null;
  contacts?: StoreContacts | null;
  sizes?: string[];
  category?: string;
  imageUrl?: string | null;
  shopName?: string | null;
}

export function ProductPurchaseSection({
  productId,
  productName,
  productPrice,
  shopUsername,
  contacts,
  sizes = [],
  category,
  imageUrl,
  shopName,
}: ProductPurchaseSectionProps) {
  // Выбранный размер (по умолчанию первый размер, если есть, либо null)
  const hasSizes = Array.isArray(sizes) && sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState<string | null>(
    hasSizes ? sizes[0] : null
  );

  const handleSelectSize = (size: string) => {
    // Если нажимаем на уже выбранный — переключаем (или оставляем)
    setSelectedSize((prev) => (prev === size ? null : size));
  };

  const formattedPrice = typeof productPrice === "number" ? formatPrice(productPrice) : "";
  const shareSubtitle = [shopName, formattedPrice].filter(Boolean).join(" · ");

  return (
    <>
      {/* 1. Блок выбора размера на странице товара */}
      {hasSizes && (
        <div className="mt-2 rounded-2xl border border-gray-100 bg-surface/50 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-text-main">
              Размер:{" "}
              {selectedSize ? (
                <span className="font-bold text-rose-600">{selectedSize}</span>
              ) : (
                <span className="text-xs font-normal text-text-muted">
                  (не выбран)
                </span>
              )}
            </span>
            <span className="text-xs text-text-muted">
              {category === "Обувь" ? "Размер обуви" : "Размер одежды"}
            </span>
          </div>

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
                      ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-200 border-rose-600"
                      : "bg-white text-gray-800 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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

          <p className="mt-2.5 text-[11px] text-text-muted">
            💡 Выбранный размер автоматически добавится в сообщение продавцу.
          </p>
        </div>
      )}

      {/* 2. Десктопная секция связи + кнопка «Поделиться» */}
      <div className="hidden md:flex items-center gap-2.5 mt-2">
        <div className="flex-1">
          <ContactSellerButton
            productId={productId}
            productName={productName}
            productPrice={productPrice}
            shopUsername={shopUsername}
            contacts={contacts}
            isCardView={true}
            selectedSize={selectedSize}
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

      {/* 3. Мобильная фиксированная панель связи + кнопка «Поделиться» */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md p-3.5 md:hidden pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {hasSizes && selectedSize && (
          <div className="mb-2 flex items-center justify-between text-xs px-1">
            <span className="text-gray-600">
              Выбранный размер: <strong className="text-rose-600 font-bold">{selectedSize}</strong>
            </span>
            <button
              type="button"
              onClick={() => setSelectedSize(null)}
              className="text-[11px] font-medium text-gray-400 hover:text-gray-600"
            >
              Снять выбор
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <ContactSellerButton
              productId={productId}
              productName={productName}
              productPrice={productPrice}
              shopUsername={shopUsername}
              contacts={contacts}
              isCardView={true}
              selectedSize={selectedSize}
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
