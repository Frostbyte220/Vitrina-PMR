"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
      } else {
        showToast(data.error || "Произошла ошибка");
      }
    } catch {
      showToast("Ошибка при отправке запроса");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-block text-2xl font-bold tracking-tight text-primary">
            Vitrina PMR
          </Link>
          <h1 className="text-xl font-semibold text-text-main">Восстановление пароля</h1>
          <p className="mt-2 text-sm text-text-muted">
            Введите email, который вы использовали при регистрации
          </p>
        </div>

        {isSuccess ? (
          <div className="rounded-xl bg-green-50 p-6 text-center border border-green-100">
            <h2 className="text-lg font-medium text-green-800 mb-2">Ссылка отправлена!</h2>
            <p className="text-sm text-green-700">
              Если аккаунт с таким email существует, мы отправили на него ссылку для сброса пароля.
              (В режиме разработки проверьте консоль сервера)
            </p>
            <Link 
              href="/login"
              className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
            >
              Вернуться ко входу
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-text-main">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
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
              {isLoading ? "Отправка..." : "Отправить ссылку"}
            </button>
            
            <div className="text-center text-sm text-text-muted mt-2">
              Вспомнили пароль?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Войти
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
