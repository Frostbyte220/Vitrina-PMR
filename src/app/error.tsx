"use client"; // Обязательно для компонентов ошибок

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // В будущем здесь можно отправлять логи в Sentry или другой трекер
    console.error("Поймана ошибка в приложении:", error);
  }, [error]);

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        {/* Иконка ошибки */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 shadow-sm">
          <AlertTriangle className="h-10 w-10 text-rose-600" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Ой, что-то пошло не так!
        </h1>

        <p className="mt-4 text-base text-gray-500">
          Мы уже знаем о проблеме и работаем над её устранением. Возможно, пропало соединение с интернетом или сервер временно недоступен.
        </p>

        {/* Кнопки действий */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()} // Функция Next.js для повторной попытки рендера
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Попробовать снова
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm outline outline-1 outline-gray-200 transition-colors hover:bg-gray-50"
          >
            <Home className="h-4 w-4" />
            На главную
          </Link>
        </div>
      </div>
    </main>
  );
}