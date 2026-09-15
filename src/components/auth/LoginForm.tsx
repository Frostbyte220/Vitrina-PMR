"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { registerUser } from "@/app/login/actions"; // Импортируем наше серверное действие

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  // Состояния формы
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [instagramLink, setInstagramLink] = useState(""); // <-- СОСТОЯНИЕ ДЛЯ ССЫЛКИ
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    // Если включен режим регистрации
    if (isRegister) {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("instagram", instagram);
      formData.append("instagramLink", instagramLink); // <-- ПЕРЕДАЕМ ССЫЛКУ НА СЕРВЕР
      formData.append("email", email);
      formData.append("password", password);

      const res = await registerUser(formData);
      
      if (res?.error) {
        showToast(res.error);
        setIsLoading(false);
        return;
      }
    }

    // Вход (срабатывает как для обычного логина, так и автологин после регистрации)
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    // --- ИСПРАВЛЕННЫЙ БЛОК РЕДИРЕКТА ---
    if (result?.error || !result?.ok) {
      showToast(
        isRegister 
          ? "Регистрация прошла успешно, но войти не удалось. Попробуйте войти вручную." 
          : "Неверный email или пароль"
      );
      return;
    }

    // Сначала делаем refresh, чтобы Next.js подхватил новые куки сессии
    router.refresh();
    // Затем перенаправляем пользователя в дашборд
    router.push(callbackUrl);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-primary"
            >
              ЛОКАЛЬНАЯ ВИТРИНА
            </Link>
            <p className="mt-2 text-sm text-text-muted">
              {isRegister ? "Регистрация магазина" : "Вход для продавцов"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Дополнительные поля для регистрации */}
            {isRegister && (
              <>
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-text-main">
                    Название магазина
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Например: Одежда ПМР"
                    className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-main outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="instagram" className="text-sm font-medium text-text-main">
                    Instagram username
                  </label>
                  <input
                    id="instagram"
                    type="text"
                    required
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="shop_pmr"
                    className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-main outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* ПОЛЕ: ССЫЛКА НА INSTAGRAM */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="instagramLink" className="text-sm font-medium text-text-main">
                    Ссылка на профиль Instagram
                  </label>
                  <input
                    id="instagramLink"
                    type="url"
                    required
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                    placeholder="https://instagram.com/shop_pmr"
                    className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-main outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-text-main">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@store.com"
                className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-main outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-text-main">
                  Пароль
                </label>
                {!isRegister && (
                  <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline" tabIndex={-1}>
                    Забыли пароль?
                  </Link>
                )}
              </div>
              <input
                id="password"
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-main outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-primary py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              {isLoading 
                ? (isRegister ? "Регистрация..." : "Вход...") 
                : (isRegister ? "Зарегистрировать магазин" : "Войти")}
            </button>
          </form>

          {/* Переключатель Вход/Регистрация */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                // Очищаем поля при переключении
                setName("");
                setInstagram("");
                setInstagramLink(""); // <-- ОЧИЩАЕМ ПОЛЕ ПРИ ПЕРЕКЛЮЧЕНИИ
                setEmail("");
                setPassword("");
              }}
              className="text-sm text-text-muted underline transition-colors hover:text-primary"
            >
              {isRegister
                ? "Уже есть аккаунт? Войти"
                : "Нет аккаунта? Зарегистрировать магазин"}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-text-muted">
            <Link href="/" className="transition-colors hover:text-primary">
              ← Вернуться в витрину
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}