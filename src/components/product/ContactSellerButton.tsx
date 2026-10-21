"use client";

import {
  Instagram,
  Check,
  Send,
  Phone,
  MessageCircle,
  MessageSquare,
  X,
  Copy,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";

export interface StoreContacts {
  instagram?: string | null;
  telegram?: string | null;
  viber?: string | null;
  phone?: string | null;
}

interface ContactSellerButtonProps {
  productId?: string;
  productName: string;
  productPrice: number;
  shopUsername?: string | null;
  contacts?: StoreContacts | null;
  isCardView?: boolean;
  selectedSize?: string | null;
}

// Универсальная функция копирования текста в буфер обмена
async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback
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
  productId,
  productName,
  productPrice,
  shopUsername,
  contacts,
  isCardView = false,
  selectedSize,
}: ContactSellerButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Блокировка прокрутки страницы при открытой модалке
  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen]);

  // Формируем чистые контакты
  const cleanInstagram = (contacts?.instagram || shopUsername || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/https?:\/\/(www\.)?instagram\.com\//, "");

  const cleanTelegram = (contacts?.telegram || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/https?:\/\/t\.me\//, "");

  const rawViber = (contacts?.viber || "").trim();
  const rawPhone = (contacts?.phone || "").trim();

  // Формируем ссылку на товар и текст сообщения для продавца
  const productUrl =
    typeof window !== "undefined" && productId
      ? `${window.location.origin}/product/${productId}`
      : productId
      ? `https://vitrina-pmr.vercel.app/product/${productId}`
      : "";

  const formattedPrice = formatPrice(productPrice); // возвращает число с "Руб"
  const sizeText = selectedSize ? ` (размер: ${selectedSize})` : "";
  const greetingMessage = productUrl
    ? `Здравствуйте! Меня интересует товар «${productName}»${sizeText} (${formattedPrice}).\nСсылка на товар: ${productUrl}`
    : `Здравствуйте! Меня интересует товар «${productName}»${sizeText} (${formattedPrice}) на E-Vitrina PMR.`;

  const copyGreeting = () => {
    copyToClipboard(greetingMessage).then((copied) => {
      if (copied) {
        toast.success("Текст скопирован! Вставьте его в чат");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      }
    });
  };

  interface Channel {
    id: string;
    name: string;
    sub: string;
    url: string;
    icon: typeof Instagram;
    bgClass: string;
    target?: string;
  }

  const channels: Channel[] = [];

  if (cleanInstagram) {
    channels.push({
      id: "instagram",
      name: "Instagram Direct",
      sub: `@${cleanInstagram}`,
      url: `https://ig.me/m/${cleanInstagram}`,
      icon: Instagram,
      bgClass: "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white shadow-sm",
      target: "_blank",
    });
  }

  if (cleanTelegram) {
    channels.push({
      id: "telegram",
      name: "Telegram",
      sub: `@${cleanTelegram}`,
      url: `https://t.me/${cleanTelegram}?text=${encodeURIComponent(greetingMessage)}`,
      icon: Send,
      bgClass: "bg-[#229ED9] hover:bg-[#1E8EC4] text-white shadow-sm",
      target: "_blank",
    });
  }

  if (rawViber) {
    const viberDigits = rawViber.replace(/[^\d]/g, "");
    channels.push({
      id: "viber",
      name: "Viber",
      sub: rawViber,
      url: `viber://chat?number=%2B${viberDigits}`,
      icon: MessageCircle,
      bgClass: "bg-[#7360F2] hover:bg-[#6350E2] text-white shadow-sm",
    });
  }

  if (rawPhone) {
    const phoneDigits = rawPhone.replace(/[^\d+]/g, "");
    channels.push({
      id: "phone",
      name: "Позвонить (IDC)",
      sub: rawPhone,
      url: `tel:${phoneDigits}`,
      icon: Phone,
      bgClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
    });
  }

  const handleChannelClick = (channel: Channel) => {
    trackEvent("contact_seller", {
      product: productName,
      channel: channel.id,
      shop: cleanInstagram || cleanTelegram || rawPhone,
    });
    copyGreeting();
  };

  const handleMainButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (channels.length === 0) return;

    if (channels.length === 1) {
      handleChannelClick(channels[0]);
      window.open(channels[0].url, channels[0].target || "_self", "noopener,noreferrer");
    } else {
      copyGreeting();
      setIsModalOpen(true);
    }
  };

  // Текст и иконка для кнопки
  let mainButtonIcon = MessageSquare;
  let mainButtonText = isCardView ? "Написать" : "Связаться с продавцом";
  let mainButtonBg = "bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:opacity-95 shadow-sm";

  if (channels.length === 0) {
    mainButtonText = "Нет контактов";
    mainButtonBg = "bg-gray-400 opacity-60 cursor-not-allowed";
  } else if (channels.length === 1) {
    mainButtonIcon = channels[0].icon;
    mainButtonText = isCardView
      ? channels[0].name.replace(" Direct", "").replace(" (IDC)", "")
      : channels[0].name;
    mainButtonBg = channels[0].bgClass;
  }

  const MainButtonIconComponent = isCopied ? Check : mainButtonIcon;

  const buttonContent = (
    <button
      type="button"
      onClick={handleMainButtonClick}
      disabled={channels.length === 0}
      className={`flex w-full items-center justify-center gap-1.5 rounded-xl transition-all duration-200 select-none shadow-sm active:scale-[0.98] ${
        isCardView ? "py-2.5 px-3 text-xs sm:text-sm font-semibold" : "py-3 px-4 text-sm font-semibold"
      } ${isCopied ? "bg-emerald-600 hover:bg-emerald-700 text-white" : mainButtonBg}`}
    >
      <MainButtonIconComponent className={`h-4 w-4 shrink-0 ${isCopied ? "animate-in zoom-in" : ""}`} aria-hidden />
      <span className="truncate">{isCopied ? "Скопировано!" : mainButtonText}</span>
      {channels.length > 1 && !isCopied && (
        <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-bold shrink-0 text-white">
          {channels.length}
        </span>
      )}
    </button>
  );

  // Содержимое модального окна (рендерится через React Portal в document.body)
  const modalContent = (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Затемнение фона */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Карточка Bottom Sheet на мобильных / Модалка на десктопе */}
          <motion.div
            initial={{ opacity: 0, y: 120, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 120, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full sm:max-w-md rounded-t-[2rem] sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Полоска-держатель для мобилок */}
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300 sm:hidden" />

            {/* Заголовок и закрытие */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="pr-4">
                <h3 className="text-lg font-bold text-gray-900 leading-snug">Связаться с продавцом</h3>
                <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                  {productName}{selectedSize ? ` · Размер: ${selectedSize}` : ""} · <span className="font-semibold text-rose-600">{formattedPrice}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Зеленый блок подсказки авто-копирования */}
            <div className="my-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-3 text-xs text-emerald-900 flex items-start gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-emerald-900">Текст сообщения скопирован!</p>
                <p className="mt-0.5 text-emerald-700 leading-relaxed text-[11px] sm:text-xs">
                  После перехода в мессенджер нажмите <strong>«Вставить»</strong> в поле ввода.
                </p>
              </div>
            </div>

            {/* Список каналов связи */}
            <div className="space-y-2.5">
              {channels.map((ch) => {
                const Icon = ch.icon;
                return (
                  <a
                    key={ch.id}
                    href={ch.url}
                    target={ch.target || "_self"}
                    rel="noopener noreferrer"
                    onClick={() => {
                      handleChannelClick(ch);
                      setIsModalOpen(false);
                    }}
                    className={`group flex items-center justify-between gap-3 w-full rounded-2xl p-3 sm:p-3.5 transition-all duration-200 active:scale-[0.98] ${ch.bgClass}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="font-bold text-sm text-white leading-tight">{ch.name}</p>
                        <p className="text-xs text-white/90 truncate leading-tight mt-0.5 font-medium">{ch.sub}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/80 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </a>
                );
              })}
            </div>

            {/* Превью скопированного сообщения */}
            <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200/70 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Скопированный текст:
                </span>
                <button
                  type="button"
                  onClick={copyGreeting}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  <span>{isCopied ? "Скопировано!" : "Скопировать ещё раз"}</span>
                </button>
              </div>
              <p className="text-xs text-gray-700 italic bg-white p-2.5 rounded-lg border border-gray-100 select-all leading-relaxed whitespace-pre-wrap break-words">
                {greetingMessage}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {isCardView ? (
        buttonContent
      ) : (
        <div className="fixed bottom-0 left-0 z-40 w-full border-t border-border bg-white p-4 pb-safe md:static md:border-0 md:p-0">
          {buttonContent}
        </div>
      )}

      {mounted && typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </>
  );
}