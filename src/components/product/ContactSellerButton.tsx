"use client";

import { Instagram, Check, Send, Phone, MessageCircle, MessageSquare, X, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
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
  productName: string;
  productPrice: number;
  shopUsername?: string | null; // fallback
  contacts?: StoreContacts | null;
  isCardView?: boolean;
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
  productName,
  productPrice,
  shopUsername,
  contacts,
  isCardView = false,
}: ContactSellerButtonProps) {
  const { showToast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Формируем чистые контакты
  const cleanInstagram = (contacts?.instagram || shopUsername || "")
    .trim()
    .replace(/^@/, "")
    .replace(/https?:\/\/(www\.)?instagram\.com\//, "");

  const cleanTelegram = (contacts?.telegram || "")
    .trim()
    .replace(/^@/, "")
    .replace(/https?:\/\/t\.me\//, "");

  const rawViber = (contacts?.viber || "").trim();
  const rawPhone = (contacts?.phone || "").trim();

  const formattedPrice = formatPrice(productPrice);
  const greetingMessage = `Здравствуйте! Меня интересует товар «${productName}» за ${formattedPrice} руб. (нашел на E-Vitrina PMR)`;

  const copyGreeting = () => {
    copyToClipboard(greetingMessage).then((copied) => {
      if (copied) {
        if (showToast) showToast("Текст скопирован! Вставьте его в чат");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      }
    });
  };

  // Собираем список доступных каналов связи
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
      url: `https://t.me/${cleanTelegram}`,
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

  // Клик по главной кнопке
  const handleMainButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (channels.length === 0) return;

    if (channels.length === 1) {
      // Если только один канал — копируем текст и сразу переходим
      handleChannelClick(channels[0]);
      window.open(channels[0].url, channels[0].target || "_self", "noopener,noreferrer");
    } else {
      // Если несколько каналов — копируем текст и открываем модалку выбора
      copyGreeting();
      setIsModalOpen(true);
    }
  };

  // Текст и иконка для главной кнопки
  let mainButtonIcon = MessageSquare;
  let mainButtonText = "Написать продавцу";
  let mainButtonBg = "bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90";

  if (channels.length === 0) {
    mainButtonText = "Контакты не указаны";
    mainButtonBg = "bg-gray-400 opacity-60 cursor-not-allowed";
  } else if (channels.length === 1) {
    mainButtonIcon = channels[0].icon;
    mainButtonText = channels[0].name;
    mainButtonBg = channels[0].bgClass;
  } else {
    mainButtonText = "Связаться с продавцом";
    mainButtonBg = "bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:opacity-95 shadow-md shadow-rose-500/20";
  }

  const MainButtonIconComponent = isCopied ? Check : mainButtonIcon;

  const buttonContent = (
    <button
      type="button"
      onClick={handleMainButtonClick}
      disabled={channels.length === 0}
      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold text-white transition-all duration-300 select-none shadow-sm ${
        isCopied ? "bg-emerald-600 hover:bg-emerald-700" : mainButtonBg
      }`}
    >
      <MainButtonIconComponent className={`h-4 w-4 ${isCopied ? "animate-in zoom-in" : ""}`} aria-hidden />
      <span>{isCopied ? "Текст скопирован!" : mainButtonText}</span>
      {channels.length > 1 && !isCopied && (
        <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
          {channels.length}
        </span>
      )}
    </button>
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

      {/* Модальное окно выбора канала связи */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Затемнение фона */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Карточка окна */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Заголовок и кнопка закрытия */}
              <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Связаться с продавцом</h3>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                    {productName} · <span className="font-semibold text-rose-600">{formattedPrice} руб.</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Уведомление о копировании текста */}
              <div className="my-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-start gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Текст сообщения скопирован!</p>
                  <p className="mt-0.5 text-emerald-700">
                    При переходе в чат просто нажмите <strong>«Вставить»</strong> (Paste).
                  </p>
                </div>
              </div>

              {/* Список кнопок каналов связи */}
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
                      className={`flex items-center justify-between gap-3 w-full rounded-2xl p-3.5 transition-all duration-200 transform hover:-translate-y-0.5 ${ch.bgClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm leading-tight">{ch.name}</p>
                          <p className="text-xs opacity-90 leading-tight mt-0.5">{ch.sub}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20">
                        Открыть →
                      </span>
                    </a>
                  );
                })}
              </div>

              {/* Кнопка повторного копирования текста */}
              <button
                type="button"
                onClick={copyGreeting}
                className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Скопировать готовое сообщение повторно</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}