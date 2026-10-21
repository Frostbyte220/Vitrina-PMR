"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  X,
  Copy,
  Check,
  Send,
  MessageCircle,
  Instagram,
  Phone,
  Store as StoreIcon,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { formatPrice } from "@/lib/utils";
import {
  StoreCartGroup,
  generateStoreOrderMessage,
} from "@/store/useCartStore";

interface StoreCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: StoreCartGroup;
  onOrderCompleted?: () => void;
}

// Универсальная функция копирования текста в буфер обмена
async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
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

export function StoreCheckoutModal({
  isOpen,
  onClose,
  group,
  onOrderCompleted,
}: StoreCheckoutModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showOrderDonePrompt, setShowOrderDonePrompt] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Блокировка прокрутки страницы при открытой модалке
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const orderMessage = generateStoreOrderMessage(group);

  const cleanInstagram = (group.contacts?.instagram || group.storeSlug || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/https?:\/\/(www\.)?instagram\.com\//, "");

  const cleanTelegram = (group.contacts?.telegram || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/https?:\/\/t\.me\//, "");

  const rawViber = (group.contacts?.viber || "").trim();
  const rawPhone = (group.contacts?.phone || "").trim();

  const handleCopyMessage = async () => {
    const success = await copyToClipboard(orderMessage);
    if (success) {
      setIsCopied(true);
      toast.success("Текст заказа скопирован в буфер обмена!");
      setTimeout(() => setIsCopied(false), 3000);
    } else {
      toast.error("Не удалось скопировать текст");
    }
  };

  const handleChannelClick = async (channel: "telegram" | "viber" | "instagram" | "phone") => {
    // Для каналов, которые не могут автоматически подставить сообщение через URL (Viber, Instagram),
    // сразу копируем текст заказа в буфер обмена
    if (channel === "viber" || channel === "instagram") {
      await copyToClipboard(orderMessage);
      toast.success("Текст заказа скопирован! Вставьте его в чат");
    }
    setShowOrderDonePrompt(true);
  };

  const handleConfirmOrderCompleted = () => {
    if (onOrderCompleted) {
      onOrderCompleted();
    }
    toast.success("Товары магазина удалены из корзины. Удачных покупок!");
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Затемненный фон */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Окно модалки */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl z-10 border border-gray-100 flex flex-col"
      >
        {/* Шапка модалки */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            {group.storeAvatar ? (
              <div className="relative h-12 w-12 rounded-2xl overflow-hidden shrink-0 border border-gray-100 shadow-xs">
                <Image
                  src={group.storeAvatar}
                  alt={group.storeName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shrink-0">
                <StoreIcon className="h-6 w-6" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                Оформление заказа
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {group.storeName}
                </h3>
                {group.isVerified && <VerifiedBadge size="sm" />}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Краткая сводка по товарам */}
        <div className="my-4 rounded-2xl bg-gray-50/80 p-3.5 border border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2 font-medium">
            <span>
              Позиций к заказу: <strong>{group.totalQuantity} шт.</strong> ({group.items.length}{" "}
              {group.items.length === 1 ? "наименование" : "наименования"})
            </span>
            <span className="text-sm font-extrabold text-rose-600">
              {formatPrice(group.totalPrice)}
            </span>
          </div>

          <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-100 text-xs">
            {group.items.map((it) => (
              <div key={it.id} className="pt-1.5 first:pt-0 flex items-center justify-between gap-2">
                <span className="truncate text-gray-800">
                  {it.title} {it.selectedSize ? `(${it.selectedSize})` : ""}
                </span>
                <span className="shrink-0 text-gray-500 font-medium">
                  {it.quantity > 1 ? `${it.quantity} × ` : ""}
                  {formatPrice(it.price * it.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Предпросмотр текста сообщения для продавца */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Сформированное сообщение для продавца:
            </label>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-green-600">Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Скопировать</span>
                </>
              )}
            </button>
          </div>
          <div className="relative rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto select-all leading-relaxed">
            {orderMessage}
          </div>
        </div>

        {/* Кнопки выбора канала связи */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-gray-800">
            Выберите, куда отправить заказ:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* 1. Telegram */}
            {cleanTelegram ? (
              <a
                href={`https://t.me/${cleanTelegram}?text=${encodeURIComponent(orderMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleChannelClick("telegram")}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1E8EC4] transition-all active:scale-[0.98]"
              >
                <Send className="h-4 w-4" />
                <span>Написать в Telegram</span>
              </a>
            ) : null}

            {/* 2. Viber */}
            {rawViber ? (
              <a
                href={`viber://chat?number=%2B${rawViber.replace(/[^\d]/g, "")}`}
                onClick={() => handleChannelClick("viber")}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#7360F2] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6350E2] transition-all active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Написать в Viber</span>
              </a>
            ) : null}

            {/* 3. Instagram Direct */}
            {cleanInstagram ? (
              <a
                href={`https://ig.me/m/${cleanInstagram}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleChannelClick("instagram")}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition-all active:scale-[0.98]"
              >
                <Instagram className="h-4 w-4" />
                <span>Instagram Direct</span>
              </a>
            ) : null}

            {/* 4. Позвонить */}
            {rawPhone ? (
              <a
                href={`tel:${rawPhone.replace(/[^\d+]/g, "")}`}
                onClick={() => handleChannelClick("phone")}
                className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all active:scale-[0.98]"
              >
                <Phone className="h-4 w-4" />
                <span>Позвонить</span>
              </a>
            ) : null}
          </div>

          {!cleanTelegram && !rawViber && !cleanInstagram && !rawPhone && (
            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
              У магазина не указаны прямые контакты мессенджеров. Скопируйте текст заказа и свяжитесь с продавцом через страницу магазина.
            </div>
          )}
        </div>

        {/* Уведомление после клика на отправку */}
        {showOrderDonePrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 flex flex-col gap-2.5"
          >
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Заказ отправлен продавцу?</span>
            </div>
            <p className="text-xs text-emerald-700">
              Вы можете очистить товары этого магазина из корзины, чтобы они больше не занимали место.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={handleConfirmOrderCompleted}
                className="flex-1 rounded-xl bg-emerald-600 py-2 px-3 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Да, очистить товары магазина
              </button>
              <button
                type="button"
                onClick={() => setShowOrderDonePrompt(false)}
                className="rounded-xl border border-emerald-300 py-2 px-3 text-xs font-medium text-emerald-800 hover:bg-emerald-100/50 transition-colors"
              >
                Оставить в корзине
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
