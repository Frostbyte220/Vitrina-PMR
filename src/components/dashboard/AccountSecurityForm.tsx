"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { updateUserCredentials } from "@/app/dashboard/actions";

interface AccountSecurityFormProps {
  currentEmail: string;
  isUnclaimed?: boolean;
}

export function AccountSecurityForm({
  currentEmail: initialEmail,
  isUnclaimed: initialIsUnclaimed = false,
}: AccountSecurityFormProps) {
  const { update } = useSession();

  const [currentEmail, setCurrentEmail] = useState(initialEmail);
  const [isUnclaimed, setIsUnclaimed] = useState(initialIsUnclaimed);

  const [newEmail, setNewEmail] = useState(initialIsUnclaimed ? "" : initialEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justActivated, setJustActivated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = newEmail.trim().toLowerCase();

    // 1. Проверка email
    if (!cleanEmail) {
      toast.error("Укажите адрес электронной почты");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      toast.error("Укажите корректный email (например: myname@gmail.com)");
      return;
    }

    // 2. Если указан пароль, проверяем валидность
    if (newPassword) {
      if (newPassword.length < 6) {
        toast.error("Новый пароль должен содержать минимум 6 символов");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Новые пароли не совпадают");
        return;
      }
    }

    // 3. Для подтвержденных аккаунтов требуем текущий пароль при смене пароля
    if (!isUnclaimed && newPassword && !currentPassword) {
      toast.error("Введите текущий пароль для подтверждения изменений");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateUserCredentials({
        email: cleanEmail !== currentEmail.toLowerCase() ? cleanEmail : undefined,
        newPassword: newPassword || undefined,
        confirmPassword: confirmPassword || undefined,
        currentPassword: currentPassword || undefined,
      });

      if (!res.success) {
        toast.error(res.error || "Не удалось сохранить данные");
        return;
      }

      toast.success(res.message || "Данные для входа обновлены!");

      if (res.email) {
        setCurrentEmail(res.email);
        await update({ email: res.email });
      }

      if (isUnclaimed) {
        setIsUnclaimed(false);
        setJustActivated(true);
      }

      // Очищаем поля пароля
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (err: any) {
      toast.error(err.message || "Ошибка при сохранении");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="security"
      className={`rounded-2xl border p-6 shadow-sm transition-all ${
        isUnclaimed
          ? "border-amber-300 bg-amber-50/40 ring-2 ring-amber-300/40"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
              isUnclaimed
                ? "bg-amber-100 text-amber-700"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {isUnclaimed ? (
              <KeyRound className="h-5 w-5" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Данные для входа и безопасность
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              {isUnclaimed
                ? "Привяжите свою личную почту и задайте постоянный пароль"
                : "Управление электронной почтой (логином) и паролем"}
            </p>
          </div>
        </div>

        {isUnclaimed && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            Временный доступ
          </span>
        )}
      </div>

      {/* Сообщение об успешной активации */}
      {justActivated && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-emerald-900">
            <p className="font-bold">
              Поздравляем! Ваш магазин успешно активирован 🎉
            </p>
            <p className="mt-0.5 text-emerald-800">
              Теперь ваш логин — <b>{currentEmail}</b>. Для следующего входа используйте эту почту и новый пароль.
            </p>
          </div>
        </div>
      )}

      {/* Блок предупреждения для unclaimed-продавцов */}
      {isUnclaimed && !justActivated && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-900">
              <p className="font-semibold">
                Вы вошли с технического аккаунта:
              </p>
              <div className="mt-1.5 inline-block rounded-md bg-white/80 px-2.5 py-1 font-mono text-xs font-semibold text-gray-800 border border-amber-200">
                {currentEmail}
              </div>
              <p className="mt-2 text-amber-800">
                Укажите вашу личную почту (Gmail, Mail.ru, Яндекс и др.) и придумайте личный пароль, чтобы закрепить магазин за собой.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Поле 1: Личная почта (Логин) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            {isUnclaimed ? "Ваша личная электронная почта *" : "Электронная почта (логин) *"}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="например: mybrand@gmail.com"
              className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-xs"
            />
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            Этот адрес используется для входа в панель управления и восстановления доступа.
          </p>
        </div>

        {/* Сетка паролей */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Новый пароль */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              {isUnclaimed ? "Придумайте постоянный пароль *" : "Новый пароль (если хотите сменить)"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                required={isUnclaimed}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Подтверждение пароля */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Подтвердите новый пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                required={isUnclaimed || !!newPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите пароль"
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Текущий пароль (только для обычных аккаунтов при смене пароля) */}
        {!isUnclaimed && (
          <div className="pt-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Текущий пароль (требуется только для подтверждения смены пароля)
            </label>
            <div className="relative max-w-sm">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ваш текущий пароль"
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition disabled:opacity-50 ${
              isUnclaimed
                ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                : "bg-gray-900 hover:bg-gray-800"
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Сохранение данных...</span>
              </>
            ) : isUnclaimed ? (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Привязать личную почту и активировать аккаунт</span>
              </>
            ) : (
              <span>Сохранить новые данные для входа</span>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
