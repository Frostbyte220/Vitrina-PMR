"use client";

import { Instagram, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { isMobileDevice, formatPrice } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

interface ContactSellerButtonProps {
  productName: string;
  productPrice: number;
  shopUsername: string;
  isCardView?: boolean; // Новый проп: если true, убираем fixed обертку
}

// Ваша универсальная функция копирования (отлично работает)
async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to execCommand fallback
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  }

  document.body.removeChild(textarea);
  return success;
}

export function ContactSellerButton({
  productName,
  productPrice,
  shopUsername,
  isCardView = false, // По умолчанию false (работает как раньше для страницы товара)
}: ContactSellerButtonProps) {
  const { showToast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // НЕ вызываем preventDefault() — даём браузеру нативно открыть ссылку.
    // Копирование — побочный эффект без await в основном потоке.
    e.stopPropagation();

    trackEvent("contact_seller", { product: productName, shop: shopUsername });

    const formattedPrice = formatPrice(productPrice);
    const message = `Здравствуйте! Меня интересует товар «${productName}» за ${formattedPrice} руб. (нашел на E-Vitrina PMR)`;

    // fire-and-forget: не await-им, чтобы не задерживать переход
    copyToClipboard(message).then((copied) => {
      if (copied) {
        if (showToast) showToast("Текст скопирован! Вставьте его в чат");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      } else {
        if (showToast) showToast("Не удалось скопировать. Скопируйте вручную");
      }
    });
  };

  const cleanUsername = shopUsername.trim().replace(/^@/, "");
  const instagramUrl = `https://ig.me/m/${cleanUsername}`;

  // Сама кнопка — нативная ссылка <a>, браузер никогда её не заблокирует
  const buttonContent = (
    <a
      href={shopUsername ? instagramUrl : undefined}
      target="_blank"
      rel="noopener noreferrer"
      onClick={shopUsername ? handleClick : undefined}
      aria-disabled={!shopUsername}
      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold text-white transition-all duration-300 select-none ${
        !shopUsername
          ? "opacity-50 cursor-not-allowed bg-gray-400"
          : isCopied
          ? "bg-green-500 hover:bg-green-600"
          : "bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 shadow-sm"
      }`}
    >
      {isCopied ? (
        <>
          <Check className="h-4 w-4 animate-in zoom-in" aria-hidden />
          <span>Текст скопирован!</span>
        </>
      ) : (
        <>
          <Instagram className="h-4 w-4" aria-hidden />
          <span>{shopUsername ? "Написать продавцу" : "Instagram не указан"}</span>
        </>
      )}
    </a>
  );

  // Если компонент вызван внутри карточки товара — рендерим только кнопку
  if (isCardView) {
    return buttonContent;
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-white p-4 pb-safe md:static md:border-0 md:p-0">
      {buttonContent}
    </div>
  );
}