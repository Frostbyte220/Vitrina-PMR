"use client";

import { Instagram, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { isMobileDevice, formatPrice } from "@/lib/utils";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false); // Состояние для зеленой кнопки

  const handleClick = async (e: React.MouseEvent) => {
    // Важно: останавливаем всплытие клика, если кнопка лежит внутри <Link> карточки
    e.preventDefault();
    e.stopPropagation();

    if (isLoading || !shopUsername) return;
    setIsLoading(true);

    const formattedPrice = formatPrice(productPrice);
    const message = `Здравствуйте! Меня интересует товар «${productName}» за ${formattedPrice} (нашел на Vitrina PMR)`;
    
    const copied = await copyToClipboard(message);

    if (copied) {
      // Добавил проверку на наличие функции на случай проблем с контекстом
      if (showToast) showToast("Текст скопирован! Вставьте его в чат");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } else {
      if (showToast) showToast("Не удалось скопировать. Скопируйте текст вручную");
    }

    const cleanUsername = shopUsername.trim().replace(/^@/, "");
    const targetUrl = `https://ig.me/m/${cleanUsername}`;

    // Умный редирект без модального окна
    if (isMobileDevice()) {
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 300); // Небольшая задержка, чтобы юзер успел увидеть зеленую кнопку
    } else {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }

    setIsLoading(false);
  };

  // Сама кнопка вынесена в константу для переиспользования
  const buttonContent = (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || !shopUsername}
      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold text-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${
        isCopied 
          ? "bg-green-500 hover:bg-green-600" 
          // Заменил bg-primary на градиент инстаграма, но если у вас дизайн требует строго Primary, верните "bg-primary hover:opacity-90"
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
    </button>
  );

  // Если компонент вызван внутри карточки товара — рендерим только кнопку
  if (isCardView) {
    return buttonContent;
  }

  // Если на отдельной странице товара — рендерим с прилипанием к низу экрана на мобильных
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-white p-4 md:static md:border-0 md:p-0">
      {buttonContent}
    </div>
  );
}