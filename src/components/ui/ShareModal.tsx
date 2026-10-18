"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Send,
  MessageCircle,
  MessageSquare,
  Share2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { trackEvent } from "@/lib/analytics";

export interface ShareData {
  title: string;
  text?: string;
  url?: string;
  imageUrl?: string | null;
  subtitle?: string | null;
}

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData;
  modalTitle?: string;
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

export function ShareModal({
  isOpen,
  onClose,
  shareData,
  modalTitle = "Поделиться",
}: ShareModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(shareData.url || "");

  useEffect(() => {
    setMounted(true);
    if (!shareData.url && typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true);
    }
  }, [shareData.url]);

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

  // Закрытие по Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const finalUrl = shareData.url || currentUrl || "https://vitrina-pmr.vercel.app";
  const displayTitle = shareData.title || "Товар";

  const shareText = useMemo(() => {
    if (shareData.text) return shareData.text;
    const sub = shareData.subtitle ? ` (${shareData.subtitle})` : "";
    return `Посмотри «${displayTitle}»${sub} на E-Vitrina PMR:`;
  }, [shareData.text, displayTitle, shareData.subtitle]);

  // Обработка копирования ссылки
  const handleCopy = async () => {
    const success = await copyTextToClipboard(finalUrl);
    if (success) {
      setIsCopied(true);
      toast.success("Ссылка скопирована в буфер обмена!");
      trackEvent("share", { channel: "copy_link", title: displayTitle, url: finalUrl });
      setTimeout(() => setIsCopied(false), 2500);
    } else {
      toast.error("Не удалось скопировать ссылку");
    }
  };

  // Обработка Web Share API (системное меню телефона)
  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      trackEvent("share", { channel: "web_share_api", title: displayTitle, url: finalUrl });
      await navigator.share({
        title: displayTitle,
        text: shareText,
        url: finalUrl,
      });
      onClose();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Native share error:", err);
      }
    }
  };

  // Каналы шеринга
  const channels = [
    {
      id: "telegram",
      name: "Telegram",
      description: "Отправить в чат или канал",
      icon: Send,
      bg: "bg-[#229ED9] hover:bg-[#1E8EC4] text-white",
      iconBg: "bg-white/20 text-white",
      href: `https://t.me/share/url?url=${encodeURIComponent(finalUrl)}&text=${encodeURIComponent(shareText)}`,
      target: "_blank",
    },
    {
      id: "viber",
      name: "Viber",
      description: "Отправить контакту или в группу",
      icon: MessageCircle,
      bg: "bg-[#7360F2] hover:bg-[#6350E2] text-white",
      iconBg: "bg-white/20 text-white",
      href: `viber://forward?text=${encodeURIComponent(shareText + "\n" + finalUrl)}`,
      target: "_blank",
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      description: "Поделиться в чате",
      icon: MessageSquare,
      bg: "bg-[#25D366] hover:bg-[#20BA5A] text-white",
      iconBg: "bg-white/20 text-white",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n" + finalUrl)}`,
      target: "_blank",
    },
  ];

  // Если модалка закрыта или компонент ещё не смонтирован на клиенте — не рендерим ничего
  if (!isOpen || !mounted || typeof document === "undefined" || !document.body) {
    return null;
  }

  const modalNode = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Фон затемнения */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Карточка Bottom Sheet на смартфонах / Центрированная модалка на десктопе */}
          <motion.div
            initial={{ opacity: 0, y: 120, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 120, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full sm:max-w-md rounded-t-[2rem] sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl z-10 max-h-[92vh] overflow-y-auto"
          >
            {/* Ручка для свайпа на мобильных */}
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300 sm:hidden" />

            {/* Шапка модалки */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <Share2 className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  {modalTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Карточка-превью того, чем делятся */}
            <div className="my-3.5 flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-200/70 p-3">
              {shareData.imageUrl ? (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shareData.imageUrl}
                    alt={displayTitle}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-orange-100 text-rose-700 font-bold text-lg">
                  {displayTitle.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-gray-900 line-clamp-1 leading-snug">
                  {displayTitle}
                </p>
                {shareData.subtitle && (
                  <p className="text-xs font-medium text-rose-600 mt-0.5 line-clamp-1">
                    {shareData.subtitle}
                  </p>
                )}
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                  vitrina-pmr.vercel.app
                </p>
              </div>
            </div>

            {/* Системное меню телефона (Web Share API) — если поддерживается */}
            {canNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="mb-2.5 flex items-center justify-between gap-3 w-full rounded-2xl p-3 sm:p-3.5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white transition-all duration-200 active:scale-[0.98] shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-bold text-sm text-white leading-tight">
                      Системное меню телефона
                    </p>
                    <p className="text-xs text-white/80 truncate leading-tight mt-0.5 font-medium">
                      Поделиться через любое установленное приложение
                    </p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-white/80 shrink-0" />
              </button>
            )}

            {/* Мессенджеры (Telegram, Viber, WhatsApp) */}
            <div className="space-y-2">
              {channels.map((ch) => {
                const Icon = ch.icon;
                return (
                  <a
                    key={ch.id}
                    href={ch.href}
                    target={ch.target}
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackEvent("share", {
                        channel: ch.id,
                        title: displayTitle,
                        url: finalUrl,
                      });
                      onClose();
                    }}
                    className={`group flex items-center justify-between gap-3 w-full rounded-2xl p-3 sm:p-3.5 transition-all duration-200 active:scale-[0.98] ${ch.bg}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ch.iconBg}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="font-bold text-sm text-white leading-tight">
                          {ch.name}
                        </p>
                        <p className="text-xs text-white/90 truncate leading-tight mt-0.5 font-medium">
                          {ch.description}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-white/80 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                  </a>
                );
              })}
            </div>

            {/* Блок быстрого копирования ссылки */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Прямая ссылка
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={finalUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="flex-1 rounded-xl bg-gray-50 px-3.5 py-2.5 text-xs text-gray-700 border border-gray-200 outline-none select-all truncate font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all shrink-0 select-none shadow-sm active:scale-95 ${
                    isCopied
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-white" />
                      <span>Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-white" />
                      <span>Скопировать</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalNode, document.body);
}
