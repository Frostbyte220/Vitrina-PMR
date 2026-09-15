"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showToast("Пароли не совпадают");
      return;
    }
    
    if (password.length < 6) {
      showToast("Пароль должен быть минимум 6 символов");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        showToast(data.error || "Произошла ошибка");
      }
    } catch {
      showToast("Ошибка при отправке запроса");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center p-6">
        <h2 className="text-lg font-semibold text-rose-600 mb-2">Ошибка</h2>
        <p className="text-sm text-text-muted mb-6">Отсутствует токен восстановления.</p>
        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
          Запросить новую ссылку
        </Link>
      </div>
    );
  }

  return isSuccess ? (
    <div className="rounded-xl bg-green-50 p-6 text-center border border-green-100">
      <h2 className="text-lg font-medium text-green-800 mb-2">Пароль успешно изменен!</h2>
      <p className="text-sm text-green-700">
        Вы будете перенаправлены на страницу входа через несколько секунд...
      </p>
      <Link href="/login" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
        Войти сейчас
      </Link>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-text-main">
          Новый пароль
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Минимум 6 символов"
          className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-main outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-text-main">
          Подтвердите пароль
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Повторите новый пароль"
          className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-main outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
          isLoading ? "opacity-70 pointer-events-none" : ""
        }`}
      >
        {isLoading ? "Сохранение..." : "Сохранить новый пароль"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-block text-2xl font-bold tracking-tight text-primary">
            Vitrina PMR
          </Link>
          <h1 className="text-xl font-semibold text-text-main">Сброс пароля</h1>
          <p className="mt-2 text-sm text-text-muted">
            Придумайте новый надежный пароль
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-sm text-gray-500 py-10">Загрузка...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
