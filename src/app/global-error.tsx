"use client";

import { AlertOctagon, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);
  return (
    <html lang="ru">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
          <div className="mx-auto flex max-w-sm flex-col items-center text-center">
            <AlertOctagon className="h-16 w-16 text-rose-600 mb-6" />
            <h1 className="text-2xl font-bold text-gray-900">
              Критическая ошибка
            </h1>
            <p className="mt-2 text-gray-500">
              Произошел серьезный сбой при загрузке платформы.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-700"
            >
              <RefreshCcw className="h-4 w-4" />
              Перезагрузить платформу
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}