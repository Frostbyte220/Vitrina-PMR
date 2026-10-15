"use client";

import { useState, useEffect } from "react";
import { Flag, X, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ReportProductModalProps {
  productId: string;
  productTitle: string;
}

const REPORT_REASONS = [
  { id: "illegal", label: "Запрещенный или нелегальный товар", icon: "🚫" },
  { id: "out_of_stock", label: "Неактуальная цена или нет в наличии", icon: "📉" },
  { id: "fraud", label: "Мошенничество или спам", icon: "⚠️" },
  { id: "inappropriate", label: "Оскорбительный или взрослый контент", icon: "🔞" },
  { id: "wrong_info", label: "Неверная категория или описание", icon: "📝" },
  { id: "other", label: "Другая причина", icon: "💬" },
];

export function ReportProductModal({ productId, productTitle }: ReportProductModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting]);

  const handleOpen = () => {
    setSelectedReason("");
    setDetails("");
    setIsSubmitted(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      toast.error("Пожалуйста, выберите причину жалобы");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          reason: selectedReason,
          details: details.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Не удалось отправить жалобу");
      }

      setIsSubmitted(true);
      toast.success("Жалоба успешно отправлена модераторам");
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Ошибка отправки жалобы");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Кнопка вызова модального окна на странице товара */}
      <button
        type="button"
        onClick={handleOpen}
        className="group inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors py-1"
        title="Сообщить о нарушении или неактуальной информации"
      >
        <Flag className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
        <span>Пожаловаться на товар</span>
      </button>

      {/* Модальное окно */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all outline outline-1 outline-gray-200 animate-in zoom-in-95 duration-150">
            {/* Кнопка закрытия */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>

            {isSubmitted ? (
              // Экран успешной отправки
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Жалоба отправлена
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Спасибо! Модераторы E-Vitrina PMR проверят этот товар в ближайшее время.
                </p>
              </div>
            ) : (
              // Форма отправки жалобы
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 pr-6">
                    <h3 className="text-lg font-bold text-gray-900">
                      Пожаловаться на товар
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500 truncate">
                      «{productTitle}»
                    </p>
                  </div>
                </div>

                <div className="mt-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Выберите причину <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {REPORT_REASONS.map((r) => {
                      const isSelected = selectedReason === r.label;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedReason(r.label)}
                          className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-medium transition-all ${
                            isSelected
                              ? "border-rose-500 bg-rose-50/70 text-rose-900 shadow-sm ring-1 ring-rose-500"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-base leading-none">{r.icon}</span>
                          <span className="leading-snug">{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="report-details"
                    className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
                  >
                    Дополнительные подробности (необязательно)
                  </label>
                  <textarea
                    id="report-details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Например: номер продавца не отвечает, товар продан, или нарушает правила..."
                    className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                  />
                  <div className="mt-1 text-right text-[11px] text-gray-400">
                    {details.length} / 500
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-end gap-2.5 border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedReason}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{isSubmitting ? "Отправка..." : "Отправить жалобу"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
